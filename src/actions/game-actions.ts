"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { moveGame, newGame, readGame, readScore } from "@/lib/game-server";
import { isDifficulty, type GameResponse } from "@/lib/ox-game";

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
}

export async function startGame(difficulty: unknown = 1): Promise<GameResponse> {
  const id = await userId();
  if (!id) return { game: null, error: "กรุณาเข้าสู่ระบบก่อนเล่น" };
  if (!isDifficulty(difficulty)) return { game: await readGame(id), error: "ระดับความยากไม่ถูกต้อง" };
  return { game: await newGame(id, difficulty), score: await readScore(id) };
}

export async function submitMove(gameId: unknown, version: unknown, index: unknown): Promise<GameResponse> {
  const id = await userId();
  if (!id) return { game: null, error: "กรุณาเข้าสู่ระบบก่อนเล่น" };
  const response = await moveGame(id, gameId, version, index);
  return { ...response, score: await readScore(id) };
}

export async function reloadGame(): Promise<GameResponse> {
  const id = await userId();
  if (!id) return { game: null, error: "กรุณาเข้าสู่ระบบก่อนเล่น" };
  return { game: await readGame(id), score: await readScore(id) };
}
