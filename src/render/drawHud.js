export function hpRatio(value, max) {
  return max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
}
