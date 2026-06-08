import { formatDamageSources } from "./formatters.js";

export function createResultOverlayModel({
  state,
  message,
  buttons,
  translate,
} = {}) {
  return {
    victory: state.mode === "victory",
    message,
    buttons,
    damageSources: formatDamageSources(
      state.stats?.damageSources || {},
      { translate },
    ),
  };
}
