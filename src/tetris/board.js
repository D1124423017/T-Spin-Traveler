export const DEFAULT_COLS = 10;
export const DEFAULT_ROWS = 20;
export const DEFAULT_HIDDEN = 2;

export function makeBoard({ cols = DEFAULT_COLS, rows = DEFAULT_ROWS, hidden = DEFAULT_HIDDEN, fill = null } = {}) {
  return Array.from({ length: rows + hidden }, () => Array(cols).fill(fill));
}

export function collides(board, piece, x = piece.x, y = piece.y, shape = piece.shape, options = {}) {
  const cols = options.cols ?? DEFAULT_COLS;
  const rows = options.rows ?? DEFAULT_ROWS;
  const hidden = options.hidden ?? DEFAULT_HIDDEN;
  const ignoredCell = options.ignoredCell;
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (!shape[r][c]) continue;
      const bx = x + c;
      const by = y + r;
      if (bx < 0 || bx >= cols || by >= rows + hidden) return true;
      if (by >= 0 && isOccupiedCell(board[by][bx], ignoredCell)) return true;
    }
  }
  return false;
}

function isOccupiedCell(cell, ignoredCell) {
  return Boolean(cell && (ignoredCell === undefined || cell !== ignoredCell));
}

export function isSpawnBlocked(board, piece, options = {}) {
  return collides(board, piece, piece.x, piece.y, piece.shape, options);
}

export function canSpawnPiece(board, piece, options = {}) {
  return !isSpawnBlocked(board, piece, options);
}

export function isBoardTopOut(board, options = {}) {
  if (options.spawnPiece) return isSpawnBlocked(board, options.spawnPiece, options);
  if (Array.isArray(options.spawnPieces) && options.spawnPieces.length > 0) {
    return options.spawnPieces.every((piece) => isSpawnBlocked(board, piece, options));
  }
  return false;
}

export function clearFullLines(board, options = {}) {
  const cols = options.cols ?? DEFAULT_COLS;
  const rows = options.rows ?? DEFAULT_ROWS;
  const hidden = options.hidden ?? DEFAULT_HIDDEN;
  const emptyRowFactory = options.emptyRowFactory || (() => Array(cols).fill(null));
  const lines = [];
  for (let y = 0; y < board.length; y += 1) {
    if (board[y].every(Boolean)) lines.push(y);
  }
  if (lines.length === 0) {
    return { board, lines, cleared: 0, perfect: isBoardEmpty(board, options) };
  }
  const lineSet = new Set(lines);
  const nextBoard = board.filter((_, y) => !lineSet.has(y));
  while (nextBoard.length < rows + hidden) nextBoard.unshift(emptyRowFactory());
  return {
    board: nextBoard,
    lines,
    cleared: lines.length,
    perfect: isBoardEmpty(nextBoard, options),
  };
}

export function isBoardEmpty(board, options = {}) {
  const ignoredCell = options.ignoredCell;
  return board.every((row) => row.every((cell) => !cell || (ignoredCell !== undefined && cell === ignoredCell)));
}
