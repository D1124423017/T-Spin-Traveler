import React, { useState } from "react";

const h = React.createElement;

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const CANVAS_BUTTON_LAYOUT = Object.freeze({
  start: Object.freeze({ cx: 1030, cy: 144, rotation: 0.004 }),
  mainStage: Object.freeze({ cx: 1018, cy: 229, rotation: -0.006 }),
  equipment: Object.freeze({ cx: 1004, cy: 314, rotation: 0.005 }),
  metaUpgrade: Object.freeze({ cx: 990, cy: 399, rotation: -0.004 }),
  guide: Object.freeze({ cx: 974, cy: 484, rotation: 0.006 }),
  settings: Object.freeze({ cx: 958, cy: 569, rotation: -0.005 }),
});
const FOCUS_SIZE = Object.freeze({ w: 400, h: 92 });
const IDLE_SIZE = Object.freeze({ w: 326, h: 54 });

function clampMagnetOffset(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-3, Math.min(3, value));
}

function toPercent(value, base) {
  return `${((value / base) * 100).toFixed(4)}%`;
}

function getButtonStyle(actionId, selected, magnet) {
  const anchor = CANVAS_BUTTON_LAYOUT[actionId] || CANVAS_BUTTON_LAYOUT.start;
  const size = selected ? FOCUS_SIZE : IDLE_SIZE;
  return {
    "--button-opacity": selected ? 1 : 0.72,
    "--button-rotation": selected ? "0rad" : `${anchor.rotation}rad`,
    "--magnet-x": `${magnet.x}px`,
    "--magnet-y": `${magnet.y}px`,
    height: toPercent(size.h, BASE_HEIGHT),
    left: toPercent(anchor.cx - size.w / 2, BASE_WIDTH),
    top: toPercent(anchor.cy - size.h / 2, BASE_HEIGHT),
    width: toPercent(size.w, BASE_WIDTH),
  };
}

export default function MainMenuButton({
  action,
  dispatchIntent,
  frames = {},
  index = 0,
  selected = false,
} = {}) {
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const disabled = action?.enabled === false;

  const dispatch = (type) => {
    if (!action?.id || disabled) return;
    dispatchIntent?.({
      type,
      actionId: action.id,
      index,
    });
  };

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMagnet({
      x: clampMagnetOffset((event.clientX - centerX) / 32),
      y: clampMagnetOffset((event.clientY - centerY) / 34),
    });
  };

  const resetMagnet = () => setMagnet({ x: 0, y: 0 });
  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.code !== "Space") return;
    event.preventDefault();
    event.stopPropagation();
    dispatch("activateMenuAction");
  };
  const frameSrc = selected ? frames.primary : frames.secondary;

  return h("button", {
    type: "button",
    className: [
      "tst-main-menu-button",
      selected ? "is-selected" : "",
      disabled ? "is-disabled" : "",
      frameSrc ? "has-frame" : "no-frame",
    ].filter(Boolean).join(" "),
    "data-main-menu-action": action?.id || "",
    "data-main-menu-selected": selected ? "true" : "false",
    disabled,
    onClick: () => dispatch("activateMenuAction"),
    onFocus: () => dispatch("hoverMenuAction"),
    onPointerEnter: () => dispatch("hoverMenuAction"),
    onPointerLeave: resetMagnet,
    onPointerMove: handlePointerMove,
    onKeyDown: handleKeyDown,
    style: {
      "--menu-index": index,
      ...getButtonStyle(action?.id, selected, magnet),
    },
    tabIndex: 0,
  },
    frameSrc && h("img", {
      alt: "",
      "aria-hidden": "true",
      className: "tst-main-menu-button-frame tst-main-menu-button-frame-glow",
      draggable: false,
      src: frameSrc,
    }),
    frameSrc && h("img", {
      alt: "",
      "aria-hidden": "true",
      className: "tst-main-menu-button-frame",
      draggable: false,
      src: frameSrc,
    }),
    h("span", { className: "tst-main-menu-button-glow" }),
    h("span", { className: "tst-main-menu-button-inner" },
      h("span", { "aria-hidden": "true", className: "tst-main-menu-button-core" }),
      h("span", { className: "tst-main-menu-button-label" }, action?.label || ""),
      action?.hint && h("span", { className: "tst-main-menu-button-hint" }, action.hint),
    ),
  );
}
