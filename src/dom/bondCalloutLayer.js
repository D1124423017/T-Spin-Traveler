import {
  getDomOverlayLayer,
  loadGsap,
  prefersReducedMotion,
  registerOverlayCleanup,
} from "./domOverlayRoot.js";

const DEFAULT_BOND_CALLOUT_DURATION_MS = 1350;
const MAX_BOND_CALLOUTS = 3;
const BOND_CALLOUT_DEDUPE_MS = 360;

const activeCallouts = new Set();
const activeAnimations = new Map();
const activeTimers = new Map();
const recentCallouts = new Map();

function hasDom() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function normalizeBondCallout(event = {}) {
  const family = String(event.family || "angel").toLowerCase() === "devil" ? "devil" : "angel";
  const duration = Number(event.durationMs);
  return {
    family,
    text: String(event.text || ""),
    detail: String(event.detail || ""),
    durationMs: Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_BOND_CALLOUT_DURATION_MS,
  };
}

export function showBondCallout(event = {}) {
  if (!hasDom()) return null;
  const callout = normalizeBondCallout(event);
  if (!callout.text.trim()) return null;
  if (isDuplicateCallout(callout)) return null;

  const stack = getBondStack();
  if (!stack) return null;
  trimBondStack();

  const node = document.createElement("div");
  node.className = `tst-bond-callout tst-bond-callout-${callout.family}`;
  node.dataset.bondFamily = callout.family;
  const rune = document.createElement("div");
  rune.className = "tst-bond-rune";
  const textBox = document.createElement("div");
  textBox.className = "tst-bond-text";
  const title = document.createElement("div");
  title.className = "tst-bond-title";
  title.textContent = callout.text;
  textBox.append(title);
  if (callout.detail) {
    const detail = document.createElement("div");
    detail.className = "tst-bond-detail";
    detail.textContent = callout.detail;
    textBox.append(detail);
  }
  node.append(rune, textBox);
  stack.prepend(node);
  activeCallouts.add(node);
  runBondAnimation(node, callout.durationMs);
  return node;
}

export function cleanupBondCallouts() {
  if (!hasDom()) return;
  for (const node of [...activeCallouts]) disposeBondCallout(node);
}

export function getBondCalloutDiagnostics() {
  return {
    activeCallouts: activeCallouts.size,
    maxCallouts: MAX_BOND_CALLOUTS,
  };
}

function getBondStack() {
  const layer = getDomOverlayLayer("bond");
  if (!layer) return null;
  let stack = layer.querySelector(".tst-bond-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "tst-bond-stack";
    layer.append(stack);
  }
  return stack;
}

function trimBondStack() {
  while (activeCallouts.size >= MAX_BOND_CALLOUTS) {
    const oldest = [...activeCallouts][0];
    if (!oldest) return;
    disposeBondCallout(oldest);
  }
}

function isDuplicateCallout(callout) {
  const key = `${callout.family}:${callout.text}:${callout.detail}`;
  const now = typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
  const hadRecent = recentCallouts.has(key);
  const lastAt = recentCallouts.get(key) || 0;
  recentCallouts.set(key, now);
  return hadRecent && now - lastAt < BOND_CALLOUT_DEDUPE_MS;
}

function runBondAnimation(node, durationMs) {
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
    const rune = node.querySelector(".tst-bond-rune");
    const title = node.querySelector(".tst-bond-title");
    const family = node.dataset.bondFamily;
    const holdSeconds = Math.max(0.38, (durationMs - 560) / 1000);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const intro = family === "devil"
      ? { autoAlpha: 0, x: -22, y: 4, scale: 0.88, filter: "brightness(1.65) saturate(1.3)" }
      : { autoAlpha: 0, x: -18, y: 14, scale: 0.94, filter: "brightness(1.35) saturate(1.08)" };
    tl.fromTo(node, intro, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "brightness(1) saturate(1)",
      duration: family === "devil" ? 0.18 : 0.32,
      ease: family === "devil" ? "power4.out" : "power3.out",
    })
      .fromTo(rune, {
        autoAlpha: 0,
        rotation: family === "devil" ? 24 : -34,
        scale: family === "devil" ? 0.58 : 0.44,
      }, {
        autoAlpha: 1,
        rotation: 0,
        scale: 1,
        duration: family === "devil" ? 0.22 : 0.34,
      }, "-=0.16")
      .fromTo(title, { y: family === "devil" ? 3 : 7 }, { y: 0, duration: 0.18 }, "-=0.2");
    if (family === "devil") {
      tl.to(node, { x: -2, duration: 0.035, yoyo: true, repeat: 5, ease: "steps(1)" }, "-=0.02")
        .to(node, { scale: 1.045, filter: "brightness(1.22)", duration: 0.08, yoyo: true, repeat: 1 }, "-=0.02");
    } else {
      tl.to(node, { y: -2, filter: "brightness(1.12)", duration: 0.22, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.02");
    }
    tl
      .to(node, {
        autoAlpha: 0,
        x: family === "devil" ? -22 : -16,
        y: family === "devil" ? -10 : -20,
        scale: family === "devil" ? 0.98 : 0.96,
        duration: family === "devil" ? 0.24 : 0.32,
        ease: "power2.in",
      }, `+=${holdSeconds}`);
    activeAnimations.set(node, tl);
    tl.eventCallback("onComplete", () => disposeBondCallout(node, { killAnimation: false }));
  });
}

function scheduleRemoval(node, delayMs) {
  clearBondTimer(node);
  const timer = window.setTimeout(() => disposeBondCallout(node), delayMs);
  activeTimers.set(node, timer);
}

function runReducedFade(node, delayMs) {
  node.classList.add("tst-dom-reduced-fade");
  clearBondTimer(node);
  const fadeDelay = Math.max(0, delayMs - 180);
  const timer = window.setTimeout(() => {
    if (!node.isConnected) return;
    node.classList.add("tst-dom-reduced-fade-out");
    const removeTimer = window.setTimeout(() => disposeBondCallout(node), 180);
    activeTimers.set(node, removeTimer);
  }, fadeDelay);
  activeTimers.set(node, timer);
}

function clearBondTimer(node) {
  const timer = activeTimers.get(node);
  if (!timer) return;
  window.clearTimeout(timer);
  activeTimers.delete(node);
}

function disposeBondCallout(node, { killAnimation = true } = {}) {
  clearBondTimer(node);
  const animation = activeAnimations.get(node);
  if (animation && killAnimation) animation.kill();
  activeAnimations.delete(node);
  activeCallouts.delete(node);
  if (node?.isConnected) node.remove();
}

registerOverlayCleanup(cleanupBondCallouts);

if (hasDom()) {
  window.TST_DOM_OVERLAY = {
    ...(window.TST_DOM_OVERLAY || {}),
    showBondCallout,
    cleanupBondCallouts,
    getBondCalloutDiagnostics,
  };
}
