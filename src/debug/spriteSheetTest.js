import { translations } from "../data/i18n.js";
import { getAnimationDuration, getAnimationFrameInfo } from "../render/animationTiming.js";
import { getSpriteFrameRect } from "../render/drawUtils.js";
import { SPRITE_SHEET_CATALOG } from "./spriteSheetCatalog.js";

const SAVE_KEY = "tspin-traveler-save-v1";
const CHECKER_SIZE = 16;
const DEFAULT_SCALE = 1.7;

const elements = {
  title: document.querySelector("[data-i18n='spriteTestTitle']"),
  subtitle: document.querySelector("[data-i18n='spriteTestSubtitle']"),
  sheetList: document.querySelector("[data-sheet-list]"),
  canvas: document.querySelector("[data-preview-canvas]"),
  atlas: document.querySelector("[data-atlas-canvas]"),
  status: document.querySelector("[data-status]"),
  meta: document.querySelector("[data-meta]"),
  fps: document.querySelector("[data-fps]"),
  scale: document.querySelector("[data-scale]"),
  frame: document.querySelector("[data-frame]"),
  play: document.querySelector("[data-action='play']"),
  prev: document.querySelector("[data-action='prev']"),
  next: document.querySelector("[data-action='next']"),
  grid: document.querySelector("[data-action='grid']"),
  checker: document.querySelector("[data-action='checker']"),
  zh: document.querySelector("[data-lang='zh']"),
  en: document.querySelector("[data-lang='en']"),
};

const ctx = elements.canvas.getContext("2d");
const atlasCtx = elements.atlas.getContext("2d");

let language = readSavedLanguage();
let activeSheet = SPRITE_SHEET_CATALOG[0];
let activeImage = null;
let imageToken = 0;
let playing = true;
let showGrid = true;
let showChecker = true;
let selectedFrame = 0;
let animationStart = performance.now();
let lastFrameTime = animationStart;

function t(key) {
  const table = translations[language] || translations.zh;
  return table[key] || translations.en[key] || translations.zh[key] || key;
}

function readSavedLanguage() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "{}");
    return parsed?.settings?.language === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function applyI18n() {
  document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
  document.title = t("spriteTestTitle");
  for (const node of document.querySelectorAll("[data-i18n]")) {
    const key = node.dataset.i18n;
    if (key) node.textContent = t(key);
  }
  for (const node of document.querySelectorAll("[data-i18n-aria-label]")) {
    const key = node.dataset.i18nAriaLabel;
    if (key) node.setAttribute("aria-label", t(key));
  }
  elements.play.textContent = playing ? t("spriteTestPause") : t("spriteTestPlay");
  elements.grid.textContent = showGrid ? t("spriteTestGridOn") : t("spriteTestGridOff");
  elements.checker.textContent = showChecker ? t("spriteTestCheckerOn") : t("spriteTestCheckerOff");
  elements.zh.classList.toggle("active", language === "zh");
  elements.en.classList.toggle("active", language === "en");
  elements.zh.setAttribute("aria-pressed", String(language === "zh"));
  elements.en.setAttribute("aria-pressed", String(language === "en"));
  renderSheetButtons();
  updateStatus();
}

