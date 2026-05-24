import { describe, expect, it } from "vitest";
import { clearFullLines, makeBoard } from "../src/tetris/board.js";

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
