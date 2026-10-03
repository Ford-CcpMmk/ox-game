"use client";

import { useEffect, useRef, useState } from "react";
import { faChevronDown, faCheck, faLeaf, faBolt, faCrown } from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { DIFFICULTIES } from "@/lib/game-config";
import type { Difficulty } from "@/lib/ox-game";

const levels = [
  { ...DIFFICULTIES[1], icon: faLeaf },
  { ...DIFFICULTIES[2], icon: faBolt },
  { ...DIFFICULTIES[3], icon: faCrown },
] as const;

export function DifficultyPicker({ value, disabled, onChange }: { value: Difficulty; disabled: boolean; onChange: (value: Difficulty) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<Array<HTMLButtonElement | null>>([]);
  const current = levels[value - 1];
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function close() { setOpen(false); trigger.current?.focus(); }
  function show() { setOpen(true); }
  useEffect(() => { if (open) options.current[value - 1]?.focus(); }, [open, value]);

  return <div ref={root} className="ox-level-picker" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <span className="ox-level-caption">ระดับบอท</span>
    <button ref={trigger} type="button" className={`ox-level-trigger level-${value}`} disabled={disabled} aria-label={`ระดับบอท: ${current.label}`} aria-haspopup="menu" aria-expanded={open && !disabled} aria-controls="difficulty-menu" onClick={() => open ? close() : show()} onKeyDown={event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(); }
    }}>
      <span className="ox-level-badge"><UiIcon icon={current.icon} /></span>
      <span>{value} · {current.label}</span>
      <UiIcon icon={faChevronDown} className="ox-level-chevron" />
    </button>
    {open && !disabled && <div id="difficulty-menu" role="menu" aria-label="เลือกระดับบอท" className="ox-level-menu" onKeyDown={event => {
      const index = options.current.indexOf(document.activeElement as HTMLButtonElement);
      if (event.key === "Escape") { event.preventDefault(); close(); }
      else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowDown" ? 1 : 2)) % 3;
        options.current[next]?.focus();
      }
    }}>
      {levels.map((level, index) => <button key={level.value} ref={element => { options.current[index] = element; }} type="button" role="menuitemradio" aria-checked={value === level.value} className={`ox-level-option level-${level.value}`} onClick={() => { onChange(level.value); close(); }}>
        <span className="ox-level-badge"><UiIcon icon={level.icon} /></span>
        <span><strong>{level.value} · {level.label}</strong><small>{level.detail}</small></span>
        {value === level.value && <UiIcon icon={faCheck} className="ox-level-check" />}
      </button>)}
    </div>}
  </div>;
}
