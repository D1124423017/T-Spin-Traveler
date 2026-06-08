export function getBattleCountdownCue(
  countdownMs,
  {
    durationMs,
    startWindowMs,
  } = {},
) {
  if (countdownMs <= 0) return "";
  if (countdownMs <= startWindowMs) return "START";
  const stepMs = (durationMs - startWindowMs) / 3;
  return String(Math.max(1, Math.ceil((countdownMs - startWindowMs) / stepMs)));
}

export function createBattleCountdownCueReader({
  state,
  durationMs,
  startWindowMs,
} = {}) {
  return () => getBattleCountdownCue(state.countdownMs, {
    durationMs,
    startWindowMs,
  });
}
