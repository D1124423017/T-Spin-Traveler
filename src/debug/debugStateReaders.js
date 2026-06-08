export function readActivePieceDebugInfo(activePiece) {
  if (!activePiece) return null;
  return {
    type: activePiece.type,
    x: activePiece.x,
    y: activePiece.y,
  };
}

export function readHiddenRowsDebugInfo(
  board,
  hiddenRowCount,
  rowHasPlayableCells,
) {
  const hiddenRows = board.slice(0, hiddenRowCount);
  return {
    occupied: hiddenRows.some(rowHasPlayableCells),
    rows: hiddenRows.map(rowHasPlayableCells),
  };
}
