export function getAssetLoadingSummary(assetApi = globalThis?.TST_ASSETS) {
  const summary = assetApi?.getSummary?.();
  const counts = summary?.counts || {};
  return {
    loading: counts.loading || 0,
    error: counts.error || 0,
    loaded: counts.loaded || 0,
    total: summary?.images?.length || 0,
  };
}

export function isAssetLoadingComplete(
  summary,
  elapsedMs,
  {
    minMs = 0,
    maxMs = Infinity,
    criticalReady = true,
  } = {},
) {
  if (!criticalReady) return false;
  const loading = summary?.loading || 0;
  return (loading === 0 && elapsedMs >= minMs) || elapsedMs >= maxMs;
}
