import {
  GSAP_FEEDBACK_CDN_URL,
  canvasPointToLayerPercent,
  getDomOverlayLayer,
  loadGsap,
  prefersReducedMotion,
  registerOverlayCleanup,
} from "./domOverlayRoot.js";

const DEFAULT_CANVAS_SIZE = Object.freeze({ width: 1280, height: 720 });

let configuredCanvasSize = DEFAULT_CANVAS_SIZE;
let previousMode = "";
let modeCleanupTimer = 0;
let damageOffsetIndex = 0;

const activeNodes = new Set();
const activeAnimations = new Map();
const activeTimers = new Map();

function hasDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function normalizeCanvasSize(size = {}) {
  const width = Number.isFinite(size.width) && size.width > 0 ? size.width : DEFAULT_CANVAS_SIZE.width;
  const height = Number.isFinite(size.height) && size.height > 0 ? size.height : DEFAULT_CANVAS_SIZE.height;
  return { width, height };
}

export { GSAP_FEEDBACK_CDN_URL, canvasPointToLayerPercent };

export function makeFeedbackText(kind, payload = {}) {
  if (payload.label) return String(payload.label);
  if (kind === "combo") return `${Math.max(0, payload.combo || 0)} COMBO`;
  if (kind === "b2b") return payload.chain > 1 ? `B2B CHAIN ${payload.chain}` : "B2B READY";
  if (kind === "tspin") return payload.spinType === "mini" ? "T-SPIN MINI" : "T-SPIN";
  if (kind === "perfect") return "PERFECT CLEAR";
  if (kind === "damage") return `-${Math.max(0, Math.floor(payload.amount || 0))}`;
  return "";
}

export function getComboFeedbackIntensity(combo = 0) {
  const count = Math.max(0, Math.floor(Number(combo) || 0));
  if (count >= 7) return "high";
  if (count >= 4) return "medium";
  return "small";
}

export function getDamageFeedbackStrength(amount = 0) {
  const damage = Math.max(0, Math.floor(Number(amount) || 0));
  if (damage >= 500) return "critical";
  if (damage >= 120) return "heavy";
  return "normal";
}

export function getFeedbackVisualProfile(kind, options = {}) {
  if (kind === "combo") {
    const intensity = options.intensity || getComboFeedbackIntensity(options.combo);
    return {
      intensity,
      durationMs: intensity === "high" ? 860 : intensity === "medium" ? 780 : 660,
      punch: intensity === "high" ? 1.13 : intensity === "medium" ? 1.08 : 1.03,
    };
  }
  if (kind === "b2b") {
    const chain = Math.max(0, Math.floor(Number(options.chain) || 0));
    const intensity = chain >= 3 ? "high" : "medium";
    return {
      intensity,
      durationMs: intensity === "high" ? 900 : 780,
      punch: intensity === "high" ? 1.12 : 1.07,
    };
  }
  if (kind === "tspin") {
    const intensity = options.spinType === "mini" ? "medium" : "high";
    return {
      intensity,
      durationMs: intensity === "high" ? 860 : 760,
      punch: intensity === "high" ? 1.14 : 1.08,
    };
  }
  if (kind === "perfect") {
    return { intensity: "ultimate", durationMs: 1180, punch: 1.18 };
  }
  return { intensity: "small", durationMs: 760, punch: 1.04 };
}

export function initFeedbackLayer({ canvasWidth = DEFAULT_CANVAS_SIZE.width, canvasHeight = DEFAULT_CANVAS_SIZE.height } = {}) {
  configuredCanvasSize = normalizeCanvasSize({ width: canvasWidth, height: canvasHeight });
  return getDomOverlayLayer("feedback");
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
  const profile = getFeedbackVisualProfile("perfect", options);
  const node = createFeedbackNode("perfect", options.position, profile);
  if (!node) return null;

  const title = document.createElement("div");
  title.className = "tst-feedback-title";
  title.textContent = makeFeedbackText("perfect", options);
  node.append(
    makePerfectBurst(),
    makeRune("perfect"),
    makeRing("primary"),
    makeRing("secondary"),
    title,
  );
  if (options.subtitle) node.append(makeSubtitle(options.subtitle));
  runPerfectAnimation(node, profile);
  return node;
}

export function showDamageNumber(options = {}) {
  if (!hasDom()) return null;
  const amount = Math.max(0, Math.floor(options.amount || 0));
  if (amount <= 0) return null;

  const strength = getDamageFeedbackStrength(amount);
  const node = createFeedbackNode("damage", options.position, { intensity: strength, durationMs: strength === "critical" ? 1040 : 860 });
  if (!node) return null;
  node.dataset.damageStrength = strength;

  const title = document.createElement("div");
  title.className = "tst-feedback-title";
  title.textContent = makeFeedbackText("damage", { ...options, amount });
  node.append(title);
  runDamageAnimation(node, amount, strength);
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
    layerReady: hasDom() ? Boolean(getDomOverlayLayer("feedback")?.isConnected) : false,
    reducedMotion: prefersReducedMotion(),
  };
}

