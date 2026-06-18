import {
  OVERLAY_READABILITY,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";
import {
  drawElasticRiftSlider,
  defaultElasticRiftSliderFormatValue,
} from "./elasticRiftSlider.js";
import { drawBorderGlow } from "./borderGlow.js";

export function getSettingsTabLabelKey(tab) {
  if (!tab) return "";
  return `settingsTab${tab[0].toUpperCase()}${tab.slice(1)}`;
}

export function formatSettingsPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export function formatTuningSliderValue(key, value, spec = {}) {
  if (key === "arr" && value === 0) return "0 ms";
  return `${Math.round(value)} ${spec.unit || ""}`.trim();
}

export function getControlActionLabel(action, controlActions = [], translate = (key) => key) {
  const item = controlActions.find((entry) => entry.id === action);
  return item ? translate(item.labelKey) : action;
}

export function getControlDisplayValue(action, {
  getControlKeys,
  formatControlKey = (key) => key,
} = {}) {
  const keys = typeof getControlKeys === "function" ? getControlKeys(action) : [];
  return keys.length ? keys.map(formatControlKey).join(" / ") : "-";
}

export function createSettingsScreenRenderer(depsOrFactory) {
  return {
    draw(source = "pause") {
      const deps = typeof depsOrFactory === "function"
        ? depsOrFactory()
        : depsOrFactory;
      drawSettingsScreenOverlay(deps, source);
    },
  };
}

export function drawSettingsScreenOverlay(deps, source = "pause") {
  const {
    ctx,
    layout,
    label,
    t,
    drawDimOverlay,
    drawCard,
    drawMenuButton,
    getSettingsBackButtonRect,
  } = deps;
  const s = layout.settings;
  ctx.save();
  drawDimOverlay(source === "start" ? OVERLAY_READABILITY.scrim.settings : OVERLAY_READABILITY.scrim.standard);
  drawCard(s.x, s.y, s.w, s.h);
  drawSettingsBorderGlow(deps, { x: s.x, y: s.y, w: s.w, h: s.h }, {
    edgeSensitivity: 64,
    glowIntensity: 0.58,
    glowRadius: 26,
    radius: 22,
    selected: true,
    selectedIntensity: 0.22,
  });
  label(t("settings"), s.x + 42, s.y + 58, 40, "#f5f1e6");
  const backText = source === "start" ? t("settingsBackMenu") : t("settingsBack");
  const backButton = getSettingsBackButtonRect();
  drawMenuButton(backButton.x, backButton.y, backButton.w, backButton.h, backText, "Esc");
  drawSettingsBorderGlow(deps, backButton, {
    edgeSensitivity: 34,
    fillOpacity: 0.018,
    glowIntensity: 0.72,
    glowRadius: 18,
    radius: 10,
  });
  drawSettingsTabs(deps, s.tabX, s.y + 112);
  drawSettingsContent(deps, s.contentX, s.contentY);
  ctx.restore();
}

function getSettingsGlowOptions(deps) {
  return {
    now: deps.state?.debug?.lastDrawAt || 0,
    pointer: deps.state?.pointer,
    reducedMotion: typeof deps.prefersReducedMotion === "function"
      ? deps.prefersReducedMotion()
      : false,
  };
}

function drawSettingsBorderGlow(deps, rect, options = {}) {
  drawBorderGlow(deps.ctx, {
    rect,
    roundedRect: deps.roundedRect,
    ...getSettingsGlowOptions(deps),
    ...options,
  });
}

function isSettingsPointerInRect(state, rect) {
  const pointer = state?.pointer;
  if (!pointer) return false;
  return pointInRect(pointer.x, pointer.y, rect.x, rect.y, rect.w, rect.h);
}

function drawSettingsTabs(deps, x, y) {
  const {
    ctx,
    label,
    roundedRect,
    settingsTabs,
    state,
    t,
  } = deps;
  for (let i = 0; i < settingsTabs.length; i += 1) {
    const tab = settingsTabs[i];
    const active = state.settingsTab === tab;
    const yy = y + i * 62;
    const rect = { x, y: yy, w: 164, h: 46 };
    const hovered = isSettingsPointerInRect(state, rect);
    ctx.save();
    let fill = active ? "rgba(183, 146, 255, 0.34)" : "rgba(9, 17, 28, 0.76)";
    if (typeof ctx.createLinearGradient === "function") {
      fill = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      fill.addColorStop(0, active ? "rgba(183, 146, 255, 0.34)" : "rgba(9, 17, 28, 0.76)");
      fill.addColorStop(1, active ? "rgba(22, 15, 44, 0.72)" : "rgba(4, 8, 16, 0.72)");
    }
    ctx.fillStyle = fill;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 12, true, false);
    ctx.strokeStyle = active ? "rgba(255, 240, 166, 0.54)" : "rgba(145, 232, 222, 0.16)";
    ctx.lineWidth = active ? 1.8 : 1.2;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 12, false, true);
    ctx.restore();
    drawSettingsBorderGlow(deps, rect, {
      edgeSensitivity: 28,
      fillOpacity: active ? 0.035 : 0.018,
      glowIntensity: hovered || active ? 0.86 : 0.42,
      glowRadius: 18,
      radius: 12,
      selected: active,
      selectedIntensity: active ? 0.42 : 0,
    });
    ctx.save();
    label(t(getSettingsTabLabelKey(tab)), rect.x + 22, rect.y + 29, 16, active ? "#fff0a6" : "rgba(238,244,252,0.68)");
    ctx.restore();
  }
}

