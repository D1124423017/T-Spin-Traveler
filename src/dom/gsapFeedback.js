export const GSAP_FEEDBACK_CDN_URL = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";

const DEFAULT_CANVAS_SIZE = Object.freeze({ width: 1280, height: 720 });
const STYLE_ID = "tst-gsap-feedback-style";
const SCRIPT_ID = "tst-gsap-feedback-script";
const LAYER_CLASS = "tst-gsap-feedback-layer";
const CSS_VERSION = "2026-06-01-gsap-feedback";

let configuredCanvasSize = DEFAULT_CANVAS_SIZE;
let feedbackLayer = null;
let gsapLoadPromise = null;
let previousMode = "";
let modeCleanupTimer = 0;
let damageOffsetIndex = 0;

const activeNodes = new Set();
const activeAnimations = new Map();
const activeTimers = new Map();

function clampRatio(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function hasDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function normalizeCanvasSize(size = {}) {
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

export function makeFeedbackText(kind, payload = {}) {
  if (payload.label) return String(payload.label);
  if (kind === "combo") return `${Math.max(0, payload.combo || 0)} COMBO`;
  if (kind === "b2b") return payload.chain > 1 ? `B2B CHAIN ${payload.chain}` : "B2B READY";
  if (kind === "tspin") return payload.spinType === "mini" ? "T-SPIN MINI" : "T-SPIN";
  if (kind === "perfect") return "PERFECT CLEAR";
  if (kind === "damage") return `-${Math.max(0, Math.floor(payload.amount || 0))}`;
  return "";
}

export function initFeedbackLayer({ canvasWidth = DEFAULT_CANVAS_SIZE.width, canvasHeight = DEFAULT_CANVAS_SIZE.height } = {}) {
  configuredCanvasSize = normalizeCanvasSize({ width: canvasWidth, height: canvasHeight });
  return ensureFeedbackLayer();
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

export function showComboFeedback(options = {}) {
  return showStatusFeedback("combo", {
    ...options,
    title: makeFeedbackText("combo", options),
    accent: "#7ef7ff",
    secondary: "#ffb7ff",
  });
}

export function showB2BFeedback(options = {}) {
  return showStatusFeedback("b2b", {
    ...options,
    title: makeFeedbackText("b2b", options),
    accent: "#fff0a6",
    secondary: "#7ef7ff",
  });
}

export function showTSpinFeedback(options = {}) {
  return showStatusFeedback("tspin", {
    ...options,
    title: makeFeedbackText("tspin", options),
    accent: "#ffb7ff",
    secondary: "#d7c2ff",
  });
}

export function showPerfectClearFeedback(options = {}) {
  if (!hasDom()) return null;
  const node = createFeedbackNode("perfect", options.position);
  if (!node) return null;

  const title = document.createElement("div");
  title.className = "tst-feedback-title";
  title.textContent = makeFeedbackText("perfect", options);
  node.append(
    makeRune("perfect"),
    makeRing(),
    title,
  );
  if (options.subtitle) node.append(makeSubtitle(options.subtitle));
  runPerfectAnimation(node);
  return node;
}

export function showDamageNumber(options = {}) {
  if (!hasDom()) return null;
  const amount = Math.max(0, Math.floor(options.amount || 0));
  if (amount <= 0) return null;

  const node = createFeedbackNode("damage", options.position);
  if (!node) return null;

  const title = document.createElement("div");
  title.className = "tst-feedback-title";
  title.textContent = makeFeedbackText("damage", { ...options, amount });
  node.append(title);
  runDamageAnimation(node, amount);
  return node;
}

export function cleanupFeedback() {
  if (!hasDom()) return;
  clearModeCleanupTimer();
  for (const node of [...activeNodes]) {
    disposeNode(node);
  }
}

export function setFeedbackMode(mode) {
  if (!hasDom()) return;
  const nextMode = String(mode || "");
  if (nextMode === previousMode) return;
  previousMode = nextMode;
  clearModeCleanupTimer();
  if (!nextMode || nextMode === "playing") return;

  if (nextMode === "upgrade") {
    modeCleanupTimer = window.setTimeout(() => {
      modeCleanupTimer = 0;
      cleanupFeedback();
    }, 720);
    return;
  }
  cleanupFeedback();
}

export function getFeedbackDiagnostics() {
  return {
    activeNodes: activeNodes.size,
    cdnUrl: GSAP_FEEDBACK_CDN_URL,
    gsapReady: hasDom() ? Boolean(window.gsap) : false,
    layerReady: Boolean(feedbackLayer?.isConnected),
    reducedMotion: prefersReducedMotion(),
  };
}

function showStatusFeedback(kind, options) {
  if (!hasDom()) return null;
  const node = createFeedbackNode(kind, options.position);
  if (!node) return null;

  node.style.setProperty("--feedback-accent", options.accent);
  node.style.setProperty("--feedback-secondary", options.secondary);
  node.append(
    makeRune(kind),
    makeStatusLines(options.title, options.subtitle),
  );
  runStatusAnimation(node, kind);
  return node;
}

function ensureFeedbackLayer() {
  if (!hasDom()) return null;
  ensureStylesheet();
  if (feedbackLayer?.isConnected) return feedbackLayer;

  const host = document.querySelector(".shell") || document.body;
  feedbackLayer = document.createElement("div");
  feedbackLayer.className = LAYER_CLASS;
  feedbackLayer.setAttribute("aria-hidden", "true");
  host.append(feedbackLayer);
  return feedbackLayer;
}

function ensureStylesheet() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = `${new URL("./gsapFeedback.css", import.meta.url).href}?v=${CSS_VERSION}`;
  document.head.append(link);
}

function createFeedbackNode(kind, position) {
  const layer = ensureFeedbackLayer();
  if (!layer) return null;
  const node = document.createElement("div");
  node.className = `tst-feedback-node tst-feedback-${kind}`;
  const point = canvasPointToLayerPercent(position || {});
  node.style.left = point.left;
  node.style.top = point.top;
  node.style.setProperty("--feedback-accent", "#7ef7ff");
  node.style.setProperty("--feedback-secondary", "#d7c2ff");
  layer.append(node);
  activeNodes.add(node);
  return node;
}

function makeStatusLines(titleText, subtitleText) {
  const box = document.createElement("div");
  box.className = "tst-feedback-lines";
  const title = document.createElement("div");
  title.className = "tst-feedback-title";
  title.textContent = titleText;
  box.append(title);
  if (subtitleText) box.append(makeSubtitle(subtitleText));
  return box;
}

function makeSubtitle(text) {
  const sub = document.createElement("div");
  sub.className = "tst-feedback-subtitle";
  sub.textContent = String(text);
  return sub;
}

function makeRune(kind) {
  const rune = document.createElement("div");
  rune.className = "tst-feedback-rune";
  rune.dataset.kind = kind;
  return rune;
}

function makeRing() {
  const ring = document.createElement("div");
  ring.className = "tst-feedback-ring";
  return ring;
}

function runStatusAnimation(node, kind) {
  if (prefersReducedMotion()) {
    scheduleRemoval(node, 720);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      scheduleRemoval(node, 820);
      return;
    }
    const rune = node.querySelector(".tst-feedback-rune");
    const title = node.querySelector(".tst-feedback-title");
    const subtitle = node.querySelector(".tst-feedback-subtitle");
    const extraScale = kind === "tspin" ? 1.06 : 1.02;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(node, {
      autoAlpha: 0,
      x: -18,
      y: 12,
      scale: 0.88,
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.28,
    })
      .fromTo(rune, {
        autoAlpha: 0,
        rotation: -24,
        scale: 0.46,
      }, {
        autoAlpha: 1,
        rotation: 0,
        scale: 1,
        duration: 0.32,
      }, "-=0.18")
      .fromTo(title, { y: 8 }, { y: 0, duration: 0.26 }, "-=0.26");
    if (subtitle) {
      tl.fromTo(subtitle, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.18 }, "-=0.18");
    }
    tl.to(node, {
      scale: extraScale,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    }, "-=0.02")
      .to(node, {
        autoAlpha: 0,
        y: -24,
        scale: 0.96,
        duration: 0.28,
        ease: "power2.in",
      }, "+=0.34");
    trackAnimation(node, tl);
  });
}

