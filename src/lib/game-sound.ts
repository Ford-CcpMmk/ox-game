export type ResultSound = "win" | "loss" | "draw";
export type GameSound = "click" | "bot" | "win" | "loss" | "draw";

// Small synthesized chimes avoid downloads and start only after a user gesture.
export function playGameSound(context: AudioContext, sound: ResultSound, delay = 0) {
  const notes: Record<"win" | "loss" | "draw", number[]> = {
    win: [523.25, 659.25, 783.99, 1046.5],
    loss: [392, 329.63, 261.63], draw: [440, 523.25, 440],
  };
  const start = context.currentTime + delay;
  notes[sound].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = start + index * .12;
    const duration = .22;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(.09, time + .008);
    gain.gain.exponentialRampToValueAtTime(.001, time + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