function drawSettingsContent(deps, x, y) {
  const {
    audio,
    label,
    state,
    t,
    wrapText,
    getControlsResetButtonRect,
    getSettingsFeedbackCardRect,
  } = deps;
  if (state.settingsTab === "audio") {
    label(t("audioSettingsTitle"), x, y, 26, "#8fe8dc");
    drawSlider(deps, t("master"), "masterVolume", x, y + 64, audio.masterVolume);
    drawSlider(deps, t("music"), "musicVolume", x, y + 128, audio.musicVolume);
    drawSlider(deps, t("sfx"), "sfxVolume", x, y + 192, audio.sfxVolume);
    drawToggle(deps, x, y + 250, t("mute"), audio.muted);
    wrapText(t("audioMixHelp"), x, y + 316, 430, 18, "rgba(238,244,252,0.48)", 12);
    return;
  }
  if (state.settingsTab === "controls") {
    label(t("controlsSettingsTitle"), x, y, 26, "#8fe8dc");
    label(t("controlListTitle").toUpperCase(), x, y + 46, 14, "#fff0a6");
    wrapText(state.bindingAction ? t("binding") : t("bindHelp"), x, y + 74, 660, 18, "rgba(238,244,252,0.6)", 13);
    drawControlGrid(deps, x, y + 112);
    drawSettingsUtilityButton(deps, getControlsResetButtonRect(), t("resetKeybinds"));
    return;
  }
  if (state.settingsTab === "handling") {
    drawHandlingSettings(deps, x, y);
    return;
  }
  if (state.settingsTab === "language") {
    label(t("languageSettingsTitle"), x, y, 26, "#8fe8dc");
    drawLanguageToggle(deps, x, y + 72);
    wrapText(t("languageHelp"), x, y + 142, 480, 22, "rgba(238,244,252,0.62)", 15);
    return;
  }
  label(t("feedbackTitle"), x, y, 26, "#8fe8dc");
  const feedbackCard = getSettingsFeedbackCardRect();
  drawSettingsFeedbackCard(deps, feedbackCard.x, feedbackCard.y, feedbackCard.w, feedbackCard.h);
}

