export function clampFrameDelta(delta, max = 34) {
  return Math.min(max, Math.max(0, delta || 0));
}
