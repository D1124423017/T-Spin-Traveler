import { describe, expect, it } from "vitest";
import {
  clampFourWideWellX,
  canSpawnPiece,
  clearFullLines,
  collides,
  getFourWideWellRange,
  getVisiblePieceCells,
  isBoardTopOut,
  isPieceGroundedAboveVisibleBoard,
  isPieceLockedAboveVisibleBoard,
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

  it("detects lock out when a piece locks in hidden rows", () => {
    const hiddenLockPiece = createPiece("T", { x: 3, y: 0 });
    const visibleLockPiece = createPiece("T", { x: 3, y: 2 });

    expect(isPieceLockedAboveVisibleBoard(hiddenLockPiece, { hidden: 2 })).toBe(true);
    expect(isPieceLockedAboveVisibleBoard(visibleLockPiece, { hidden: 2 })).toBe(false);
  });

  it("detects a spawned piece grounded above the visible board", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    const piece = createPiece("T", { x: 3, y: 0 });

    expect(isPieceGroundedAboveVisibleBoard(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(false);
    board[2][4] = "G";
    expect(isPieceGroundedAboveVisibleBoard(board, piece, { cols: 10, rows: 20, hidden: 2 })).toBe(true);
  });
});

describe("board visible piece cell filtering", () => {
  it("clamps a 4-wide well start to the board", () => {
    expect(clampFourWideWellX(9, 4, 10)).toBe(6);
    expect(clampFourWideWellX(-3, 4, 10)).toBe(0);
    expect(getFourWideWellRange({ x: 99, width: 4, cols: 10 })).toEqual({ x: 6, start: 6, end: 10, width: 4 });
  });

  it("keeps a right-side 4-wide guide inside the playable well", () => {
    const well = getFourWideWellRange({ x: 99, width: 4, cols: 10 });
    const piece = createPiece("O", { x: 9, y: 20 });
    const cells = getVisiblePieceCells(piece, { cols: 10, rows: 20, hidden: 2, minCol: well.start, maxCol: well.end });

    expect(cells).toHaveLength(2);
    expect(cells.every((cell) => cell.x >= well.start && cell.x < well.end)).toBe(true);
    expect(cells.every((cell) => cell.x < 10)).toBe(true);
  });

  it("keeps a left-side 4-wide guide from drawing before the playable well", () => {
    const well = getFourWideWellRange({ x: -8, width: 4, cols: 10 });
    const piece = createPiece("O", { x: -1, y: 20 });
    const cells = getVisiblePieceCells(piece, { cols: 10, rows: 20, hidden: 2, minCol: well.start, maxCol: well.end });

    expect(cells).toHaveLength(2);
    expect(cells.every((cell) => cell.x >= well.start && cell.x < well.end)).toBe(true);
    expect(cells.every((cell) => cell.x >= 0)).toBe(true);
  });

  it("returns only cells inside the visible board range", () => {
    const piece = createPiece("O", { x: 9, y: 21 });
    const cells = getVisiblePieceCells(piece, { cols: 10, rows: 20, hidden: 2 });

    expect(cells).toHaveLength(1);
    expect(cells.every((cell) => cell.x >= 0 && cell.x < 10)).toBe(true);
    expect(cells.every((cell) => cell.boardY >= 2 && cell.boardY < 22)).toBe(true);
    expect(cells.every((cell) => cell.y >= 0 && cell.y < 20)).toBe(true);
  });

  it("does not mutate board state or line clear results", () => {
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    board[20] = Array(10).fill("I");
    const before = board.map((row) => row.slice());

    getVisiblePieceCells(createPiece("O", { x: 6, y: 20 }), { cols: 10, rows: 20, hidden: 2, minCol: 3, maxCol: 7 });

    expect(board).toEqual(before);
    expect(clearFullLines(board, { cols: 10, rows: 20, hidden: 2 }).cleared).toBe(1);
  });

  it("keeps 4-wide wall cells as movement blockers without changing line clears", () => {
    const well = getFourWideWellRange({ x: 3, width: 4, cols: 10 });
    const board = makeBoard({ cols: 10, rows: 20, hidden: 2 });
    for (const row of board) {
      for (let x = 0; x < 10; x += 1) {
        if (x < well.start || x >= well.end) row[x] = "U";
      }
    }

    expect(collides(board, createPiece("O", { x: 8, y: 20 }), undefined, undefined, undefined, { cols: 10, rows: 20, hidden: 2 })).toBe(true);
    expect(collides(board, createPiece("O", { x: 4, y: 20 }), undefined, undefined, undefined, { cols: 10, rows: 20, hidden: 2 })).toBe(false);
    board[20][3] = "I";
    board[20][4] = "I";
    board[20][5] = "I";
    board[20][6] = "I";
    expect(clearFullLines(board, { cols: 10, rows: 20, hidden: 2 }).cleared).toBe(1);
  });
});