function drawSettingsFeedbackCard(deps, x, y, w, h) {
  const {
    ctx,
    roundedRect,
    t,
    wrapText,
    getSettingsFeedbackButtonRect,
  } = deps;
  const buttonRect = getSettingsFeedbackButtonRect(x, y, w, h);
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 12, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.22)";
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, h, 12, false, true);
  drawSettingsBorderGlow(deps, { x, y, w, h }, {
    edgeSensitivity: 40,
    fillOpacity: 0.018,
    glowIntensity: 0.44,
    glowRadius: 20,
    radius: 12,
    selected: true,
    selectedIntensity: 0.14,
  });
  wrapText(t("feedbackHelp"), x + 24, y + 48, w - 278, 23, "rgba(238,244,252,0.76)", 15);
  drawSettingsFeedbackNoa(deps, x + w - 236, y + 22, 202, h - 42);
  drawSettingsFeedbackButton(deps, buttonRect, t("feedbackOpenGithub"), "#fff0a6");
  ctx.restore();
}

function drawSettingsFeedbackButton(deps, rect, text, color) {
  const {
    ctx,
    fitLabel,
    roundedRect,
    state,
  } = deps;
  const hovered = isSettingsPointerInRect(state, rect);
  ctx.save();
  ctx.fillStyle = hovered ? hexToRgba(color, 0.28) : OVERLAY_READABILITY.surface.fillStrong;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, true, false);
  ctx.strokeStyle = hovered ? hexToRgba(color, 0.68) : hexToRgba(color, 0.34);
  ctx.lineWidth = hovered ? 2 : 1.4;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, false, true);
  drawSettingsBorderGlow(deps, rect, {
    edgeSensitivity: 34,
    fillOpacity: 0.026,
    glowIntensity: hovered ? 0.94 : 0.46,
    glowRadius: 20,
    radius: 8,
    selected: hovered,
    selectedIntensity: hovered ? 0.64 : 0,
  });
  ctx.fillStyle = hovered ? color : "rgba(245,241,230,0.82)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fitLabel(text, rect.x + 14, rect.y + rect.h / 2 + 1, rect.w - 28, 14, ctx.fillStyle, 11, "800");
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawSettingsUtilityButton(deps, rect, text) {
  const {
    ctx,
    fitLabel,
    roundedRect,
    state,
  } = deps;
  const hovered = isSettingsPointerInRect(state, rect);
  ctx.save();
  ctx.fillStyle = hovered ? "rgba(126, 231, 255, 0.24)" : OVERLAY_READABILITY.surface.fill;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, true, false);
  ctx.strokeStyle = hovered ? "rgba(255, 240, 166, 0.52)" : "rgba(126, 231, 255, 0.26)";
  ctx.lineWidth = hovered ? 2 : 1.4;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, false, true);
  drawSettingsBorderGlow(deps, rect, {
    edgeSensitivity: 30,
    fillOpacity: 0.02,
    glowIntensity: hovered ? 0.86 : 0.36,
    glowRadius: 18,
    radius: 8,
    selected: hovered,
    selectedIntensity: hovered ? 0.52 : 0,
  });
  fitLabel(text, rect.x + 16, rect.y + 25, rect.w - 32, 14, hovered ? "#fff0a6" : "rgba(245,241,230,0.78)", 11, "800");
  ctx.restore();
}

function drawSettingsFeedbackNoa(deps, x, y, w, h) {
  const {
    ctx,
    drawImageContain,
    noaFeedbackBowArt,
  } = deps;
  ctx.save();
  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.62, 10, x + w / 2, y + h * 0.62, w * 0.58);
  glow.addColorStop(0, "rgba(126, 231, 255, 0.18)");
  glow.addColorStop(0.58, "rgba(183, 146, 255, 0.1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 18, y, w + 36, h);
  ctx.shadowColor = "#b690ff";
  ctx.shadowBlur = 18;
  drawImageContain(noaFeedbackBowArt, x, y, w, h);
  ctx.restore();
}

function drawLanguageToggle(deps, x, y) {
  const {
    ctx,
    label,
    state,
    t,
  } = deps;
  ctx.save();
  label(t("language"), x, y - 10, 15, "#8fe8dc");
  const zhActive = state.language === "zh";
  drawLanguagePill(deps, x, y, 72, 34, t("languageZhShort"), zhActive);
  drawLanguagePill(deps, x + 80, y, 72, 34, t("languageEnShort"), !zhActive);
  ctx.restore();
}

