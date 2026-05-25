export function getPiecePreviewLayout(shape, x, y, size = 14, boxW = 92, boxH = 58) {
  return {
    offX: x + (boxW - 16 - shape[0].length * size) / 2,
    offY: y + (boxH - 16 - shape.length * size) / 2,
    columns: shape[0].length,
    rows: shape.length,
    size,
    boxW,
    boxH,
  };
}
