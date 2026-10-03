import assert from "node:assert/strict";
import test from "node:test";
import { calculateScore } from "../src/lib/score.ts";

const policy = { resetStreakOnDraw: true, allowNegativeScore: true };

test("three consecutive wins give four points, reset the streak and repeat the bonus cycle", () => {
  let current = { score: 0, winStreak: 0 };
  for (let win = 1; win <= 6; win++) {
    current = calculateScore(current, "win", policy);
    assert.equal(current.score, win + Math.floor(win / 3));
    assert.equal(current.winStreak, win % 3);
    assert.equal(current.bonus, win % 3 === 0 ? 1 : 0);
  }
});

test("loss resets streak and follows the configured score floor", () => {
  const current = { score: 0, winStreak: 2 };
  assert.deepEqual(calculateScore(current, "loss", policy), { score: -1, winStreak: 0, delta: -1, bonus: 0 });
  assert.deepEqual(calculateScore(current, "loss", { ...policy, allowNegativeScore: false }), { score: 0, winStreak: 0, delta: 0, bonus: 0 });
});

test("draw does not change points and follows the configured streak policy", () => {
  const current = { score: 2, winStreak: 2 };
  assert.equal(calculateScore(current, "draw", policy).winStreak, 0);
  const kept = calculateScore(current, "draw", { ...policy, resetStreakOnDraw: false });
  assert.deepEqual(kept, { ...current, delta: 0, bonus: 0 });
  assert.equal(calculateScore(kept, "win", policy).bonus, 1);
});