function drawLanguagePill(deps, x, y, w, h, text, active) {
  const {
    ctx,
    label,
    roundedRect,
  } = deps;
  ctx.save();
  ctx.fillStyle = active ? "rgba(241, 211, 107, 0.28)" : "rgba(109, 232, 255, 0.12)";
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = active ? "rgba(255, 244, 168, 0.62)" : "rgba(145, 232, 222, 0.24)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 8, false, true);
  drawSettingsBorderGlow(deps, { x, y, w, h }, {
    edgeSensitivity: 22,
    fillOpacity: 0.02,
    glowIntensity: active ? 0.66 : 0.32,
    glowRadius: 14,
    radius: 8,
    selected: active,
    selectedIntensity: active ? 0.44 : 0,
  });
  label(text, x + 18, y + 23, 15, active ? "#fff0a6" : "rgba(238,244,252,0.68)");
  ctx.restore();
}

function drawHandlingSettings(deps, x, y) {
  const {
    label,
    t,
    getHandlingResetButtonRect,
  } = deps;
  label(t("handlingSettingsTitle"), x, y, 26, "#8fe8dc");
  const rows = [
    ["das", t("das"), t("dasHelp")],
    ["arr", t("arr"), t("arrHelp")],
    ["softDrop", t("softDropMs"), t("softDropHelp")],
    ["lockDelay", t("lockDelayMs"), t("lockDelayHelp")],
  ];
  for (let i = 0; i < rows.length; i += 1) {
    const [key, title, help] = rows[i];
    drawHandlingSlider(deps, title, help, key, x, y + 66 + i * 88);
  }
  drawSettingsUtilityButton(deps, getHandlingResetButtonRect(), t("resetHandling"));
}

function drawControlGrid(deps, x, y, columns = deps.layout.controlsGrid.columns, gapX = deps.layout.controlsGrid.gapX) {
  const {
    controlActions,
    layout,
    state,
    t,
  } = deps;
  const controlsLayout = layout.controlsGrid;
  for (let i = 0; i < controlActions.length; i += 1) {
    const action = controlActions[i].id;
    const col = i % columns;
    const row = Math.floor(i / columns);
    const rx = x + col * gapX;
    const ry = y + row * controlsLayout.rowH;
    drawKeyBindRow(
      deps,
      rx,
      ry,
      getControlActionLabel(action, controlActions, t),
      getControlDisplayValue(action, deps),
      state.bindingAction === action,
      controlsLayout.rowW,
    );
  }
}

function drawSlider(deps, labelText, key, x, y, value) {
  const {
    canvasFont,
    ctx,
    label,
    roundedRect,
    state,
  } = deps;
  const trackW = 270;
  drawElasticRiftSlider({
    canvasFont,
    ctx,
    label,
    roundedRect,
    labelText,
    value,
    x,
    y,
    width: trackW,
    key: `audio:${key}`,
    pointer: state.pointer,
    now: state.debug?.lastDrawAt || 0,
    labelY: y - 10,
    formatValue: defaultElasticRiftSliderFormatValue,
  });
}