function showStatusFeedback(kind, options) {
  if (!hasDom()) return null;
  const profile = getFeedbackVisualProfile(kind, options);
  const node = createFeedbackNode(kind, options.position, profile);
  if (!node) return null;

  node.style.setProperty("--feedback-accent", options.accent);
  node.style.setProperty("--feedback-secondary", options.secondary);
  node.style.setProperty("--feedback-punch", String(profile.punch));
  node.append(
    makeStreak(kind),
    makeRune(kind),
    makeStatusLines(options.title, options.subtitle),
  );
  runStatusAnimation(node, kind, profile);
  return node;
}

function createFeedbackNode(kind, position, profile = {}) {
  const layer = getDomOverlayLayer("feedback");
  if (!layer) return null;
  const node = document.createElement("div");
  node.className = `tst-feedback-node tst-feedback-${kind}`;
  node.dataset.feedbackKind = kind;
  node.dataset.intensity = profile.intensity || "small";
  const point = canvasPointToLayerPercent(position || {}, configuredCanvasSize);
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

function makeRing(variant = "primary") {
  const ring = document.createElement("div");
  ring.className = "tst-feedback-ring";
  ring.dataset.ring = variant;
  return ring;
}

function makeStreak(kind) {
  const streak = document.createElement("div");
  streak.className = "tst-feedback-streak";
  streak.dataset.kind = kind;
  return streak;
}

function makePerfectBurst() {
  const burst = document.createElement("div");
  burst.className = "tst-feedback-perfect-burst";
  for (let i = 0; i < 9; i += 1) {
    const particle = document.createElement("span");
    particle.style.setProperty("--burst-angle", `${i * 40}deg`);
    burst.append(particle);
  }
  return burst;
}

function runStatusAnimation(node, kind, profile) {
  if (prefersReducedMotion()) {
    runReducedFade(node, Math.min(profile.durationMs, 760));
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      fallbackAnimate(node, profile.durationMs);
      return;
    }
    const rune = node.querySelector(".tst-feedback-rune");
    const title = node.querySelector(".tst-feedback-title");
    const subtitle = node.querySelector(".tst-feedback-subtitle");
    const streak = node.querySelector(".tst-feedback-streak");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (kind === "b2b") {
      tl.fromTo(node, { autoAlpha: 0, x: -24, y: 6, scale: 0.94 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.18 })
        .fromTo(streak, { autoAlpha: 0, x: -46, scaleX: 0.18 }, { autoAlpha: 1, x: 18, scaleX: 1, duration: 0.22 }, "-=0.12")
        .to(streak, { autoAlpha: 0, x: 62, duration: 0.18 }, "-=0.02")
        .fromTo(rune, { autoAlpha: 0, scale: 0.52, rotation: -18 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.24 }, "-=0.28")
        .fromTo(title, { x: -7, y: 5 }, { x: 0, y: 0, duration: 0.18 }, "-=0.2")
        .to(node, { x: -3, duration: 0.04, yoyo: true, repeat: 3, ease: "steps(1)" }, "-=0.02")
        .to(node, { scale: profile.punch, duration: 0.1, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.02")
        .to(node, { autoAlpha: 0, x: 22, y: -16, scale: 0.98, duration: 0.26, ease: "power2.in" }, "+=0.26");
      trackAnimation(node, tl);
      return;
    }

    if (kind === "tspin") {
      tl.fromTo(node, { autoAlpha: 0, y: 14, scale: 0.78, rotation: -10 }, { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.24, ease: "back.out(2.1)" })
        .fromTo(streak, { autoAlpha: 0, rotation: -26, scale: 0.36 }, { autoAlpha: 0.92, rotation: 0, scale: 1.16, duration: 0.28 }, "-=0.2")
        .to(streak, { autoAlpha: 0, scale: 1.55, duration: 0.26 }, "-=0.06")
        .fromTo(rune, { autoAlpha: 0, scale: 0.4, rotation: -90 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.28 }, "-=0.34")
        .fromTo(title, { y: 8, scale: 0.95 }, { y: 0, scale: 1, duration: 0.18 }, "-=0.2")
        .to(node, { scale: profile.punch, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.02")
        .to(node, { autoAlpha: 0, y: -26, scale: 0.96, duration: 0.28, ease: "power2.in" }, "+=0.28");
      trackAnimation(node, tl);
      return;
    }

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
      duration: 0.22,
    })
      .fromTo(rune, {
        autoAlpha: 0,
        rotation: -24,
        scale: 0.46,
      }, {
        autoAlpha: 1,
        rotation: 0,
        scale: 1,
        duration: 0.26,
      }, "-=0.18")
      .fromTo(title, { y: 8, scale: 0.98 }, { y: 0, scale: 1, duration: 0.2 }, "-=0.22");
    if (subtitle) {
      tl.fromTo(subtitle, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.18 }, "-=0.18");
    }
    tl.to(node, {
      scale: profile.punch,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    }, "-=0.02")
      .to(node, {
        autoAlpha: 0,
        y: -24,
        scale: 0.96,
        duration: 0.24,
        ease: "power2.in",
      }, `+=${profile.intensity === "high" ? 0.26 : 0.22}`);
    trackAnimation(node, tl);
  });
}

