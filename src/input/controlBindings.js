export function normalizeControlKey(key) {
  if (key === " ") return " ";
  if (typeof key !== "string") return "";
  if (key.length === 1) return key.toLowerCase();
  return key.toLowerCase();
}

export function normalizeControlKeys(value) {
  const source = Array.isArray(value) ? value : (typeof value === "string" ? [value] : []);
  const keys = [];
  for (const key of source) {
    if (typeof key !== "string") continue;
    const normalized = normalizeControlKey(key);
    if (!normalized || keys.includes(normalized)) continue;
    keys.push(normalized);
  }
  return keys;
}

export function normalizeControlsMap(source = {}, {
  controlActions,
  defaultControls,
}) {
  const controls = {};
  for (const { id } of controlActions) {
    const hasSavedValue = Object.prototype.hasOwnProperty.call(source, id);
    const fallback = defaultControls[id] || [];
    const keys = normalizeControlKeys(hasSavedValue ? source[id] : fallback);
    controls[id] = keys.length || hasSavedValue ? keys : normalizeControlKeys(fallback);
  }
  return controls;
}

export function serializeControls(controls, options) {
  const normalized = normalizeControlsMap(controls || {}, options);
  return Object.fromEntries(Object.entries(normalized).map(([id, keys]) => [id, keys.slice()]));
}

export function getControlKeys(action, {
  controls,
  defaultControls,
}) {
  const source = controls || defaultControls;
  const hasValue = Object.prototype.hasOwnProperty.call(source, action);
  return normalizeControlKeys(hasValue ? source[action] : defaultControls[action]);
}

export function getAllControlKeys({
  controlActions,
  controls,
  defaultControls,
}) {
  return controlActions.flatMap(({ id }) => getControlKeys(id, { controls, defaultControls }));
}

export function isActionKey(action, key, options) {
  return getControlKeys(action, options).includes(normalizeControlKey(key));
}

export function bindControl(controls, action, key, {
  controlActions,
  defaultControls,
}) {
  const normalized = normalizeControlKey(key);
  for (const { id } of controlActions) {
    if (id === action) continue;
    controls[id] = getControlKeys(id, {
      controls,
      defaultControls,
    }).filter((existing) => existing !== normalized);
  }
  controls[action] = [normalized];
}
