import assert from "node:assert/strict";
import test from "node:test";
import { chooseBotMove, createBoard, getResult, playMove, playRound, WINNING_LINES } from "../src/lib/ox-game.ts";

test("detects all winning lines for both players", () => {
  for (const mark of ["X", "O"]) {
    for (const line of WINNING_LINES) {
      const board = createBoard();
      line.forEach(index => { board[index] = mark; });
      assert.deepEqual(getResult(board), { winner: mark, winningCells: [...line], draw: false });
    }
  }
});

test("a server round stops at a player win or draw and otherwise plays exactly one bot move", () => {
  const won = playRound(["X", "X", null, "O", "O", null, null, null, null], 2);
  assert.equal(getResult(won).winner, "X");
  assert.equal(won[5], null);
  const draw = playRound(["X", "O", "X", "X", "O", "O", "O", "X", null], 8);
  assert.equal(getResult(draw).draw, true);
  const round = playRound(createBoard(), 4, () => 0);
  assert.equal(round.filter(cell => cell === "X").length, 1);
  assert.equal(round.filter(cell => cell === "O").length, 1);
  assert.equal(round[4], "X");
  assert.equal(playRound(won, 5), won);
});

test("distinguishes a draw from a win on the final cell", () => {
  assert.equal(getResult(["X", "O", "X", "X", "O", "O", "O", "X", "X"]).draw, true);
  assert.deepEqual(getResult(["X", "O", "X", "O", "X", "O", "X", "X", "O"]), {
    winner: "X", winningCells: [2, 4, 6], draw: false,
  });
});

test("rejects occupied, invalid and finished-game moves without mutating the board", () => {
  const empty = createBoard();
  const board = playMove(empty, 0, "X");
  assert.equal(empty[0], null);
  assert.equal(board[0], "X");
  for (const index of [0, -1, 9, 0.5, NaN]) assert.equal(playMove(board, index, "O"), board);
  const won = ["X", "X", "X", "O", "O", null, null, null, null];
  assert.equal(playMove(won, 5, "O"), won);
  assert.equal(chooseBotMove(won), null);
  const draw = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  assert.equal(playMove(draw, 0, "O"), draw);
  assert.equal(chooseBotMove(draw), null);
});

test("bot wins before blocking, blocks a loss and chooses only free cells", () => {
  assert.equal(chooseBotMove(["O", "O", null, "X", "X", null, "X", null, null], Math.random, 3), 2);
  assert.equal(chooseBotMove(["X", "X", null, "O", null, null, null, null, null], Math.random, 3), 2);
  const board = ["X", null, null, null, "O", null, null, null, null];
  for (const random of [0, 0.2, 0.5, 0.999]) {
    assert.equal(board[chooseBotMove(board, () => random)], null);
  }
});

test("easy randomizes, medium blocks first, hard wins first", () => {
  const board = ["X", "X", null, "O", "O", null, null, null, null];
  assert.equal(chooseBotMove(board, () => .99, 1), 8);
  assert.equal(chooseBotMove(board, () => .99, 2), 2);
  assert.equal(chooseBotMove(board, () => .99, 3), 5);
  const quiet = ["X", null, null, null, "O", null, null, null, null];
  assert.equal(chooseBotMove(quiet, () => .99, 2), 8);
});