function runPerfectAnimation(node, profile) {
  if (prefersReducedMotion()) {
    runReducedFade(node, 900);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      fallbackAnimate(node, profile.durationMs);
      return;
    }
    const ring = node.querySelector('.tst-feedback-ring[data-ring="primary"]');
    const ringSecondary = node.querySelector('.tst-feedback-ring[data-ring="secondary"]');
    const rune = node.querySelector(".tst-feedback-rune");
    const title = node.querySelector(".tst-feedback-title");
    const subtitle = node.querySelector(".tst-feedback-subtitle");
    const particles = [...node.querySelectorAll(".tst-feedback-perfect-burst span")];
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(node, {
      autoAlpha: 0,
      y: 20,
      scale: 0.5,
      rotationX: 30,
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 0.34,
      ease: "back.out(2.2)",
    })
      .fromTo(ring, {
        autoAlpha: 0.86,
        scale: 0.42,
        rotation: -18,
      }, {
        autoAlpha: 0,
        scale: 2.08,
        rotation: 16,
        duration: 0.76,
      }, 0)
      .fromTo(ringSecondary, {
        autoAlpha: 0.64,
        scale: 0.28,
        rotation: 26,
      }, {
        autoAlpha: 0,
        scale: 2.42,
        rotation: -18,
        duration: 0.88,
      }, 0.08)
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
      .fromTo(title, { y: 12, scale: 0.82 }, { y: 0, scale: 1, duration: 0.22 }, 0.12)
      .fromTo(particles, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 0.3,
      }, {
        autoAlpha: 0.86,
        x: (index) => Math.cos((index * 40 * Math.PI) / 180) * 82,
        y: (index) => Math.sin((index * 40 * Math.PI) / 180) * 46,
        scale: 1,
        duration: 0.34,
        stagger: 0.012,
      }, 0.12)
      .to(particles, { autoAlpha: 0, scale: 0.2, duration: 0.28 }, 0.42);
    if (subtitle) {
      tl.fromTo(subtitle, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.18);
    }
    tl.to(node, {
      scale: profile.punch,
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
      }, "+=0.34");
    trackAnimation(node, tl);
  });
}

function runDamageAnimation(node, amount, strength) {
  const offset = ((damageOffsetIndex % 3) - 1) * 16;
  damageOffsetIndex += 1;

  if (prefersReducedMotion()) {
    runReducedFade(node, 620);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      node.style.transform = `translate(${offset}px, -22px)`;
      fallbackAnimate(node, strength === "critical" ? 940 : 760);
      return;
    }
    const scale = strength === "critical" ? 1.34 : strength === "heavy" ? 1.18 : 1.04;
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
      y: strength === "critical" ? -42 : -34,
      scale,
      rotation: 2,
      duration: strength === "critical" ? 0.46 : 0.38,
      ease: "back.out(1.85)",
    })
      .to(node, {
        y: strength === "critical" ? -50 : -40,
        scale: Math.max(1, scale - 0.08),
        duration: 0.14,
        ease: "sine.out",
      })
      .to(node, {
        autoAlpha: 0,
        x: offset + 8,
        y: strength === "critical" ? -96 : -78,
        scale: Math.max(0.96, scale - 0.08),
        duration: 0.32,
        ease: "power2.in",
      }, "+=0.24");
    trackAnimation(node, tl);
  });
}

function fallbackAnimate(node, delayMs) {
  node.classList.add("tst-dom-fallback-inout");
  scheduleRemoval(node, delayMs);
}

function runReducedFade(node, delayMs) {
  node.classList.add("tst-dom-reduced-fade");
  clearNodeTimer(node);
  const fadeDelay = Math.max(0, delayMs - 180);
  const timer = window.setTimeout(() => {
    if (!node.isConnected) return;
    node.classList.add("tst-dom-reduced-fade-out");
    const removeTimer = window.setTimeout(() => disposeNode(node), 180);
    activeTimers.set(node, removeTimer);
  }, fadeDelay);
  activeTimers.set(node, timer);
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

registerOverlayCleanup(cleanupFeedback);

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
