import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { SignOutButton } from "@/components/auth/sign-out-button";
export function GameHeader({ soundEnabled, onToggleSound, onClickSound }: { soundEnabled: boolean; onToggleSound: () => void; onClickSound: () => void }) { return (
      <header className="ox-page-header flex items-center justify-between gap-4">
        <div className="ox-brand flex items-center gap-1" role="img" aria-label="OX Game">
          <svg viewBox="0 0 180 90" aria-hidden="true">
            <circle
              cx="45"
              cy="45"
              r="28"
              fill="none"
              stroke="#7bd8b2"
              strokeWidth="24"
            />
            <path
              d="M111 22 158 69M158 22 111 69"
              stroke="#ffad94"
              strokeWidth="25"
              strokeLinecap="round"
            />
          </svg>
          <span>Game</span>
        </div>
        <div className="ox-header-actions flex items-center gap-[10px]">
          <div className="ox-sound-control relative">
            <button
              type="button"
              className="ox-sound-toggle btn"
              aria-describedby="sound-tooltip"
              aria-label={soundEnabled ? "ปิดเสียงเกม" : "เปิดเสียงเกม"}
              aria-pressed={soundEnabled}
              onClick={onToggleSound}
            >
              <UiIcon icon={soundEnabled ? faVolumeHigh : faVolumeXmark} />
            </button>
            <span
              id="sound-tooltip"
              role="tooltip"
              className="ox-sound-tooltip"
            >
              {soundEnabled ? "ปิดเสียงเกม" : "เปิดเสียงเกม"}
            </span>
          </div>
          <SignOutButton onClickSound={onClickSound} />
        </div>
      </header>
); }
