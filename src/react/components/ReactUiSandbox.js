import React, { useEffect, useState } from "react";
import CurrentBuildPanel from "./CurrentBuildPanel.js";
import DebugPanel from "./DebugPanel.js";
import GuideOverlay from "./GuideOverlay.js";
import PauseOverlay from "./PauseOverlay.js";
import ResultOverlay from "./ResultOverlay.js";
import SettingsOverlay from "./SettingsOverlay.js";

const h = React.createElement;

function safeReadSnapshot(readSnapshot) {
  try {
    return readSnapshot?.() || null;
  } catch {
    return null;
  }
}

function renderSandboxOverlay({ dispatchIntent, snapshot }) {
  const overlayKind = snapshot?.ui?.overlayKind || "";
  if (overlayKind === "pause") {
    return h(PauseOverlay, { dispatchIntent, snapshot });
  }
  if (overlayKind === "guide") {
    return h(GuideOverlay, { dispatchIntent, snapshot });
  }
  if (overlayKind === "result") {
    return h(ResultOverlay, { dispatchIntent, snapshot });
  }
  if (overlayKind === "settings") {
    return h(SettingsOverlay, { dispatchIntent, snapshot });
  }
  if (overlayKind === "currentBuild") {
    return h(CurrentBuildPanel, { dispatchIntent, snapshot });
  }
  return null;
}

export default function ReactUiSandbox({
  dispatchIntent,
  readSnapshot,
} = {}) {
  const [snapshot, setSnapshot] = useState(() => safeReadSnapshot(readSnapshot));

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (active) setSnapshot(safeReadSnapshot(readSnapshot));
    };
    refresh();
    const interval = window.setInterval(refresh, 180);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [readSnapshot]);

  return h(React.Fragment, null,
    h(DebugPanel, {
      dispatchIntent,
      readSnapshot,
      snapshot,
    }),
    snapshot && renderSandboxOverlay({ dispatchIntent, snapshot }),
    snapshot?.ui?.fallbackCanvasMode && h("div", {
      className: "tst-react-sandbox-fallback-badge",
      "data-tst-react-ui-fallback": snapshot.ui.fallbackCanvasMode,
    },
      snapshot.labels?.reactSandboxFallback || "Canvas fallback",
    ),
  );
}
