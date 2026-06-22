import React, { useEffect, useMemo, useState } from "react";
import MainMenuAmbientOverlay from "./MainMenuAmbientOverlay.js";
import MainMenuButton from "./MainMenuButton.js";

const h = React.createElement;

function safeReadSnapshot(readSnapshot) {
  try {
    return readSnapshot?.() || null;
  } catch {
    return null;
  }
}

function splitTitle(title = "") {
  const normalized = String(title || "").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return [normalized, ""];
  return [parts[0], parts.slice(1).join(" ")];
}

export default function MainMenuOverlay({
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
    const interval = window.setInterval(refresh, 120);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [readSnapshot]);

  const titleParts = useMemo(() => splitTitle(snapshot?.title), [snapshot?.title]);
  if (!snapshot?.enabled) return null;

  const selectedAction = snapshot.selectedAction || snapshot.actions?.[0] || {};
  return h("div", {
    className: "tst-main-menu-overlay",
    "data-tst-react-main-menu": "true",
  },
    h(MainMenuAmbientOverlay),
    h("section", {
      className: "tst-main-menu-brand",
      "aria-label": snapshot.title,
    },
      h("h1", { className: "tst-main-menu-title" },
        h("span", null, titleParts[0]),
        titleParts[1] && h("span", null, titleParts[1]),
      ),
      h("div", { className: "tst-main-menu-title-rule" }),
    ),
    h("nav", {
      className: "tst-main-menu-actions",
      "aria-label": snapshot.navigationLabel || snapshot.title,
    },
      snapshot.actions.map((action, index) => h(MainMenuButton, {
        action,
        frames: snapshot.buttonFrames,
        dispatchIntent,
        index,
        key: action.id,
        selected: index === snapshot.selectedIndex,
      })),
    ),
    h("aside", {
      className: "tst-main-menu-description",
      "data-main-menu-description": selectedAction.id || "",
    },
      h("strong", null, selectedAction.label || ""),
      selectedAction.description && h("p", null, selectedAction.description),
    ),
    snapshot.controlHint && h("p", { className: "tst-main-menu-control-hint" }, snapshot.controlHint),
  );
}
