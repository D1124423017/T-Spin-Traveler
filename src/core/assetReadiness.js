// Give complete menu art a chance to arrive on slow connections, while still
// recovering if an image request never settles.
export const ASSET_LOADING_MAX_MS = 15000;

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
    criticalReady,
  } = {},
) {
  if (elapsedMs >= maxMs) return true;
  const loading = summary?.loading || 0;
  const ready = criticalReady ?? (loading === 0);
  return ready && elapsedMs >= minMs;
}
