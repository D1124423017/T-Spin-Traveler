export const MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS = Object.freeze([
  "main-menu-home-kingdom-background",
  "main-menu-rift-kingdom-background",
  "main-menu-rune-arc-back",
  "main-menu-primary-frame",
  "main-menu-secondary-frame",
  "main-menu-dialogue-frame",
  "hero-idle-canonical",
  "menu-idle-cube-sheet-16",
  "menu-idle-rift-wayfinder-sheet-16",
]);

function normalizeImageRecords(assetApi) {
  const summary = assetApi?.getSummary?.() || assetApi || {};
  return Array.isArray(summary.images) ? summary.images : [];
}

export function getFirstPaintReadiness(
  assetApi = globalThis?.TST_ASSETS,
  {
    requiredImageIds = MAIN_MENU_FIRST_PAINT_REQUIRED_IMAGE_IDS,
  } = {},
) {
  const records = normalizeImageRecords(assetApi);
  const byId = new Map(records.map((record) => [record.id, record]));
  const required = Array.from(requiredImageIds);
  const missing = [];
  const loading = [];
  const loaded = [];
  const errors = [];

  for (const id of required) {
    const record = byId.get(id);
    if (!record) {
      missing.push(id);
      loading.push(id);
    } else if (record.status === "loaded") {
      loaded.push(id);
    } else if (record.status === "error") {
      errors.push(id);
    } else {
      loading.push(id);
    }
  }

  const total = required.length;
  return {
    ready: total > 0 && loaded.length === total && errors.length === 0,
    required,
    missing,
    loading,
    errors,
    loaded: loaded.length,
    error: errors.length,
    total,
    progress: total > 0 ? loaded.length / total : 0,
  };
}

export function isFirstPaintReady(readiness) {
  return readiness?.ready === true;
}
