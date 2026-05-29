import { describe, expect, it } from "vitest";
import {
  canSpawnPiece,
  clearFullLines,
  isBoardTopOut,
  isSpawnBlocked,
  makeBoard,
} from "../src/tetris/board.js";
import { createPiece } from "../src/tetris/pieces.js";

function pushGarbageRowsForTest(board, count, { cols = 10, hole = 9 } = {}) {
  const nextBoard = board.map((row) => row.slice());
  for (let i = 0; i < count; i += 1) {
    nextBoard.shift();
    nextBoard.push(Array.from({ length: cols }, (_, x) => (x === hole ? null : "G")));
  }
  return nextBoard;
}

describe("board line clear", () => {
  it("clears a full row and inserts an empty row at the top", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[20] = Array(10).fill("I");
    board[19][4] = "T";

    const result = clearFullLines(board, { cols: 10, rows: 20, hidden: 2 });

    expect(result.cleared).toBe(1);
    expect(result.lines).toEqual([20]);
    expect(result.board).toHaveLength(22);
    expect(result.board[0]).toEqual(Array(10).fill(null));
    expect(result.board[19][4]).toBe(null);
    expect(result.board[20][4]).toBe("T");
  });
});

describe("board game over checks", () => {
  it("detects spawn collision as a blocked spawn", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][4] = "G";

    expect(isSpawnBlocked(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(true);
    expect(canSpawnPiece(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(false);
  });

  it("does not treat hidden row occupancy alone as top out", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[0][3] = "G";

    expect(isBoardTopOut(board, { hidden: 2 })).toBe(false);
  });

  it("detects top out when the next spawn is blocked", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][4] = "T";

    expect(isBoardTopOut(board, { hidden: 2, spawnPiece: piece })).toBe(true);
  });

  it("does not lock out when hidden cells do not block the next spawn", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][0] = "T";
    board[1][9] = "T";

    expect(isBoardTopOut(board, { hidden: 2, spawnPiece: piece })).toBe(false);
  });

  it("ignores non-playable wall cells for ultimate top out checks", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][0] = "U";
    board[1][9] = "U";

    expect(isBoardTopOut(board, { hidden: 2, ignoredCell: "U", spawnPiece: piece })).toBe(false);
    board[1][4] = "I";
    expect(isBoardTopOut(board, { hidden: 2, ignoredCell: "U", spawnPiece: piece })).toBe(true);
  });

  it("allows hidden row occupancy when the next piece can still spawn", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][0] = "T";
    board[1][9] = "T";

    expect(canSpawnPiece(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(true);
    expect(isBoardTopOut(board, { cols: 10, rows: 20, hidden: 2, spawnPiece: piece })).toBe(false);
  });

  it("keeps true spawn footprint blocks as game over", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][4] = "T";

    expect(canSpawnPiece(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(false);
    expect(isBoardTopOut(board, { cols: 10, rows: 20, hidden: 2, spawnPiece: piece })).toBe(true);
  });

  it("does not top out only because garbage pushes out an occupied hidden row", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[0][0] = "T";

    const afterGarbage = pushGarbageRowsForTest(board, 1);

    expect(canSpawnPiece(afterGarbage, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(true);
    expect(isBoardTopOut(afterGarbage, { cols: 10, rows: 20, hidden: 2, spawnPiece: piece })).toBe(false);
  });

  it("tops out after garbage only when the next spawn is actually blocked", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("O", { x: 4, y: 0 });
    board[1][4] = "T";

    const afterGarbage = pushGarbageRowsForTest(board, 1);

    expect(canSpawnPiece(afterGarbage, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(false);
    expect(isBoardTopOut(afterGarbage, { cols: 10, rows: 20, hidden: 2, spawnPiece: piece })).toBe(true);
  });
});
