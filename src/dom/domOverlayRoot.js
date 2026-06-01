export const GSAP_FEEDBACK_CDN_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";

const DEFAULT_CANVAS_SIZE = Object.freeze({ width: 1280, height: 720 });
const ROOT_ID = "tst-dom-overlay-root";
const STYLE_ID = "tst-dom-overlay-style";
const SCRIPT_ID = "tst-gsap-feedback-script";
const CSS_VERSION = "2026-06-01-dom-overlay-v1";

let configuredCanvasSize = DEFAULT_CANVAS_SIZE;
let overlayRoot = null;
let gsapLoadPromise = null;
let previousMode = "";

const cleanupHandlers = new Set();

function hasDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function clampRatio(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function normalizeCanvasSize(size = {}) {
  const width = Number.isFinite(size.width) && size.width > 0 ? size.width : DEFAULT_CANVAS_SIZE.width;
  const height = Number.isFinite(size.height) && size.height > 0 ? size.height : DEFAULT_CANVAS_SIZE.height;
  return { width, height };
}

export function canvasPointToLayerPercent(point = {}, size = configuredCanvasSize) {
  const canvasSize = normalizeCanvasSize(size);
  const x = Number.isFinite(point.x) ? point.x : 0;
  const y = Number.isFinite(point.y) ? point.y : 0;
  return {
    left: `${(clampRatio(x / canvasSize.width) * 100).toFixed(3)}%`,
    top: `${(clampRatio(y / canvasSize.height) * 100).toFixed(3)}%`,
  };
}

export function initDomOverlayRoot({
  canvasWidth = DEFAULT_CANVAS_SIZE.width,
  canvasHeight = DEFAULT_CANVAS_SIZE.height,
  host = null,
} = {}) {
  configuredCanvasSize = normalizeCanvasSize({ width: canvasWidth, height: canvasHeight });
  return ensureDomOverlayRoot(host);
}

export function ensureDomOverlayRoot(host = null) {
  if (!hasDom()) return null;
  ensureDomOverlayStylesheet();
  if (overlayRoot?.isConnected) return overlayRoot;

  const resolvedHost = host || document.querySelector(".shell") || document.body;
  overlayRoot = document.getElementById(ROOT_ID) || document.createElement("div");
  overlayRoot.id = ROOT_ID;
  overlayRoot.className = "tst-dom-overlay-root";
  overlayRoot.setAttribute("aria-hidden", "true");
  overlayRoot.style.setProperty("--tst-overlay-canvas-width", String(configuredCanvasSize.width));
  overlayRoot.style.setProperty("--tst-overlay-canvas-height", String(configuredCanvasSize.height));
  if (!overlayRoot.isConnected) resolvedHost.append(overlayRoot);
  return overlayRoot;
}

export function getDomOverlayLayer(name, className = "") {
  if (!name || !hasDom()) return null;
  const root = ensureDomOverlayRoot();
  if (!root) return null;

  const layerName = String(name);
  let layer = root.querySelector(`[data-tst-overlay-layer="${layerName}"]`);
  if (!layer) {
    layer = document.createElement("div");
    layer.dataset.tstOverlayLayer = layerName;
    root.append(layer);
  }
  layer.className = ["tst-dom-overlay-layer", `tst-${layerName}-layer`, className].filter(Boolean).join(" ");
  layer.setAttribute("aria-hidden", "true");
  return layer;
}

export function registerOverlayCleanup(handler) {
  if (typeof handler !== "function") return () => {};
  cleanupHandlers.add(handler);
  return () => cleanupHandlers.delete(handler);
}

export function cleanupDomOverlay() {
  if (!hasDom()) return;
  for (const handler of [...cleanupHandlers]) handler();
  if (overlayRoot?.isConnected) {
    for (const layer of overlayRoot.querySelectorAll(".tst-dom-overlay-layer")) {
      layer.replaceChildren();
    }
  }
}

export function setDomOverlayMode(mode) {
  const nextMode = String(mode || "");
  if (nextMode === previousMode) return;
  previousMode = nextMode;
  if (!nextMode || nextMode === "playing") return;
  cleanupDomOverlay();
}

export function getDomOverlayDiagnostics() {
  if (!hasDom()) {
    return {
      rootReady: false,
      layers: {},
      canvasSize: configuredCanvasSize,
      gsapReady: false,
      reducedMotion: false,
    };
  }
  const root = overlayRoot?.isConnected ? overlayRoot : null;
  const layers = {};
  if (root) {
    for (const layer of root.querySelectorAll(".tst-dom-overlay-layer")) {
      layers[layer.dataset.tstOverlayLayer || layer.className] = layer.children.length;
    }
  }
  return {
    rootReady: Boolean(root),
    layers,
    canvasSize: configuredCanvasSize,
    gsapReady: Boolean(window.gsap),
    reducedMotion: prefersReducedMotion(),
  };
}

export function loadGsap() {
  if (!hasDom()) return Promise.resolve(null);
  if (window.gsap) return Promise.resolve(window.gsap);
  if (gsapLoadPromise) return gsapLoadPromise;

  gsapLoadPromise = new Promise((resolve) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing || document.createElement("script");

    const finish = () => {
      const gsap = window.gsap || null;
      if (gsap) gsap.defaults({ overwrite: "auto" });
      resolve(gsap);
    };

    if (existing) {
      if (window.gsap) finish();
      else {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => resolve(null), { once: true });
      }
      return;
    }

    script.id = SCRIPT_ID;
    script.dataset.tstGsapFeedback = "true";
    script.async = true;
    script.src = GSAP_FEEDBACK_CDN_URL;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.append(script);
  });

  return gsapLoadPromise;
}

export function prefersReducedMotion() {
  if (!hasDom() || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureDomOverlayStylesheet() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = `${new URL("./domOverlay.css", import.meta.url).href}?v=${CSS_VERSION}`;
  document.head.append(link);
}

if (hasDom()) {
  window.TST_DOM_OVERLAY = {
    cleanup: cleanupDomOverlay,
    getDiagnostics: getDomOverlayDiagnostics,
    init: initDomOverlayRoot,
    loadGsap,
  };
}
