import type { Difficulty } from "./ox-game";
export const DIFFICULTIES = {
  1: { value: 1, label: "ง่าย", detail: "สุ่มช่อง · เล่นสบาย ๆ", image: "/game-assets/bot-friendly.png" },
  2: { value: 2, label: "ปานกลาง", detail: "เน้นกันคุณชนะ", image: "/game-assets/bot-challenger.png" },
  3: { value: 3, label: "ยาก", detail: "หาจังหวะชนะและกันแพ้", image: "/game-assets/bot-boss.png" },
} as const satisfies Record<Difficulty, { value: Difficulty; label: string; detail: string; image: string }>;
