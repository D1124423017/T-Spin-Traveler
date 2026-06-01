function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(t) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function easeOutBack(t, overshoot = 1.35) {
  const x = clamp01(t) - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
}

export function getUpgradeOverlayMotion({
  now = 0,
  openedAt = now,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) return { alpha: 1, y: 0, glow: 0 };
  const elapsed = Math.max(0, now - openedAt);
  const reveal = easeOutCubic(elapsed / 260);
  return {
    alpha: reveal,
    y: (1 - reveal) * 14,
    glow: easeOutCubic(elapsed / 520),
  };
}

export function getUpgradeCardMotion({
  now = 0,
  openedAt = now,
  selectedAt = openedAt,
  index = 0,
  selected = false,
  hovered = false,
  dimmed = false,
  confirming = false,
  confirmElapsed = 0,
  confirmDuration = 1,
  reducedMotion = false,
} = {}) {
  const baseAlpha = dimmed ? 0.42 : 1;
  if (reducedMotion) {
    return {
      alpha: baseAlpha,
      y: selected ? -4 : 0,
      scale: selected ? 1.018 : 1,
      glow: selected || hovered ? 1 : 0,
      reveal: 1,
      confirmPulse: confirming ? 1 : 0,
    };
  }

  const elapsed = Math.max(0, now - openedAt - index * 70);
  const reveal = easeOutBack(elapsed / 420, 1.08);
  const selectedElapsed = Math.max(0, now - selectedAt);
  const selectedPop = selected ? Math.sin(Math.min(1, selectedElapsed / 260) * Math.PI) : 0;
  const selectedPulse = selected ? 0.5 + Math.sin(now * 0.006) * 0.5 : 0;
  const confirmT = confirming ? clamp01(confirmElapsed / Math.max(1, confirmDuration)) : 0;
  const confirmPulse = confirming ? Math.sin(confirmT * Math.PI) : 0;
  const hoverLift = hovered ? -3 : 0;
  const selectedLift = selected ? -7 - selectedPop * 2 : 0;
  const confirmLift = confirmPulse * -5;
  const scale = (0.965 + reveal * 0.035)
    + (hovered ? 0.01 : 0)
    + (selected ? 0.018 : 0)
    + selectedPop * 0.012
    + confirmPulse * 0.035;

  return {
    alpha: baseAlpha * clamp01(reveal),
    y: (1 - reveal) * 18 + hoverLift + selectedLift + confirmLift,
    scale,
    glow: clamp01((hovered ? 0.35 : 0) + (selected ? 0.52 + selectedPulse * 0.28 : 0) + confirmPulse * 0.7),
    reveal: clamp01(reveal),
    confirmPulse,
  };
}

export function getUpgradeDetailMotion({
  now = 0,
  selectedAt = now,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) return { alpha: 1, y: 0, shimmer: 0, glow: 0.45 };
  const elapsed = Math.max(0, now - selectedAt);
  const reveal = easeOutCubic(elapsed / 220);
  return {
    alpha: reveal,
    y: (1 - reveal) * 8,
    shimmer: clamp01(elapsed / 520),
    glow: 0.34 + Math.sin(now * 0.005) * 0.08,
  };
}
