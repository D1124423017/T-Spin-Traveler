export function canUseDesktopKeyboardEvent(event) {
  return Boolean(event && typeof event.key === "string");
}