function renderSheetButtons() {
  elements.sheetList.innerHTML = "";
  let currentGroup = "";
  for (const sheetDef of SPRITE_SHEET_CATALOG) {
    if (sheetDef.groupKey !== currentGroup) {
      currentGroup = sheetDef.groupKey;
      const heading = document.createElement("h2");
      heading.textContent = t(currentGroup);
      elements.sheetList.append(heading);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = sheetDef.id === activeSheet.id ? "sheet-button active" : "sheet-button";
    button.dataset.sheetId = sheetDef.id;
    button.setAttribute("aria-pressed", String(sheetDef.id === activeSheet.id));
    button.innerHTML = `<span>${sheetDef.id}</span><small>${sheetDef.path}</small>`;
    button.addEventListener("click", () => selectSheet(sheetDef.id));
    elements.sheetList.append(button);
  }
}

function selectSheet(id) {
  const nextSheet = SPRITE_SHEET_CATALOG.find((sheetDef) => sheetDef.id === id);
  if (!nextSheet || nextSheet.id === activeSheet.id) return;
  activeSheet = nextSheet;
  activeImage = null;
  selectedFrame = 0;
  animationStart = performance.now();
  elements.frame.value = "0";
  elements.fps.value = String(activeSheet.frameMs);
  loadActiveImage();
  renderSheetButtons();
  updateStatus(t("spriteTestLoading"));
}

function loadActiveImage() {
  const token = imageToken + 1;
  imageToken = token;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    if (token !== imageToken) return;
    activeImage = image;
    selectedFrame = 0;
    animationStart = performance.now();
    updateStatus();
    drawAtlas();
  };
  image.onerror = () => {
    if (token !== imageToken) return;
    activeImage = null;
    updateStatus(t("spriteTestLoadError"));
    clearCanvas(ctx, elements.canvas);
    clearCanvas(atlasCtx, elements.atlas);
  };
  updateStatus(t("spriteTestLoading"));
  image.src = activeSheet.path;
}

function setFrame(index) {
  selectedFrame = Math.max(0, Math.min(activeSheet.frames.length - 1, index));
  elements.frame.value = String(selectedFrame);
  playing = false;
  elements.play.textContent = t("spriteTestPlay");
  drawPreview();
  drawAtlas();
  updateStatus();
}

function drawChecker(ctx2d, width, height) {
  ctx2d.fillStyle = "#111724";
  ctx2d.fillRect(0, 0, width, height);
  for (let y = 0; y < height; y += CHECKER_SIZE) {
    for (let x = 0; x < width; x += CHECKER_SIZE) {
      ctx2d.fillStyle = ((x / CHECKER_SIZE + y / CHECKER_SIZE) % 2) === 0
        ? "rgba(231, 246, 255, 0.12)"
        : "rgba(6, 9, 16, 0.56)";
      ctx2d.fillRect(x, y, CHECKER_SIZE, CHECKER_SIZE);
    }
  }
}

function clearCanvas(ctx2d, canvas) {
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  if (showChecker) drawChecker(ctx2d, canvas.width, canvas.height);
}

