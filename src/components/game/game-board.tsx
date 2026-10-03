import { faTrophy, faRobot, faHandshake } from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { FriendlyMark } from "./friendly-mark";
import type { Board, GameSnapshot, GameResult } from "@/lib/ox-game";
export function GameBoard({ board, game, result, finished, pending, playerMove, error, onMove }: { board: Board; game: GameSnapshot | null; result: GameResult; finished: boolean; pending: boolean; playerMove: number | null; error: string | null; onMove: (index: number) => void }) { return (
            <div
              className="ox-clay-board grid w-full grid-cols-3"
              role="group"
              aria-label="กระดาน OX 3 แถว 3 คอลัมน์"
              aria-describedby="game-status"
              aria-busy={pending}
            >
              {finished && game?.scoreDelta != null && playerMove === null ? (
                <div
                  key={`${game.id}-${game.version}`}
                  className={`ox-score-change ${game.scoreDelta > 0 ? "is-gain" : game.scoreDelta < 0 ? "is-loss" : "is-draw"}`}
                  role="status"
                  aria-live="polite"
                >
                  <UiIcon
                    icon={
                      game.scoreDelta > 0
                        ? faTrophy
                        : game.scoreDelta < 0
                          ? faRobot
                          : faHandshake
                    }
                  />
                  <div>
                    <p>
                      {game.scoreDelta > 0
                        ? `+${game.scoreDelta} คะแนน`
                        : game.scoreDelta < 0
                          ? `−${Math.abs(game.scoreDelta)} คะแนน`
                          : "คะแนนไม่เปลี่ยน"}
                    </p>
                    {game.bonus > 0 ? (
                      <span>รวมโบนัสชนะติดต่อกัน +1</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {board.map((cell, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onMove(index)}
                  disabled={
                    Boolean(cell) ||
                    pending ||
                    finished ||
                    !game ||
                    Boolean(error)
                  }
                  aria-label={`แถว ${Math.floor(index / 3) + 1} คอลัมน์ ${(index % 3) + 1}: ${cell ?? "ว่าง"}${result.winningCells.includes(index) ? " อยู่ในแนวที่ชนะ" : ""}`}
                  className={`ox-clay-cell grid place-items-center aspect-square min-w-0 ${result.winningCells.includes(index) ? "ox-clay-cell-winner" : ""}`}
                >
                  {cell ? <FriendlyMark mark={cell} /> : null}
                </button>
              ))}
            </div>
); }
