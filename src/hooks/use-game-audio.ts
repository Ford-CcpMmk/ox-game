"use client";
import { useEffect, useRef, useState } from "react";
import { playGameSound, type GameSound } from "@/lib/game-sound";
export function useGameAudio() {
  const audio = useRef<AudioContext | null>(null);
  const muted = useRef(false);
  const pops = useRef<{
    click: HTMLAudioElement;
    bot: HTMLAudioElement;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  useEffect(() => {
    const click = new Audio("/game-assets/sounds/player-pop.mp3");
    const bot = new Audio("/game-assets/sounds/bot-pop.mp3");
    click.preload = bot.preload = "auto";
    click.load();
    bot.load();
    pops.current = { click, bot };
    return () => {
      click.pause();
      bot.pause();
      pops.current = null;
      void audio.current?.close().catch(() => {});
    };
  }, []);

  function sound(kind: GameSound, delay = 0) {
    if (muted.current) return;
    try {
      const context = audio.current ?? (audio.current = new AudioContext());
      if (kind === "click" || kind === "bot") {
        const pop = pops.current?.[kind];
        if (pop) replayPop(pop);
        if (context.state === "suspended")
          void context.resume().catch(() => {});
        return;
      }
      if (context.state === "suspended") {
        void context
          .resume()
          .then(() => {
            if (!muted.current && context.state === "running")
              playGameSound(context, kind, delay);
          })
          .catch(() => {});
      } else if (context.state === "running")
        playGameSound(context, kind, delay);
    } catch {
      /* Audio support must not interrupt gameplay. */
    }
  }

  function toggleSound() {
    muted.current = soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (soundEnabled) {
      pops.current?.click.pause(); pops.current?.bot.pause();
      void audio.current?.suspend().catch(() => {});
    } else sound("click");
  }
  return { sound, soundEnabled, toggleSound };
}
function replayPop(pop: HTMLAudioElement) {
  pop.currentTime = 0;
  void pop.play().catch(() => {});
}
