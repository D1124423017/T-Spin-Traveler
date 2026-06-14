export function createDebugUiController({
  allowed = true,
  initialVisible = false,
  onVisibilityChange = () => {},
} = {}) {
  const debugAllowed = Boolean(allowed);
  let visible = debugAllowed && Boolean(initialVisible);

  function setVisible(nextVisible) {
    visible = debugAllowed && Boolean(nextVisible);
    onVisibilityChange(visible);
    return visible;
  }

  return {
    isAllowed: () => debugAllowed,
    isVisible: () => visible,
    setVisible,
    toggle: () => setVisible(!visible),
  };
}

export function handleDebugUiShortcut(
  event,
  toggleDebugUi,
  { enabled = true } = {},
) {
  if (event?.key !== "F1" && event?.code !== "F1") return false;
  if (!enabled) return false;
  if (isTextEntryTarget(event?.target)) return false;
  event.preventDefault?.();
  toggleDebugUi?.();
  return true;
}

export function isTextEntryTarget(target) {
  if (!target || typeof target !== "object") return false;
  if (target.isContentEditable) return true;
  const tagName = String(target.tagName || "").toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}
