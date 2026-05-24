import { describe, expect, it } from "vitest";
import { makeBoard } from "../src/tetris/board.js";
import { createPiece } from "../src/tetris/pieces.js";
import { detectSpin, isPieceImmobile } from "../src/tetris/spinDetection.js";

function fill(board, cells) {
  for (const [x, y, value = "X"] of cells) board[y][x] = value;
  return board;
}

describe("spin detection", () => {
  it("detects T-Spin only when enough corners are blocked after rotation", () => {
    const board = fill(makeBoard(), [
      [4, 4],
      [6, 4],
      [4, 6],
    ]);
    const piece = createPiece("T", { x: 4, y: 4 });

    expect(detectSpin({ board, piece, lastMoveWasRotate: true })).toBe("full");

    board[4][6] = null;
    expect(detectSpin({ board, piece, lastMoveWasRotate: true })).toBe(null);
  });

  it("detects All-Spin only for truly immobile non-O pieces", () => {
    const board = fill(makeBoard(), [
      [3, 5],
      [5, 5],
      [4, 6],
      [5, 6],
      [4, 3],
      [5, 3],
    ]);
    const piece = createPiece("I", { x: 3, y: 4, rotation: 1 });
    piece.shape = [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];

    expect(isPieceImmobile({ board, piece })).toBe(true);
    expect(detectSpin({ board, piece, lastMoveWasRotate: true })).toBe("all-mini");
  });

  it("does not trigger All-Spin for O pieces", () => {
    const board = makeBoard();
    const piece = createPiece("O", { x: 4, y: 4 });

    expect(isPieceImmobile({ board, piece })).toBe(false);
    expect(detectSpin({ board, piece, lastMoveWasRotate: true })).toBe(null);
  });
});