function drawPreview() {
  clearCanvas(ctx, elements.canvas);
  if (!activeImage) return;

  const frame = activeSheet.frames[selectedFrame];
  const rect = getSpriteFrameRect({ ...activeSheet, image: activeImage }, frame);
  const scale = Number(elements.scale.value) || DEFAULT_SCALE;
  const drawW = Math.min(elements.canvas.width - 40, rect.w * scale);
  const drawH = Math.min(elements.canvas.height - 40, rect.h * scale);
  const fit = Math.min(drawW / rect.w, drawH / rect.h);
  const w = Math.max(1, rect.w * fit);
  const h = Math.max(1, rect.h * fit);
  const x = (elements.canvas.width - w) / 2;
  const y = (elements.canvas.height - h) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(activeImage, rect.x, rect.y, rect.w, rect.h, x, y, w, h);

  if (showGrid) {
    ctx.strokeStyle = "rgba(126, 232, 222, 0.86)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
}

function drawAtlas() {
  clearCanvas(atlasCtx, elements.atlas);
  if (!activeImage) return;

  const padding = 16;
  const maxW = elements.atlas.width - padding * 2;
  const maxH = elements.atlas.height - padding * 2;
  const scale = Math.min(maxW / activeImage.naturalWidth, maxH / activeImage.naturalHeight);
  const w = activeImage.naturalWidth * scale;
  const h = activeImage.naturalHeight * scale;
  const x = (elements.atlas.width - w) / 2;
  const y = (elements.atlas.height - h) / 2;

  atlasCtx.imageSmoothingEnabled = true;
  atlasCtx.drawImage(activeImage, x, y, w, h);

  const cellW = w / activeSheet.columns;
  const cellH = h / activeSheet.rows;
  if (showGrid) {
    atlasCtx.strokeStyle = "rgba(126, 232, 222, 0.72)";
    atlasCtx.lineWidth = 1;
    for (let col = 0; col <= activeSheet.columns; col += 1) {
      atlasCtx.beginPath();
      atlasCtx.moveTo(x + col * cellW, y);
      atlasCtx.lineTo(x + col * cellW, y + h);
      atlasCtx.stroke();
    }
    for (let row = 0; row <= activeSheet.rows; row += 1) {
      atlasCtx.beginPath();
      atlasCtx.moveTo(x, y + row * cellH);
      atlasCtx.lineTo(x + w, y + row * cellH);
      atlasCtx.stroke();
    }
  }

  const selectedCol = selectedFrame % activeSheet.columns;
  const selectedRow = Math.floor(selectedFrame / activeSheet.columns);
  atlasCtx.strokeStyle = "rgba(255, 226, 132, 0.96)";
  atlasCtx.lineWidth = 3;
  atlasCtx.strokeRect(x + selectedCol * cellW + 1, y + selectedRow * cellH + 1, cellW - 2, cellH - 2);
}

function updateStatus(override = "") {
  const duration = getAnimationDuration(activeSheet);
  const fps = Math.round(1000 / activeSheet.frameMs);
  const dimensions = activeImage
    ? `${activeImage.naturalWidth} x ${activeImage.naturalHeight}`
    : "--";
  const frameW = activeImage ? Math.round(activeImage.naturalWidth / activeSheet.columns) : "--";
  const frameH = activeImage ? Math.round(activeImage.naturalHeight / activeSheet.rows) : "--";

  elements.status.textContent = override || `${t("spriteTestStatusFrame")} ${selectedFrame + 1} / ${activeSheet.frames.length}`;
  elements.meta.textContent = [
    `${t("spriteTestMetaImage")} ${dimensions}`,
    `${t("spriteTestMetaCell")} ${frameW} x ${frameH}`,
    `${t("spriteTestMetaTiming")} ${activeSheet.frameMs}ms / ${fps} FPS`,
    `${t("spriteTestMetaDuration")} ${duration}ms`,
  ].join("  |  ");
}

function tick(now) {
  if (playing && activeImage) {
    const duration = getAnimationDuration(activeSheet);
    const elapsed = duration > 0 ? (now - animationStart) % duration : 0;
    const frameInfo = getAnimationFrameInfo(activeSheet, elapsed);
    selectedFrame = frameInfo.frameIndex;
    elements.frame.value = String(selectedFrame);
  } else if (playing && !activeImage) {
    animationStart += now - lastFrameTime;
  }

  drawPreview();
  drawAtlas();
  updateStatus();
  lastFrameTime = now;
  requestAnimationFrame(tick);
}

elements.fps.addEventListener("change", () => {
  const value = Number(elements.fps.value);
  activeSheet = {
    ...activeSheet,
    frameMs: Number.isFinite(value) && value > 0 ? Math.round(value) : activeSheet.frameMs,
  };
  elements.fps.value = String(activeSheet.frameMs);
  animationStart = performance.now();
  updateStatus();
});

elements.scale.addEventListener("input", drawPreview);
elements.frame.addEventListener("input", () => setFrame(Number(elements.frame.value)));
elements.play.addEventListener("click", () => {
  playing = !playing;
  animationStart = performance.now() - selectedFrame * activeSheet.frameMs;
  elements.play.textContent = playing ? t("spriteTestPause") : t("spriteTestPlay");
});
elements.prev.addEventListener("click", () => setFrame(selectedFrame - 1));
elements.next.addEventListener("click", () => setFrame(selectedFrame + 1));
elements.grid.addEventListener("click", () => {
  showGrid = !showGrid;
  elements.grid.textContent = showGrid ? t("spriteTestGridOn") : t("spriteTestGridOff");
});
elements.checker.addEventListener("click", () => {
  showChecker = !showChecker;
  elements.checker.textContent = showChecker ? t("spriteTestCheckerOn") : t("spriteTestCheckerOff");
});
elements.zh.addEventListener("click", () => {
  language = "zh";
  applyI18n();
});
elements.en.addEventListener("click", () => {
  language = "en";
  applyI18n();
});

applyI18n();
elements.fps.value = String(activeSheet.frameMs);
loadActiveImage();
requestAnimationFrame(tick);
