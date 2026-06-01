import {
  getDomOverlayLayer,
  loadGsap,
  prefersReducedMotion,
  registerOverlayCleanup,
} from "./domOverlayRoot.js";

const DEFAULT_TOAST_DURATION_MS = 1800;
const MAX_TOASTS = 4;

const activeToasts = new Set();
const activeAnimations = new Map();
const activeTimers = new Map();

function hasDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function normalizeToastEvent(event = {}) {
  const duration = Number(event.durationMs);
  return {
    type: String(event.type || "info"),
    text: String(event.text || ""),
    tone: String(event.tone || event.type || "rift"),
    durationMs: Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_TOAST_DURATION_MS,
  };
}

export function showToast(event = {}) {
  if (!hasDom()) return null;
  const toast = normalizeToastEvent(event);
  if (!toast.text.trim()) return null;

  const layer = getDomOverlayLayer("toast");
  if (!layer) return null;
  trimToastStack();

  const stackIndex = activeToasts.size;
  const node = document.createElement("div");
  node.className = `tst-toast tst-toast-${sanitizeTone(toast.tone)}`;
  node.dataset.toastType = toast.type;
  node.dataset.toastTone = toast.tone;
  node.style.setProperty("--toast-stack-index", String(stackIndex));
  node.style.setProperty("--toast-duration-ms", `${toast.durationMs}ms`);
  node.textContent = toast.text;
  layer.prepend(node);
  activeToasts.add(node);
  runToastAnimation(node, toast.durationMs, stackIndex);
  return node;
}

export function cleanupToasts() {
  if (!hasDom()) return;
  for (const node of [...activeToasts]) disposeToast(node);
}

export function getToastDiagnostics() {
  return {
    activeToasts: activeToasts.size,
    maxToasts: MAX_TOASTS,
  };
}

function sanitizeTone(tone) {
  return String(tone || "rift").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "rift";
}

function trimToastStack() {
  while (activeToasts.size >= MAX_TOASTS) {
    const oldest = [...activeToasts][0];
    if (!oldest) return;
    disposeToast(oldest);
  }
}

function runToastAnimation(node, durationMs, stackIndex = 0) {
  if (prefersReducedMotion()) {
    runReducedFade(node, durationMs);
    return;
  }

  loadGsap().then((gsap) => {
    if (!node.isConnected) return;
    if (!gsap) {
      node.classList.add("tst-dom-fallback-inout");
      scheduleRemoval(node, durationMs);
      return;
    }
    const holdSeconds = Math.max(0.35, (durationMs - 520) / 1000);
    const delay = Math.min(0.12, stackIndex * 0.035);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(node, {
      autoAlpha: 0,
      x: 34,
      y: -8,
      scale: 0.94,
      filter: "brightness(1.6)",
    }, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "brightness(1)",
      duration: 0.22,
      delay,
    })
      .to(node, { filter: "brightness(1.08)", duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.02")
      .to(node, {
        autoAlpha: 0,
        x: 28,
        y: -10,
        scale: 0.98,
        duration: 0.28,
        ease: "power2.in",
      }, `+=${holdSeconds}`);
    activeAnimations.set(node, tl);
    tl.eventCallback("onComplete", () => disposeToast(node, { killAnimation: false }));
  });
}

function scheduleRemoval(node, delayMs) {
  clearToastTimer(node);
  const timer = window.setTimeout(() => disposeToast(node), delayMs);
  activeTimers.set(node, timer);
}

function runReducedFade(node, delayMs) {
  node.classList.add("tst-dom-reduced-fade");
  clearToastTimer(node);
  const fadeDelay = Math.max(0, delayMs - 180);
  const timer = window.setTimeout(() => {
    if (!node.isConnected) return;
    node.classList.add("tst-dom-reduced-fade-out");
    const removeTimer = window.setTimeout(() => disposeToast(node), 180);
    activeTimers.set(node, removeTimer);
  }, fadeDelay);
  activeTimers.set(node, timer);
}

function clearToastTimer(node) {
  const timer = activeTimers.get(node);
  if (!timer) return;
  window.clearTimeout(timer);
  activeTimers.delete(node);
}

function disposeToast(node, { killAnimation = true } = {}) {
  clearToastTimer(node);
  const animation = activeAnimations.get(node);
  if (animation && killAnimation) animation.kill();
  activeAnimations.delete(node);
  activeToasts.delete(node);
  if (node?.isConnected) node.remove();
}

registerOverlayCleanup(cleanupToasts);

if (hasDom()) {
  window.TST_DOM_OVERLAY = {
    ...(window.TST_DOM_OVERLAY || {}),
    showToast,
    cleanupToasts,
    getToastDiagnostics,
  };
}
