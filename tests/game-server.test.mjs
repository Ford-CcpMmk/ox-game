import { load } from "./helpers/load-ts.mjs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import * as scoring from "../src/lib/score.ts";
import * as rules from "../src/lib/ox-game.ts";

function fixture() {
  const rows = new Map();
  const players = new Map();
  const prisma = { game: {
    async findUnique({ where }) { return rows.get(where.userId) ?? null; },
    async upsert({ where, create, update }) {
      const row = rows.has(where.userId) ? { ...rows.get(where.userId), ...update } : create;
      rows.set(where.userId, row);
      if (!players.has(where.userId)) players.set(where.userId, { score: 0, winStreak: 0 });
      return row;
    },
    async updateMany({ where, data }) {
      const row = rows.get(where.userId);
      if (!row || row.id !== where.id || row.version !== where.version) return { count: 0 };
      rows.set(where.userId, { ...row, board: data.board, version: row.version + data.version.increment });
      return { count: 1 };
    },
    async update({ where, data }) {
      const row = { ...rows.get(where.userId), ...data };
      rows.set(where.userId, row);
      return row;
    },
  }, user: {
    async findUniqueOrThrow({ where }) { return players.get(where.id); },
    async update({ where, data }) { players.set(where.id, { ...players.get(where.id), ...data }); },
  } };
  let queue = Promise.resolve();
  prisma.$transaction = callback => {
    const next = queue.then(() => callback(prisma));
    queue = next.catch(() => {});
    return next;
  };
  return { rows, players, server: load("../src/lib/game-server.ts", {
    "server-only": {}, "@/lib/prisma": { prisma }, "@/lib/ox-game": rules, "@/lib/score": scoring,
  }) };
}

test("server rejects another player's game, invalid inputs, occupied cells and replayed moves", async () => {
  const { server } = fixture();
  const alice = await server.newGame("alice");
  const bob = await server.newGame("bob");
  assert.ok((await server.moveGame("bob", alice.id, 0, 0)).error);
  assert.equal((await server.readGame("bob")).version, 0);
  for (const index of [-1, 9, 0.5, "0", null, { result: "win" }]) {
    assert.ok((await server.moveGame("alice", alice.id, 0, index)).error);
  }
  const moved = await server.moveGame("alice", alice.id, 0, 4);
  assert.equal(moved.game.version, 1);
  assert.equal(moved.game.board[4], "X");
  assert.ok((await server.moveGame("alice", alice.id, 0, 4)).error);
  assert.ok((await server.moveGame("alice", alice.id, 1, 4)).error);
  assert.equal((await server.readGame("alice")).version, 1);
  assert.equal((await server.readGame("bob")).id, bob.id);
});

test("concurrent requests commit only once and restarting invalidates the old game", async () => {
  const { server } = fixture();
  const initial = await server.newGame("alice");
  const responses = await Promise.all([
    server.moveGame("alice", initial.id, 0, 0),
    server.moveGame("alice", initial.id, 0, 4),
  ]);
  assert.equal(responses.filter(response => !response.error).length, 1);
  assert.equal((await server.readGame("alice")).version, 1);
  const restarted = await server.newGame("alice");
  assert.notEqual(restarted.id, initial.id);
  assert.equal(restarted.version, 0);
  assert.ok((await server.moveGame("alice", initial.id, 1, 8)).error);
  assert.ok((await server.readGame("alice")).board.every(cell => cell === null));
});

test("finished games cannot accept additional moves", async () => {
  const { server, rows } = fixture();
  const game = await server.newGame("alice");
  rows.set("alice", { ...rows.get("alice"), board: "XXXOO...." });
  const response = await server.moveGame("alice", game.id, 0, 5);
  assert.ok(response.error);
  assert.equal(response.game.result.winner, "X");
  assert.equal(response.game.version, 0);
});

test("every server action rejects unauthenticated callers before accessing games", async () => {
  const actions = load("../src/actions/game-actions.ts", {
    "@/lib/ox-game": rules,
    "next/headers": { headers: async () => ({}) },
    "@/lib/auth": { auth: { api: { getSession: async () => null } } },
    "@/lib/game-server": new Proxy({}, { get() { throw new Error("Game accessed without a session"); } }),
  });
  for (const response of [await actions.startGame(), await actions.reloadGame(), await actions.submitMove(randomUUID(), 0, 0)]) {
    assert.equal(response.game, null);
    assert.ok(response.error);
  }
});

test("finished games award points once, including the third-win bonus, and keep scores across restarts", async () => {
  const { server, rows, players } = fixture();
  for (let win = 1; win <= 3; win++) {
    const game = await server.newGame("alice");
    rows.set("alice", { ...rows.get("alice"), board: "XX.OO...." });
    const responses = await Promise.all([
      server.moveGame("alice", game.id, 0, 2), server.moveGame("alice", game.id, 0, 2),
    ]);
    assert.equal(responses.filter(response => !response.error).length, 1);
    assert.equal(players.get("alice").score, win === 3 ? 4 : win);
    const saved = await server.readGame("alice");
    assert.equal(saved.scoreDelta, win === 3 ? 2 : 1);
    assert.equal(saved.bonus, win === 3 ? 1 : 0);
    assert.ok((await server.moveGame("alice", game.id, 1, 8)).error);
  }
  assert.equal(players.get("alice").winStreak, 0);
  const fresh = await server.newGame("alice");
  assert.equal(fresh.scoreDelta, null);
  assert.equal(players.get("alice").score, 4);
});

test("draw and loss reset streak, and loss cannot make points negative", async () => {
  const { server, rows, players } = fixture();
  let game = await server.newGame("alice");
  players.set("alice", { score: 2, winStreak: 2 });
  rows.set("alice", { ...rows.get("alice"), board: "XOXXOOOX." });
  const draw = await server.moveGame("alice", game.id, 0, 8);
  assert.equal(draw.game.scoreDelta, 0);
  assert.equal(players.get("alice").score, 2);
  assert.equal(players.get("alice").winStreak, 0);
  for (const score of [2, 0]) {
    game = await server.newGame("alice", 3);
    players.set("alice", { score, winStreak: 2 });
    rows.set("alice", { ...rows.get("alice"), board: "OO.XX...." });
    const loss = await server.moveGame("alice", game.id, 0, 6);
    assert.equal(loss.game.result.winner, "O");
    assert.equal(players.get("alice").score, Math.max(0, score - 1));
    assert.equal(players.get("alice").winStreak, 0);
  }
});

test("difficulty persists per round and defaults new and legacy games to easy", async () => {
  const { server, rows } = fixture();
  assert.equal((await server.newGame("alice")).difficulty, 1);
  const game = await server.newGame("alice", 2);
  assert.equal(game.difficulty, 2);
  assert.equal((await server.readGame("alice")).difficulty, 2);
  const legacy = { ...rows.get("alice") };
  delete legacy.difficulty;
  rows.set("alice", legacy);
  assert.equal((await server.readGame("alice")).difficulty, 1);
});
