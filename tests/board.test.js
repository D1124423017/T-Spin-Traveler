import { describe, expect, it } from "vitest";
import {
  canSpawnPiece,
  clearFullLines,
  isBoardTopOut,
  isSpawnBlocked,
  makeBoard,
} from "../src/tetris/board.js";
import { createPiece } from "../src/tetris/pieces.js";

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

  it("detects garbage top out in hidden rows", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[0][3] = "G";

    expect(isBoardTopOut(board, { hidden: 2 })).toBe(true);
  });

  it("detects lock out when a locked piece remains above the visible board", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[1][4] = "T";

    expect(isBoardTopOut(board, { hidden: 2 })).toBe(true);
  });

  it("ignores non-playable wall cells for ultimate top out checks", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[0][0] = "U";
    board[1][9] = "U";

    expect(isBoardTopOut(board, { hidden: 2, ignoredCell: "U" })).toBe(false);
    board[1][4] = "I";
    expect(isBoardTopOut(board, { hidden: 2, ignoredCell: "U" })).toBe(true);
  });
});
