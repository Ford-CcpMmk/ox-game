export type Difficulty = 1 | 2 | 3;
export function isDifficulty(value: unknown): value is Difficulty { return value === 1 || value === 2 || value === 3; }

export type Mark = "X" | "O";
export type Board = Array<Mark | null>;
export type GameResult = {
  winner: Mark | null;
  winningCells: number[];
  draw: boolean;
};

export type GameSnapshot = { id: string; version: number; difficulty: Difficulty; board: Board; result: GameResult; scoreDelta: number | null; bonus: number };
export type GameResponse = { game: GameSnapshot | null; score?: { score: number; winStreak: number }; error?: string };

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

export function createBoard(): Board {
  return Array<Mark | null>(9).fill(null);
}

export function getResult(board: Board): GameResult {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningCells: [a, b, c], draw: false };
    }
  }
  return { winner: null, winningCells: [], draw: board.every(Boolean) };
}

export function playMove(board: Board, index: number, mark: Mark): Board {
  const result = getResult(board);
  if (!Number.isInteger(index) || index < 0 || index > 8 || board[index] || result.winner || result.draw) {
    return board;
  }
  return board.map((cell, position) => position === index ? mark : cell);
}

// Win when possible, otherwise block an immediate loss, then choose a free cell.
export function chooseBotMove(board: Board, random = Math.random, difficulty: Difficulty = 1): number | null {
  const result = getResult(board);
  if (result.winner || result.draw) return null;
  const available = board.flatMap((cell, index) => cell === null ? [index] : []);
  for (const mark of (difficulty === 3 ? ["O", "X"] : difficulty === 2 ? ["X"] : []) as Mark[]) {
    const move = available.find(index => getResult(playMove(board, index, mark)).winner === mark);
    if (move !== undefined) return move;
  }
  return available[Math.floor(random() * available.length)] ?? null;
}

export function playRound(board: Board, index: number, random = Math.random, difficulty: Difficulty = 1): Board {
  const playerBoard = playMove(board, index, "X");
  if (playerBoard === board) return board;
  const botIndex = chooseBotMove(playerBoard, random, difficulty);
  return botIndex === null ? playerBoard : playMove(playerBoard, botIndex, "O");
}
