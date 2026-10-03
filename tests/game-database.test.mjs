import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { load } from "./helpers/load-ts.mjs";
import * as rules from "../src/lib/ox-game.ts";
import * as scoring from "../src/lib/score.ts";

test("real database: difficulty persists and concurrent winning moves score once", { skip: process.env.OX_DATABASE_TESTS !== "1" && process.env.npm_lifecycle_event !== "test:db" }, async () => {
  await import("dotenv/config");
  const { PrismaClient } = await import("../src/generated/prisma/client.ts");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const id = randomUUID();
  const server = load("../src/lib/game-server.ts", {
    "server-only": {}, "node:crypto": { randomUUID },
    "@/lib/prisma": { prisma }, "@/lib/ox-game": rules, "@/lib/score": scoring,
  });
  try {
    await prisma.user.create({ data: { id, name: "Database test", email: `${id}@example.invalid`, score: 0, winStreak: 2 } });
    const game = await server.newGame(id, 2);
    assert.equal((await server.readGame(id)).difficulty, 2);
    await prisma.game.update({ where: { userId: id }, data: { board: "XX.OO...." } });
    const results = await Promise.all([server.moveGame(id, game.id, 0, 2), server.moveGame(id, game.id, 0, 2)]);
    assert.equal(results.filter(result => !result.error).length, 1);
    assert.deepEqual(await server.readScore(id), { score: 2, winStreak: 0 });
    assert.equal((await server.readGame(id)).scoreDelta, 2);
  } finally {
    await prisma.user.deleteMany({ where: { id } });
    await prisma.$disconnect();
  }
});
