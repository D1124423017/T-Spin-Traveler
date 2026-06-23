import React, { useEffect, useState } from "react";

const h = React.createElement;

function safeReadSnapshot(readSnapshot) {
  try {
    return readSnapshot?.() || null;
  } catch {
    return null;
  }
}

function ProgressRow({
  active = false,
  detail,
  meterClassName = "",
  ready = false,
  ratio = 0,
  title,
  value,
} = {}) {
  const clampedRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
  return h("div", {
    className: [
      "tst-gameplay-hud-row",
      active ? "is-active" : "",
      ready ? "is-ready" : "",
    ].filter(Boolean).join(" "),
  },
    h("div", { className: "tst-gameplay-hud-row-top" },
      h("span", { className: "tst-gameplay-hud-title" }, title),
      h("strong", {
        className: [
          "tst-gameplay-hud-value",
          active ? "is-badge" : "",
        ].filter(Boolean).join(" "),
      }, value),
    ),
    h("div", { className: "tst-gameplay-hud-meter", "aria-hidden": "true" },
      h("span", {
        className: ["tst-gameplay-hud-meter-fill", meterClassName].filter(Boolean).join(" "),
        style: { width: `${Math.round(clampedRatio * 100)}%` },
      }),
    ),
    detail && h("p", { className: "tst-gameplay-hud-detail" }, detail),
  );
}

export default function GameplayHudOverlay({
  readSnapshot,
} = {}) {
  const [snapshot, setSnapshot] = useState(() => safeReadSnapshot(readSnapshot));

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (active) setSnapshot(safeReadSnapshot(readSnapshot));
    };
    refresh();
    const interval = window.setInterval(refresh, 120);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [readSnapshot]);

  if (!snapshot?.enabled) return null;

  return h("div", {
    className: "tst-gameplay-hud-overlay",
    "data-tst-react-gameplay-hud": "true",
  },
    h("div", { className: "tst-gameplay-hud-stack" },
      h("section", {
        className: "tst-gameplay-hud-compact",
        "data-tst-gameplay-hud-compact": "true",
      },
      h(ProgressRow, {
        active: snapshot.fourWide.active,
        detail: snapshot.fourWide.detail,
        meterClassName: "tst-gameplay-hud-meter-fill-ultimate",
        ratio: snapshot.fourWide.ratio,
        ready: snapshot.fourWide.active || snapshot.fourWide.ready,
        title: snapshot.fourWide.title,
        value: snapshot.fourWide.value,
      }),
      h("div", { className: "tst-gameplay-hud-divider", "aria-hidden": "true" }),
      h(ProgressRow, {
        detail: snapshot.upgrade.detail,
        meterClassName: "tst-gameplay-hud-meter-fill-upgrade",
        ratio: snapshot.upgrade.ratio,
        ready: snapshot.upgrade.ready,
        title: snapshot.upgrade.title,
        value: snapshot.upgrade.value,
      }),
      ),
    ),
  );
}
