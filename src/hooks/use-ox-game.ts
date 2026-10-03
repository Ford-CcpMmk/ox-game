"use client";
import { useRef, useState, useTransition } from "react";
import { submitMove } from "@/actions/game-actions";
import type { GameSnapshot, GameResponse, Difficulty } from "@/lib/ox-game";
import type { PlayerScore } from "@/lib/score";
import type { GameSound } from "@/lib/game-sound";
export function useOxGame(initialGame: GameSnapshot | null, initialScore: PlayerScore, sound: (kind: GameSound, delay?: number) => void) {
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialGame?.difficulty ?? 1,
  );
  const [score, setScore] = useState(initialScore);
  const [game, setGame] = useState(initialGame);
  const [error, setError] = useState<string | null>(null);
  const [playerMove, setPlayerMove] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);

  const result = game?.result ?? {
    winner: null,
    winningCells: [],
    draw: false,
  };
  const finished = Boolean(result.winner || result.draw);
  const board = (game?.board ?? Array<null>(9).fill(null)).map((cell, index) =>
    index === playerMove ? "X" : cell,
  );

  function request(action: () => Promise<GameResponse>, index?: number) {
    if (busy.current) return;
    busy.current = true;
    sound("click");
    setError(null);
    setPlayerMove(index ?? null);
    startTransition(async () => {
      try {
        // Show the player's move immediately; reveal the server result after a short pause.
        const [response] = await Promise.all([
          action(),
          index === undefined
            ? Promise.resolve()
            : new Promise<void>((resolve) => window.setTimeout(resolve, 600)),
        ]);
        setGame(response.game);
        if (index !== undefined && !response.error && response.game) {
          const botMoved = response.game.board.some(
            (cell, cellIndex) => cell === "O" && game?.board[cellIndex] !== "O",
          );
          if (botMoved) sound("bot");
          const outcome = response.game.result;
          if (outcome.winner || outcome.draw)
            sound(
              outcome.winner === "X"
                ? "win"
                : outcome.winner === "O"
                  ? "loss"
                  : "draw",
              botMoved ? 0.16 : 0,
            );
        }
        if (response.score) setScore(response.score);
        setError(response.error ?? null);
      } catch {
        setError("เชื่อมต่อไม่สำเร็จ กดโหลดกระดานล่าสุดก่อนลองอีกครั้ง");
      } finally {
        setPlayerMove(null);
        busy.current = false;
      }
    });
  }

  function move(index: number) {
    if (!game || finished || board[index]) return;
    request(() => submitMove(game.id, game.version, index), index);
  }

  const selectedDifficulty = game && !finished ? game.difficulty : difficulty;
  const status =
    playerMove !== null
      ? "บอทกำลังคิด..."
      : pending
        ? "กำลังอัปเดตเกม..."
        : result.winner === "X"
          ? "คุณชนะ!"
          : result.winner === "O"
            ? "บอทชนะ ลองใหม่อีกครั้งนะ"
            : result.draw
              ? "เสมอ!"
              : !game
                ? "กดเริ่มเกมเพื่อเล่น"
                : "ตาของคุณ เลือกช่องเพื่อลง X";

  return { difficulty, setDifficulty, score, game, error, playerMove, pending, result, finished, board, move, request, selectedDifficulty, status };
}