function runPerfectAnimation(node) {
  if (prefersReducedMotion()) {
    scheduleRemoval(node, 900);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      scheduleRemoval(node, 980);
      return;
    }
    const ring = node.querySelector(".tst-feedback-ring");
    const rune = node.querySelector(".tst-feedback-rune");
    const title = node.querySelector(".tst-feedback-title");
    const subtitle = node.querySelector(".tst-feedback-subtitle");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(node, {
      autoAlpha: 0,
      y: 20,
      scale: 0.56,
      rotationX: 30,
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 0.4,
      ease: "back.out(1.9)",
    })
      .fromTo(ring, {
        autoAlpha: 0.86,
        scale: 0.42,
        rotation: -18,
      }, {
        autoAlpha: 0,
        scale: 1.86,
        rotation: 16,
        duration: 0.7,
      }, 0)
      .fromTo(rune, {
        autoAlpha: 0,
        scale: 0.44,
        rotation: -28,
      }, {
        autoAlpha: 1,
        scale: 1,
        rotation: 0,
        duration: 0.36,
      }, 0.05)
      .fromTo(title, { y: 12 }, { y: 0, duration: 0.24 }, 0.12);
    if (subtitle) {
      tl.fromTo(subtitle, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.18);
    }
    tl.to(node, {
      scale: 1.045,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    }, 0.42)
      .to(node, {
        autoAlpha: 0,
        y: -42,
        scale: 0.94,
        duration: 0.36,
        ease: "power2.in",
      }, "+=0.42");
    trackAnimation(node, tl);
  });
}

