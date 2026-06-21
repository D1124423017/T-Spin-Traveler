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
} = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [snapshot, setSnapshot] = useState(() => safeReadSnapshot(readSnapshot));

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (active) setSnapshot(safeReadSnapshot(readSnapshot));
    };
    refresh();
    const interval = window.setInterval(refresh, 250);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [readSnapshot]);

  const assetPercent = useMemo(() => {
    if (!snapshot?.asset) return 0;
    return snapshot.asset.progress * 100;
  }, [snapshot]);

  const dispatch = (type) => {
    const result = dispatchIntent?.({ type });
    if (type === REFRESH_SNAPSHOT_INTENT || result?.ok) {
      setSnapshot(safeReadSnapshot(readSnapshot));
    }
  };

  if (!snapshot) {
    return h("aside", {
      className: "tst-react-debug-panel",
      "data-tst-react-debug-panel": "true",
    }, "React Debug unavailable");
  }

  return h("aside", {
    className: "tst-react-debug-panel",
    "data-tst-react-debug-panel": "true",
  },
    h("div", { className: "tst-react-debug-header" },
      h("div", null,
        h("p", { className: "tst-react-debug-kicker" }, "React Overlay POC"),
        h("h2", null, "Debug Panel"),
      ),
      h("button", {
        type: "button",
        className: "tst-react-debug-icon-button",
        onClick: () => setCollapsed((value) => !value),
      }, collapsed ? "Show" : "Hide"),
    ),
    !collapsed && h("div", { className: "tst-react-debug-body" },
      h("div", { className: "tst-react-debug-progress" },
        h("span", null, "Assets"),
        h(AnimatedPercent, { value: assetPercent }),
        h("div", { className: "tst-react-debug-progress-track" },
          h("div", {
            className: "tst-react-debug-progress-fill",
            style: { width: `${Math.max(4, Math.min(100, assetPercent))}%` },
          }),
        ),
      ),
      h("div", { className: "tst-react-debug-grid" },
        h(Stat, { label: "Mode", value: snapshot.mode }),
        h(Stat, { label: "Screen", value: snapshot.screen }),
        h(Stat, { label: "Wave", value: snapshot.gameplay.wave }),
        h(Stat, { label: "Active", value: snapshot.gameplay.activePiece ? "yes" : "no" }),
        h(Stat, { label: "Assets", value: `${snapshot.asset.loaded}/${snapshot.asset.total}` }),
        h(Stat, { label: "Errors", value: snapshot.asset.error, tone: snapshot.asset.error ? "danger" : "default" }),
        h(Stat, { label: "Draw age", value: `${snapshot.debug.drawAgeMs}ms` }),
        h(Stat, { label: "DOM layers", value: snapshot.dom.layerCount }),
      ),
      snapshot.debug.drawError && h("p", { className: "tst-react-debug-error" }, snapshot.debug.drawError),
      h("div", { className: "tst-react-debug-actions" },
        h("button", {
          type: "button",
          onClick: () => dispatch(REFRESH_SNAPSHOT_INTENT),
        }, "Refresh"),
        h("button", {
          type: "button",
          onClick: () => dispatch(TOGGLE_LEGACY_DEBUG_HUD_INTENT),
        }, snapshot.debug.legacyHudVisible ? "Hide legacy HUD" : "Show legacy HUD"),
      ),
    ),
  );
}
