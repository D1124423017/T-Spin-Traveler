export function getPiecePreviewLayout(shape, x, y, size = 14, boxW = 92, boxH = 58) {
  let minRow = shape.length;
  let maxRow = -1;
  let minColumn = shape[0]?.length || 0;
  let maxColumn = -1;
  for (let row = 0; row < shape.length; row += 1) {
    for (let column = 0; column < shape[row].length; column += 1) {
      if (!shape[row][column]) continue;
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minColumn = Math.min(minColumn, column);
      maxColumn = Math.max(maxColumn, column);
    }
  }
  const hasBlocks = maxRow >= minRow && maxColumn >= minColumn;
  const rows = hasBlocks ? maxRow - minRow + 1 : 0;
  const columns = hasBlocks ? maxColumn - minColumn + 1 : 0;
  return {
    offX: Math.round(x + (boxW - columns * size) / 2),
    offY: Math.round(y + (boxH - rows * size) / 2),
    minRow: hasBlocks ? minRow : 0,
    minColumn: hasBlocks ? minColumn : 0,
    columns,
    rows,
    size,
    boxW,
    boxH,
  };
}
