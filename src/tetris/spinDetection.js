import { collides } from "./board.js";

export function isPieceImmobile({ board, piece, cols = 10, rows = 20, hidden = 2 }) {
  if (!piece || piece.type === "O") return false;
  const options = { cols, rows, hidden };
  return (
    collides(board, piece, piece.x - 1, piece.y, piece.shape, options) &&
    collides(board, piece, piece.x + 1, piece.y, piece.shape, options) &&
    collides(board, piece, piece.x, piece.y + 1, piece.shape, options) &&
    collides(board, piece, piece.x, piece.y - 1, piece.shape, options)
  );
}

export function countTCorners({ board, piece, cols = 10, rows = 20, hidden = 2 }) {
  const cx = piece.x + 1;
  const cy = piece.y + 1;
  const corners = [
    [cx - 1, cy - 1],
    [cx + 1, cy - 1],
    [cx - 1, cy + 1],
    [cx + 1, cy + 1],
  ];
  let blocked = 0;
  for (const [x, y] of corners) {
    if (x < 0 || x >= cols || y >= rows + hidden) blocked += 1;
    else if (y >= 0 && board[y][x]) blocked += 1;
  }
  return blocked;
}

export function detectSpin({
  board,
  piece,
  lastMoveWasRotate,
  lastRotationKind = null,
  lastKickIndex = null,
  cols = 10,
  rows = 20,
  hidden = 2,
}) {
  if (!lastMoveWasRotate || !piece) return null;
  if (piece.type === "O") return null;
  if (piece.type !== "T") {
    return isPieceImmobile({ board, piece, cols, rows, hidden }) ? "all-mini" : null;
  }

  const blocked = countTCorners({ board, piece, cols, rows, hidden });
  if (blocked >= 3) return "full";

  const immobile = isPieceImmobile({ board, piece, cols, rows, hidden });
  const usedKick = Number.isInteger(lastKickIndex) && lastKickIndex > 0;
  const miniCandidate = blocked === 2 && (immobile || usedKick || lastRotationKind === "180");
  return miniCandidate ? "mini" : null;
}
