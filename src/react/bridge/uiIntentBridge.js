export const REACT_DEBUG_QUERY_FLAG = "reactDebug";

export const REACT_DEBUG_INTENTS = Object.freeze({
  refreshSnapshot: "refreshSnapshot",
  toggleLegacyDebugHud: "toggleLegacyDebugHud",
});

export function isReactDebugEnabled(search = globalThis?.location?.search || "") {
  try {
    const params = new URLSearchParams(search);
    return params.get("debug") === "1" && params.get(REACT_DEBUG_QUERY_FLAG) === "1";
  } catch {
    return false;
  }
}

export function createReactDebugIntentBridge({
  refreshSnapshot = () => null,
  toggleLegacyDebugHud = () => false,
} = {}) {
  function dispatch(intent) {
    const type = typeof intent === "string" ? intent : intent?.type;
    if (type === REACT_DEBUG_INTENTS.refreshSnapshot) {
      return {
        ok: true,
        type,
        value: refreshSnapshot(),
      };
    }
    if (type === REACT_DEBUG_INTENTS.toggleLegacyDebugHud) {
      return {
        ok: true,
        type,
        value: Boolean(toggleLegacyDebugHud()),
      };
    }
    return {
      ok: false,
      reason: "unsupported-intent",
      type: type || "",
    };
  }

  return Object.freeze({ dispatch });
}
