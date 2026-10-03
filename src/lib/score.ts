export type PlayerScore = { score: number; winStreak: number };
export type ScorePolicy = { resetStreakOnDraw: boolean; allowNegativeScore: boolean };
export type ScoreUpdate = PlayerScore & { delta: number; bonus: number };

export function calculateScore(
  current: PlayerScore,
  outcome: "win" | "loss" | "draw",
  policy: ScorePolicy,
): ScoreUpdate {
  if (outcome === "win") {
    const streak = current.winStreak + 1;
    const bonus = streak === 3 ? 1 : 0;
    return { score: current.score + 1 + bonus, winStreak: bonus ? 0 : streak, delta: 1 + bonus, bonus };
  }
  if (outcome === "loss") {
    const score = policy.allowNegativeScore ? current.score - 1 : Math.max(0, current.score - 1);
    return { score, winStreak: 0, delta: score - current.score, bonus: 0 };
  }
  return { score: current.score, winStreak: policy.resetStreakOnDraw ? 0 : current.winStreak, delta: 0, bonus: 0 };
}
