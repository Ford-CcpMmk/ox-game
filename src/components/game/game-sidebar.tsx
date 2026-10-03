import Image from "next/image";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { DifficultyPicker } from "@/components/game/difficulty-picker";
import { FriendlyMark } from "./friendly-mark";
import { DIFFICULTIES } from "@/lib/game-config";
import type { Difficulty } from "@/lib/ox-game";
import type { PlayerScore } from "@/lib/score";
export function GameSidebar({ score, difficulty, difficultyDisabled, onDifficultyChange }: { score: PlayerScore; difficulty: Difficulty; difficultyDisabled: boolean; onDifficultyChange: (level: Difficulty) => void }) { return (
        <aside className="ox-companion" aria-label="คะแนนและเพื่อนคู่เล่น">
          <div className="ox-mascot">
            <Image
              src={DIFFICULTIES[difficulty].image}
              alt={`หุ่นยนต์คู่เล่นระดับ${DIFFICULTIES[difficulty].label}`}
              fill
              sizes="(max-width: 767px) 1px, (max-width: 1200px) 35vw, 370px"
              className="object-contain"
            />
          </div>
          <DifficultyPicker
            value={difficulty}
            disabled={
              difficultyDisabled
            }
            onChange={onDifficultyChange}
          />
          <div className="ox-score-panels grid" aria-label="คะแนนของคุณ">
            <div className="ox-score-card">
              <span
                className="ox-score-icon ox-score-icon-gold"
                aria-hidden="true"
              >
                <Image
                  src="/game-assets/trophy.png"
                  alt=""
                  width={60}
                  height={60}
                />
              </span>
              <div className="ox-score-details">
                <h2>คะแนนรวม</h2>
                <p className="ox-score-number">{score.score}</p>
              </div>
            </div>
            <div className="ox-score-card ox-streak-card flex-wrap">
              <span
                className="ox-score-icon ox-score-icon-peach"
                aria-hidden="true"
              >
                <Image
                  src="/game-assets/flame.png"
                  alt=""
                  width={60}
                  height={60}
                />
              </span>
              <div className="ox-score-details">
                <h2>ชนะติดต่อกัน</h2>
                <p className="ox-score-number">
                  {score.winStreak}
                  <span className="ox-streak-target">/ 3</span>
                </p>
                <div className="ox-streak-dots flex" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={i < score.winStreak ? "is-filled" : ""}
                    />
                  ))}
                </div>
              </div>
              <p className="ox-bonus-hint">
                <UiIcon icon={faGift} />
                <span className="ox-bonus-full">
                  ชนะอีก {3 - score.winStreak} ครั้ง รับโบนัส +1
                </span>
                <span className="ox-bonus-short">
                  อีก {3 - score.winStreak} ครั้ง โบนัส +1
                </span>
              </p>
            </div>
          </div>
          <div className="ox-player-key">
            <span>
              <FriendlyMark mark="X" /> คุณ (X)
            </span>
            <span>
              <FriendlyMark mark="O" /> บอท (O)
            </span>
          </div>
        </aside>
); }
