import React, { useEffect, useMemo, useState } from "react";

const h = React.createElement;
const REFRESH_SNAPSHOT_INTENT = "refreshSnapshot";
const TOGGLE_LEGACY_DEBUG_HUD_INTENT = "toggleLegacyDebugHud";

function safeReadSnapshot(readSnapshot) {
  try {
    return readSnapshot?.() || null;
  } catch {
    return null;
  }
}

function Stat({ label, value, tone = "default" }) {
  return h("div", { className: `tst-react-debug-stat tst-react-debug-stat-${tone}` },
    h("span", { className: "tst-react-debug-stat-label" }, label),
    h("strong", { className: "tst-react-debug-stat-value" }, value),
  );
}

function AnimatedPercent({ value }) {
  const target = Math.max(0, Math.min(100, Math.round(value)));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let active = true;
    const start = displayValue;
    const end = Math.max(start, target);
    const startedAt = performance.now();
    const duration = 420;

    function tick(now) {
      if (!active) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return h("span", { className: "tst-react-debug-countup" }, `${displayValue}%`);
}

export default function DebugPanel({
  dispatchIntent,
  readSnapshot,
  snapshot: providedSnapshot = null,
} = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [snapshot, setSnapshot] = useState(() => safeReadSnapshot(readSnapshot));

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (active && !providedSnapshot) setSnapshot(safeReadSnapshot(readSnapshot));
    };
    refresh();
    const interval = window.setInterval(refresh, 250);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [providedSnapshot, readSnapshot]);

  const renderedSnapshot = providedSnapshot || snapshot;
  const labels = renderedSnapshot?.labels || {};

  const assetPercent = useMemo(() => {
    if (!renderedSnapshot?.asset) return 0;
    return renderedSnapshot.asset.progress * 100;
  }, [renderedSnapshot]);

  const dispatch = (type) => {
    const result = dispatchIntent?.({ type });
    if (type === REFRESH_SNAPSHOT_INTENT || result?.ok) {
      setSnapshot(safeReadSnapshot(readSnapshot));
    }
  };

  if (!renderedSnapshot) {
    return h("aside", {
      className: "tst-react-debug-panel",
      "data-tst-react-debug-panel": "true",
    }, labels.reactSandboxUnavailable || "React Debug unavailable");
  }

  return h("aside", {
    className: "tst-react-debug-panel",
    "data-tst-react-debug-panel": "true",
  },
    h("div", { className: "tst-react-debug-header" },
      h("div", null,
        h("p", { className: "tst-react-debug-kicker" }, labels.reactSandboxKicker || "React Overlay POC"),
        h("h2", null, labels.reactSandboxDebugPanel || "Debug Panel"),
      ),
      h("button", {
        type: "button",
        className: "tst-react-debug-icon-button",
        onClick: () => setCollapsed((value) => !value),
      }, collapsed ? labels.reactSandboxShow || "Show" : labels.reactSandboxHide || "Hide"),
    ),
    !collapsed && h("div", { className: "tst-react-debug-body" },
      h("div", { className: "tst-react-debug-progress" },
        h("span", null, labels.reactSandboxAssets || "Assets"),
        h(AnimatedPercent, { value: assetPercent }),
        h("div", { className: "tst-react-debug-progress-track" },
          h("div", {
            className: "tst-react-debug-progress-fill",
            style: { width: `${Math.max(4, Math.min(100, assetPercent))}%` },
          }),
        ),
      ),
      h("div", { className: "tst-react-debug-grid" },
        h(Stat, { label: labels.reactSandboxMode || "Mode", value: renderedSnapshot.mode }),
        h(Stat, { label: labels.reactSandboxScreen || "Screen", value: renderedSnapshot.screen }),
        h(Stat, { label: labels.waveLabel || "Wave", value: renderedSnapshot.gameplay.wave }),
        h(Stat, { label: labels.reactSandboxActive || "Active", value: renderedSnapshot.gameplay.activePiece ? labels.on : labels.off }),
        h(Stat, { label: labels.reactSandboxAssets || "Assets", value: `${renderedSnapshot.asset.loaded}/${renderedSnapshot.asset.total}` }),
        h(Stat, { label: labels.reactSandboxErrors || "Errors", value: renderedSnapshot.asset.error, tone: renderedSnapshot.asset.error ? "danger" : "default" }),
        h(Stat, { label: labels.reactSandboxDrawAge || "Draw age", value: `${renderedSnapshot.debug.drawAgeMs}ms` }),
        h(Stat, { label: labels.reactSandboxDomLayers || "DOM layers", value: renderedSnapshot.dom.layerCount }),
      ),
      renderedSnapshot.debug.drawError && h("p", { className: "tst-react-debug-error" }, renderedSnapshot.debug.drawError),
      h("div", { className: "tst-react-debug-actions" },
        h("button", {
          type: "button",
          onClick: () => dispatch(REFRESH_SNAPSHOT_INTENT),
        }, labels.reactSandboxRefresh || "Refresh"),
        h("button", {
          type: "button",
          onClick: () => dispatch(TOGGLE_LEGACY_DEBUG_HUD_INTENT),
        }, renderedSnapshot.debug.legacyHudVisible
          ? labels.reactSandboxHideLegacyHud || "Hide legacy HUD"
          : labels.reactSandboxShowLegacyHud || "Show legacy HUD"),
      ),
    ),
  );
}
