export function boardPixelRect({ x, y, cols, rows, tile }) {
  return { x, y, w: cols * tile, h: rows * tile };
}
