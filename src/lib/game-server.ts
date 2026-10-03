import "server-only";

import { calculateScore, type PlayerScore } from "@/lib/score";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getResult, playRound, isDifficulty, type Difficulty, type Board, type GameSnapshot, type GameResponse } from "@/lib/ox-game";

function snapshot(game: { id: string; version: number; difficulty?: number; board: string; scoreDelta: number | null; bonus: number }): GameSnapshot {
  const board: Board = [...game.board].map(cell => cell === "." ? null : cell as "X" | "O");
  return { id: game.id, version: game.version, difficulty: isDifficulty(game.difficulty) ? game.difficulty : 1, board, result: getResult(board), scoreDelta: game.scoreDelta, bonus: game.bonus };
}

export async function readGame(userId: string): Promise<GameSnapshot | null> {
  const game = await prisma.game.findUnique({ where: { userId } });
  return game ? snapshot(game) : null;
}

export async function newGame(userId: string, difficulty: Difficulty = 1): Promise<GameSnapshot> {
  const data = { id: randomUUID(), board: ".........", difficulty, version: 0, scoreDelta: null, bonus: 0 };
  const game = await prisma.game.upsert({
    where: { userId }, create: { ...data, userId }, update: data,
  });
  return snapshot(game);
}

export async function moveGame(userId: string, id: unknown, version: unknown, index: unknown): Promise<GameResponse> {
  if (typeof id !== "string" || id.length > 64 || typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 8) {
    return { game: await readGame(userId), error: "ข้อมูลการเดินไม่ถูกต้อง" };
  }
  const game = await readGame(userId);
  if (!game || game.id !== id || game.version !== version) {
    return { game, error: "เกมเปลี่ยนแล้ว อัปเดตกระดานให้ล่าสุด กรุณาเลือกช่องอีกครั้ง" };
  }
  const board = playRound(game.board, index, Math.random, game.difficulty);
  if (board === game.board) return { game, error: "ลงช่องนี้ไม่ได้ หรือเกมจบแล้ว" };
  const result = getResult(board);
  const finished = Boolean(result.winner || result.draw);
  // Compare-and-swap the game and update points in the same transaction.
  const committed = await prisma.$transaction(async tx => {
    const saved = await tx.game.updateMany({
      where: { userId, id, version },
      data: { board: board.map(cell => cell ?? ".").join(""), version: { increment: 1 } },
    });
    if (saved.count !== 1) return false;
    if (finished) {
      const player = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { score: true, winStreak: true } });
      const update = calculateScore(player, result.winner === "X" ? "win" : result.winner === "O" ? "loss" : "draw", {
        resetStreakOnDraw: true, allowNegativeScore: false,
      });
      await tx.user.update({ where: { id: userId }, data: { score: update.score, winStreak: update.winStreak } });
      await tx.game.update({ where: { userId }, data: { scoreDelta: update.delta, bonus: update.bonus } });
    }
    return true;
  });
  return {
    game: await readGame(userId),
    ...(committed ? {} : { error: "เกมเปลี่ยนแล้ว กรุณาเลือกช่องอีกครั้ง" }),
  };
}

export async function readScore(userId: string): Promise<PlayerScore> {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { score: true, winStreak: true } });
}
