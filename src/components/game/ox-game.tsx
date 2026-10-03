"use client";

import "@/styles/ox-game.css";
import {
  faRotateRight,
  faUser,
  faRobot,
  faTrophy,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { reloadGame, startGame } from "@/actions/game-actions";
import { useOxGame } from "@/hooks/use-ox-game";
import { useGameAudio } from "@/hooks/use-game-audio";
import { GameHeader } from "./game-header";
import { GameSidebar } from "./game-sidebar";
import { GameBoard } from "./game-board";
import type { PlayerScore } from "@/lib/score";
import type { GameSnapshot } from "@/lib/ox-game";

export function OxGame({
  initialGame,
  initialScore,
  playerName,
}: {
  initialGame: GameSnapshot | null;
  initialScore: PlayerScore;
  playerName: string;
}) {
  const { sound, soundEnabled, toggleSound } = useGameAudio();
  const { difficulty, setDifficulty, score, game, error, playerMove, pending, result, finished, board, move, request, selectedDifficulty, status } = useOxGame(initialGame, initialScore, sound);
  return (
    <>
      <GameHeader soundEnabled={soundEnabled} onToggleSound={toggleSound} onClickSound={() => sound("click")} />
      <section className="ox-room" aria-labelledby="game-heading">
        <div className="ox-game-area min-w-0">
          <div className="ox-greeting">
            <h1 id="game-heading">สวัสดี {playerName}!</h1>
            <p>มาเล่น OX กับบอทกันเถอะ</p>
          </div>
          <div className="ox-board-area relative flex flex-col items-center">
            <p
              id="game-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="ox-turn-pill"
            >
              <UiIcon
                icon={
                  playerMove !== null
                    ? faRobot
                    : result.winner === "X"
                      ? faTrophy
                      : result.winner === "O"
                        ? faRobot
                        : result.draw
                          ? faHandshake
                          : faUser
                }
              />
              {status}
            </p>
            <GameBoard board={board} game={game} result={result} finished={finished} pending={pending} playerMove={playerMove} error={error} onMove={move} />
            <button
              type="button"
              className={`btn ox-new-game${!game ? " ox-first-game" : ""}`}
              disabled={
                pending ||
                Boolean(game && game.board.every((cell) => cell === null))
              }
              onClick={() => request(() => startGame(difficulty))}
            >
              {game ? <UiIcon icon={faRotateRight} /> : null}
              {!game ? "เริ่มเกมครั้งแรกกัน!" : finished ? "เล่นอีกครั้ง" : "เริ่มเกมใหม่"}
            </button>
            {error ? (
              <div className="ox-error">
                <p role="alert">{error}</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={pending}
                  onClick={() => request(reloadGame)}
                >
                  โหลดกระดานล่าสุด
                </button>
              </div>
            ) : null}
            <p className="ox-rules">
              ชนะ +1 · แพ้ −1 (ต่ำสุด 0) · เสมอไม่เสียคะแนน
              <br />
              แพ้หรือเสมอ เริ่มนับชนะติดต่อกันใหม่
            </p>
          </div>
        </div>
        <GameSidebar score={score} difficulty={selectedDifficulty} difficultyDisabled={pending || Boolean(game && !finished && game.board.some(Boolean))} onDifficultyChange={level => {
          setDifficulty(level);
          if (game && !finished && game.board.every(cell => cell === null) && game.difficulty !== level) request(() => startGame(level));
        }} />
      </section>
    </>
  );
}