function drawHandlingSlider(deps, labelText, helpText, key, x, y) {
  const {
    canvasFont,
    ctx,
    fitLabel,
    label,
    roundedRect,
    state,
    tuningSliders,
    wrapText,
    getSettingsSliderTrackX,
    getSettingsSliderTrackWidth,
  } = deps;
  const spec = tuningSliders[key];
  const value = state.tuning[key];
  const trackW = getSettingsSliderTrackWidth("tuning");
  const trackX = getSettingsSliderTrackX("tuning");
  const trackY = y + 34;
  const valueX = trackX + trackW + 28;
  const rect = { x, y, w: 640, h: 70 };
  const active = state.pointer?.dragging === `tuning:${key}`;
  const hovered = isSettingsPointerInRect(state, rect);
  ctx.save();
  ctx.fillStyle = active ? "rgba(183, 146, 255, 0.26)" : OVERLAY_READABILITY.surface.fillSoft;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 12, true, false);
  ctx.strokeStyle = active ? "rgba(255, 240, 166, 0.54)" : "rgba(126, 231, 255, 0.2)";
  ctx.lineWidth = active ? 2 : 1.4;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 12, false, true);
  drawSettingsBorderGlow(deps, rect, {
    edgeSensitivity: 32,
    fillOpacity: 0.018,
    glowIntensity: active || hovered ? 0.78 : 0.34,
    glowRadius: 18,
    radius: 12,
    selected: active,
    selectedIntensity: active ? 0.54 : 0,
  });

  fitLabel(labelText, x + 18, y + 24, 190, 16, "#f3f2ea", 12, "900");
  wrapText(helpText, x + 18, y + 46, 205, 16, "rgba(238,244,252,0.58)", 11);

  drawElasticRiftSlider({
    canvasFont,
    ctx,
    label,
    roundedRect,
    labelText: "",
    value,
    x: trackX,
    y: trackY,
    width: trackW,
    key: `tuning:${key}`,
    pointer: state.pointer,
    now: state.debug?.lastDrawAt || 0,
    min: spec.min,
    max: spec.max,
    showLabel: false,
    valueX,
    valueY: trackY + 12,
    valueFontSize: 15,
    formatValue: (nextValue) => formatTuningSliderValue(key, nextValue, spec),
  });
  ctx.restore();
}

function drawToggle(deps, x, y, text, enabled) {
  const {
    ctx,
    label,
    roundedRect,
  } = deps;
  ctx.save();
  label(text, x, y + 18, 17, "#f3f2ea");
  ctx.fillStyle = enabled ? "rgba(255, 119, 130, 0.72)" : "rgba(109, 232, 255, 0.28)";
  roundedRect(x + 116, y, 64, 30, 15, true, false);
  ctx.fillStyle = "#f3f2ea";
  ctx.beginPath();
  ctx.arc(x + 131 + (enabled ? 32 : 0), y + 15, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawKeyBindRow(deps, x, y, text, value, binding, w = deps.layout.controlsGrid.rowW) {
  const {
    canvasFont,
    ctx,
    fitLabel,
    layout,
    roundedRect,
    state,
    t,
  } = deps;
  const keyW = layout.controlsGrid.keyW;
  const keyH = layout.controlsGrid.keyH;
  const keyX = x + w - keyW;
  const labelW = keyX - x - 22;
  const rect = { x, y, w, h: 42 };
  const hovered = isSettingsPointerInRect(state, rect);
  ctx.save();
  ctx.fillStyle = binding ? "rgba(241, 211, 107, 0.22)" : OVERLAY_READABILITY.surface.fillSoft;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, true, false);
  ctx.strokeStyle = binding ? "rgba(255, 244, 168, 0.44)" : "rgba(145, 232, 222, 0.14)";
  ctx.lineWidth = 1.4;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 8, false, true);
  drawSettingsBorderGlow(deps, rect, {
    edgeSensitivity: 24,
    fillOpacity: 0.016,
    glowIntensity: binding || hovered ? 0.76 : 0.3,
    glowRadius: 14,
    radius: 8,
    selected: binding,
    selectedIntensity: binding ? 0.5 : 0,
  });
  fitLabel(text, x + 14, y + 26, labelW, 15, "#f3f2ea", 12, "800");
  ctx.fillStyle = binding ? "rgba(241, 211, 107, 0.34)" : "rgba(109, 232, 255, 0.18)";
  roundedRect(keyX, y + 3, keyW, keyH, 7, true, false);
  ctx.strokeStyle = binding ? "rgba(255, 244, 168, 0.62)" : "rgba(145, 232, 222, 0.32)";
  ctx.lineWidth = 2;
  roundedRect(keyX, y + 3, keyW, keyH, 7, false, true);
  const shownKey = binding ? t("settingPressKey") : value;
  ctx.font = canvasFont("800", 15, shownKey);
  ctx.fillStyle = "#f3f2ea";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fitLabel(shownKey, keyX + keyW / 2, y + 21, keyW - 16, 15, "#f3f2ea", 11, "800");
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}
