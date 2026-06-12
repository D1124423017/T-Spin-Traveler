const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const MENU_ACTION_ORDER = [
  "start",
  "mainStage",
  "equipment",
  "metaUpgrade",
  "guide",
  "settings",
];
const MENU_BUTTON_CENTER_Y = [144, 229, 314, 399, 484, 569];
const MENU_BUTTON_CENTER_X = [1030, 1018, 1004, 990, 974, 958];
const MENU_BUTTON_IDLE_ROTATION = [0.004, -0.006, 0.005, -0.004, 0.006, -0.005];

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function lerp(from, to, progress) {
  return from + (to - from) * progress;
}

export function createMainMenuLayout({
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
} = {}) {
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const offsetX = (width - BASE_WIDTH * scale) / 2;
  const offsetY = (height - BASE_HEIGHT * scale) / 2;
  const rect = (x, y, w, h) => ({
    x: offsetX + x * scale,
    y: offsetY + y * scale,
    w: w * scale,
    h: h * scale,
  });

  const buttonCenters = Object.fromEntries(MENU_ACTION_ORDER.map((id, index) => [
    id,
    {
      x: offsetX + MENU_BUTTON_CENTER_X[index] * scale,
      y: offsetY + MENU_BUTTON_CENTER_Y[index] * scale,
    },
  ]));
  const interactionRects = Object.fromEntries(MENU_ACTION_ORDER.map((id, index) => [
    id,
    rect(748, MENU_BUTTON_CENTER_Y[index] - 40, 492, 80),
  ]));
  const buttonRotations = Object.fromEntries(MENU_ACTION_ORDER.map((id, index) => [
    id,
    MENU_BUTTON_IDLE_ROTATION[index],
  ]));

  return {
    scale,
    offsetX,
    offsetY,
    title: rect(52, 42, 444, 212),
    hero: {
      x: offsetX + 310 * scale,
      y: offsetY + 590 * scale,
      scale: 0.82 * scale,
    },
    menu: rect(746, -8, 534, 736),
    runeArc: rect(914, 66, 354, 566),
    selectedDescription: rect(790, 618, 430, 52),
    footer: rect(768, 680, 452, 30),
    buttonCenters,
    buttonRotations,
    buttonRects: interactionRects,
    interactionRects,
    buttonSizes: {
      focus: { w: 400 * scale, h: 92 * scale },
      idle: { w: 326 * scale, h: 54 * scale },
    },
    textSizes: {
      descriptionTitle: 14 * scale,
      description: 12 * scale,
      footer: 11 * scale,
    },
    actionOrder: MENU_ACTION_ORDER,
  };
}

export function getMainMenuButtonRects(layout, {
  groupOffsetX = 0,
} = {}) {
  if (!groupOffsetX) return layout.interactionRects;
  return Object.fromEntries(layout.actionOrder.map((id) => {
    const rect = layout.interactionRects[id];
    return [
      id,
      {
        ...rect,
        x: rect.x + groupOffsetX,
      },
    ];
  }));
}

export function getMainMenuButtonRectList(layout) {
  return layout.actionOrder.map((id) => ({
    id,
    rect: layout.interactionRects[id],
  }));
}

export function getMainMenuVisualButtonRect(layout, actionId, scaleProgress = 0) {
  const center = layout.buttonCenters[actionId];
  const progress = Math.max(0, Number(scaleProgress) || 0);
  const alphaProgress = clamp01(progress);
  const width = lerp(layout.buttonSizes.idle.w, layout.buttonSizes.focus.w, progress);
  const height = lerp(layout.buttonSizes.idle.h, layout.buttonSizes.focus.h, progress);
  const idleRotation = layout.buttonRotations[actionId] || 0;
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    w: width,
    h: height,
    rotation: lerp(idleRotation, 0, alphaProgress),
  };
}
