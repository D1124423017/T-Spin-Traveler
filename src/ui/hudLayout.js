function clampRatio(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function createHudLayout({ boardX, boardY, cols, rows, tile }) {
  return {
    panelPadding: 24,
    playerPanel: { x: 38, y: 84, w: 312, h: 154 },
    enemyPanel: { x: 884, y: 84, w: 356, h: 254 },
    playerStage: { x: 18, y: 188, w: 380, h: 392 },
    enemyStage: { x: 858, y: 246, w: 410, h: 320 },
    boardFrame: { x: boardX - 18, y: boardY - 18, w: cols * tile + 36, h: rows * tile + 36 },
    menuHero: { x: 350, y: 540, scale: 0.68 },
    menu: {
      x: 804,
      y: 96,
      w: 390,
      h: 548,
      padding: 34,
      titleY: 104,
      subtitleY: 154,
      primaryY: 250,
      mainStageY: 330,
      utilityY: 386,
      primaryH: 64,
      buttonH: 44,
      buttonGap: 10,
    },
    countdown: { cardW: 236, cardH: 108, yOffset: -18, barGap: 16 },
    pauseButton: { x: 1192, y: 24, w: 50, h: 38 },
    pauseMenu: { x: 414, y: 122, w: 452, h: 462 },
    settings: { x: 142, y: 58, w: 996, h: 604, tabX: 184, contentX: 388, contentY: 166 },
    controlsGrid: { columns: 2, gapX: 360, rowH: 52, rowW: 332, keyW: 132, keyH: 36 },
    ultimateMeter: { x: 0, y: rows * tile + 10, w: cols * tile, h: 30 },
    compactHints: [
      "screenMove",
      "screenSoftDrop",
      "screenHardDrop",
      "screenRotate",
      "screenRotate180",
      "screenHold",
      "screenPause",
      "screenMute",
    ],
  };
}

export function getRunRiftEnergyHudLayout(pauseButton) {
  const iconSize = 52;
  const numberGap = 2;
  const numberWidth = 60;
  const pauseGap = 10;
  const width = iconSize + numberGap + numberWidth;
  const x = pauseButton.x - pauseGap - width;
  const y = pauseButton.y - 7;
  return {
    icon: { x, y, w: iconSize, h: iconSize },
    number: {
      x: x + iconSize + numberGap,
      y: pauseButton.y + 27,
      w: numberWidth,
      size: 22,
      minSize: 15,
    },
    bounds: { x, y, w: width, h: iconSize },
  };
}

export function getUltimateTimerRatio(active, timer, maxTimer) {
  if (!active) return 0;
  const total = Math.max(1, Number.isFinite(maxTimer) ? maxTimer : 0);
  const remaining = Math.max(0, Number.isFinite(timer) ? timer : 0);
  return clampRatio(remaining / total);
}

export function getUltimateCountdownSeconds(timer) {
  const remaining = Math.max(0, Number.isFinite(timer) ? timer : 0);
  return Math.ceil(remaining / 1000);
}

export function shouldShowUltimateCountdownWarning(active, timer, warningMs = 3000) {
  const remaining = Math.max(0, Number.isFinite(timer) ? timer : 0);
  const threshold = Math.max(0, Number.isFinite(warningMs) ? warningMs : 3000);
  return Boolean(active && remaining > 0 && remaining <= threshold);
}

export function getMainMenuButtonRects(menuLayout) {
  const pad = menuLayout.padding || 36;
  const bx = menuLayout.x + pad;
  const bw = menuLayout.w - pad * 2;
  return {
    start: { x: bx, y: menuLayout.primaryY, w: bw, h: menuLayout.primaryH },
    mainStage: { x: bx, y: menuLayout.mainStageY, w: bw, h: menuLayout.buttonH },
    metaUpgrade: { x: bx, y: menuLayout.utilityY, w: bw, h: menuLayout.buttonH },
    guide: { x: bx, y: menuLayout.utilityY + menuLayout.buttonH + menuLayout.buttonGap, w: bw, h: menuLayout.buttonH },
    settings: { x: bx, y: menuLayout.utilityY + (menuLayout.buttonH + menuLayout.buttonGap) * 2, w: bw, h: menuLayout.buttonH },
  };
}

export function getResultButtonRects() {
  const y = 528;
  return {
    retry: { x: 354, y, w: 172, h: 44 },
    upgrade: { x: 554, y, w: 172, h: 44 },
    menu: { x: 754, y, w: 172, h: 44 },
  };
}

export function getSettingsContentOrigin(settingsLayout) {
  return { x: settingsLayout.contentX, y: settingsLayout.contentY };
}

export function getSettingsBackButtonRect(settingsLayout) {
  const w = 274;
  return { x: settingsLayout.x + settingsLayout.w - 42 - w, y: settingsLayout.y + 26, w, h: 40 };
}

export function getSettingsFeedbackCardRect(origin) {
  return { x: origin.x, y: origin.y + 58, w: 640, h: 292 };
}

export function getControlsResetButtonRect(origin, controlsGridLayout, controlCount) {
  const rows = Math.ceil(controlCount / controlsGridLayout.columns);
  return { x: origin.x + 460, y: origin.y + 112 + rows * controlsGridLayout.rowH + 10, w: 220, h: 38 };
}

export function getHandlingResetButtonRect(origin) {
  return { x: origin.x + 420, y: origin.y + 430, w: 220, h: 38 };
}

export function getSettingsFeedbackButtonRect(cardX, cardY, cardW, cardH = 292) {
  return { x: cardX + 24, y: cardY + cardH - 62, w: 232, h: 40 };
}

export function getAscensionResultButtonRects() {
  return {
    primary: { x: 414, y: 458, w: 220, h: 48 },
    secondary: { x: 646, y: 458, w: 220, h: 48 },
    single: { x: 530, y: 458, w: 220, h: 48 },
  };
}