function runDamageAnimation(node, amount) {
  const offset = ((damageOffsetIndex % 3) - 1) * 16;
  damageOffsetIndex += 1;

  if (prefersReducedMotion()) {
    node.style.transform = `translate(${offset}px, -22px)`;
    scheduleRemoval(node, 620);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      scheduleRemoval(node, 760);
      return;
    }
    const scale = amount >= 500 ? 1.28 : amount >= 120 ? 1.14 : 1.02;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(node, {
      autoAlpha: 0,
      x: offset,
      y: 14,
      scale: 0.72,
      rotation: -6,
    }, {
      autoAlpha: 1,
      x: offset,
      y: -34,
      scale,
      rotation: 2,
      duration: 0.42,
      ease: "back.out(1.85)",
    })
      .to(node, {
        autoAlpha: 0,
        x: offset + 8,
        y: -78,
        scale: Math.max(0.96, scale - 0.08),
        duration: 0.34,
        ease: "power2.in",
      }, "+=0.24");
    trackAnimation(node, tl);
  });
}

function trackAnimation(node, timeline) {
  activeAnimations.set(node, timeline);
  timeline.eventCallback("onComplete", () => disposeNode(node, { killAnimation: false }));
}

function scheduleRemoval(node, delayMs) {
  clearNodeTimer(node);
  const timer = window.setTimeout(() => disposeNode(node), delayMs);
  activeTimers.set(node, timer);
}

function clearModeCleanupTimer() {
  if (!hasDom() || !modeCleanupTimer) return;
  window.clearTimeout(modeCleanupTimer);
  modeCleanupTimer = 0;
}

function clearNodeTimer(node) {
  const timer = activeTimers.get(node);
  if (!timer) return;
  window.clearTimeout(timer);
  activeTimers.delete(node);
}

function disposeNode(node, { killAnimation = true } = {}) {
  clearNodeTimer(node);
  const animation = activeAnimations.get(node);
  if (animation && killAnimation) animation.kill();
  activeAnimations.delete(node);
  activeNodes.delete(node);
  if (node?.isConnected) node.remove();
}

function prefersReducedMotion() {
  if (!hasDom() || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

if (hasDom()) {
  window.TST_GSAP_FEEDBACK = {
    cleanupFeedback,
    getDiagnostics: getFeedbackDiagnostics,
    initFeedbackLayer,
    loadGsap,
    showB2BFeedback,
    showComboFeedback,
    showDamageNumber,
    showPerfectClearFeedback,
    showTSpinFeedback,
  };
}
