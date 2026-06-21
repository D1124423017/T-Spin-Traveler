function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - ((1 - t) ** 3);
}

export function getLoadingCountUpProgress({
  targetProgress = 0,
  elapsedMs = 0,
  completionProgress = 0,
  minVisibleMs = 900,
} = {}) {
  const target = clamp01(targetProgress);
  const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const completion = clamp01(completionProgress);
  if (target <= 0) {
    return {
      targetProgress: 0,
      displayProgress: 0,
      displayPercent: 0,
      percentText: "0%",
    };
  }

  const introCatchUp = 0.05 + easeOutCubic(elapsed / minVisibleMs) * 0.95;
  let display = Math.min(target, target * introCatchUp);

  if (completion > 0) {
    display = Math.max(display, 0.92 + easeOutCubic(completion) * 0.08);
  }
  if (completion >= 0.98 || (target >= 1 && elapsed >= minVisibleMs)) {
    display = 1;
  }

  const displayProgress = clamp01(Math.min(1, display));
  const displayPercent = Math.min(100, Math.floor(displayProgress * 100));
  return {
    targetProgress: target,
    displayProgress,
    displayPercent,
    percentText: `${displayPercent}%`,
  };
}
