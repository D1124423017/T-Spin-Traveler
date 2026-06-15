const gsap = window.gsap;

const demoState = {
  calloutIndex: 0,
  damageIndex: 0,
  toastIndex: 0,
};

const callouts = [
  { word: "Combo x7", sub: "Chain delay / 268 DMG", color: "#7ef7ff", accent: "#ffb7ff" },
  { word: "T-Spin", sub: "Rift cut / 412 DMG", color: "#ffb7ff", accent: "#8ff7ff" },
  { word: "Perfect Clear", sub: "Star crown / 920 DMG", color: "#fff0a6", accent: "#8ff7ff" },
];

const toastMessages = [
  "Guard +12: star mirror aligned",
  "Angel bond awakened",
  "Devil pact ignited",
  "Relic draft ready",
];

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function requireGsap() {
  if (gsap) return true;
  document.body.dataset.gsapReady = "false";
  const stack = qs(".toast-stack");
  if (stack) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "GSAP CDN unavailable";
    stack.append(toast);
  }
  window.GSAP_TEST_READY = false;
  return false;
}

function initMenuMotion() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".kicker", { autoAlpha: 0, y: 14, duration: 0.45 })
    .from("h1", { autoAlpha: 0, y: 32, scale: 0.96, duration: 0.68 }, "-=0.24")
    .from(".subtitle", { autoAlpha: 0, y: 18, duration: 0.5 }, "-=0.32")
    .from(".menu-preview", { autoAlpha: 0, x: 34, duration: 0.56 }, "-=0.4")
    .from(".menu-button", {
      autoAlpha: 0,
      y: 22,
      scale: 0.96,
      stagger: 0.08,
      duration: 0.48,
    }, "-=0.34")
    .from(".noa-orbit", { autoAlpha: 0, y: 30, scale: 0.96, duration: 0.7 }, "-=0.56");

  qsa(".menu-button, .mini-action, .toast-trigger").forEach((button) => {
    const enter = () => gsap.to(button, {
      scale: button.classList.contains("primary") ? 1.035 : 1.025,
      y: -2,
      filter: "drop-shadow(0 0 16px rgba(126, 247, 255, 0.42))",
      duration: 0.24,
      ease: "power2.out",
      overwrite: "auto",
    });
    const leave = () => gsap.to(button, {
      scale: 1,
      y: 0,
      filter: "drop-shadow(0 0 0 rgba(126, 247, 255, 0))",
      duration: 0.26,
      ease: "power2.out",
      overwrite: "auto",
    });
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("focus", enter);
    button.addEventListener("blur", leave);
  });
}

function initAmbientMotion() {
  gsap.to(".ring-a", { rotation: 360, duration: 24, ease: "none", repeat: -1 });
  gsap.to(".ring-b", { rotation: -360, duration: 18, ease: "none", repeat: -1 });
  gsap.to(".ring-c", { rotation: 360, duration: 12, ease: "none", repeat: -1 });
  gsap.to(".star-line", {
    opacity: 0.28,
    duration: 1.6,
    stagger: 0.22,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(".orbit-glow", {
    scale: 1.12,
    opacity: 0.78,
    duration: 2.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function playLoading() {
  const fill = qs(".loading-fill");
  const spark = qs(".loading-spark");
  const rings = qsa(".loading-orbit span");
  if (!fill || !spark) return;

  gsap.killTweensOf([fill, spark, ...rings]);
  gsap.set(fill, { width: "0%" });
  gsap.set(spark, { left: "0%" });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.to(rings, {
    rotation: (index) => (index % 2 ? -180 : 180),
    scale: (index) => 1.06 + index * 0.02,
    duration: 0.8,
    stagger: 0.08,
  }, 0)
    .to(fill, { width: "100%", duration: 1.42, ease: "power2.inOut" }, 0.08)
    .to(spark, { left: "100%", duration: 1.42, ease: "power2.inOut" }, 0.08)
    .to(rings, { scale: 1, duration: 0.38, stagger: 0.05 }, "-=0.22");
}

function spawnDamage() {
  const layer = qs(".damage-layer");
  const core = qs(".enemy-core");
  const runes = qsa(".impact-runes span");
  if (!layer || !core) return;

  const amounts = [128, 246, 412, 920];
  const amount = amounts[demoState.damageIndex % amounts.length];
  demoState.damageIndex += 1;

  const node = document.createElement("div");
  node.className = "damage-number";
  node.textContent = `-${amount}`;
  layer.append(node);

  const offset = (demoState.damageIndex % 3 - 1) * 24;
  gsap.fromTo(node, {
    autoAlpha: 0,
    x: offset,
    y: 12,
    scale: 0.72,
    rotation: -6,
  }, {
    autoAlpha: 1,
    y: -42,
    scale: amount >= 900 ? 1.38 : 1.05,
    rotation: 2,
    duration: 0.72,
    ease: "back.out(1.8)",
  });
  gsap.to(node, {
    autoAlpha: 0,
    y: -86,
    duration: 0.38,
    delay: 0.5,
    ease: "power2.in",
    onComplete: () => node.remove(),
  });
  gsap.fromTo(core, { x: -5, filter: "brightness(1.8)" }, {
    x: 0,
    filter: "brightness(1)",
    duration: 0.42,
    ease: "elastic.out(1, 0.28)",
  });
  gsap.fromTo(runes, {
    autoAlpha: 0.8,
    x: 0,
    y: 0,
    scale: 0.4,
  }, {
    autoAlpha: 0,
    x: (index) => Math.cos(index * Math.PI * 0.5) * 76,
    y: (index) => Math.sin(index * Math.PI * 0.5) * 54,
    scale: 1.2,
    duration: 0.62,
    stagger: 0.02,
    ease: "power3.out",
  });
}

function playCallout() {
  const item = callouts[demoState.calloutIndex % callouts.length];
  demoState.calloutIndex += 1;

  const word = qs(".callout-word");
  const sub = qs(".callout-sub");
  if (!word || !sub) return;

  word.textContent = item.word;
  sub.textContent = item.sub;
  word.style.color = item.color;
  word.style.textShadow = `0 0 18px ${item.accent}, 0 0 44px ${item.color}`;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(word, {
    autoAlpha: 0,
    scale: 0.58,
    y: 18,
    rotationX: 34,
  }, {
    autoAlpha: 1,
    scale: 1,
    y: 0,
    rotationX: 0,
    duration: 0.58,
  })
    .fromTo(sub, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.34 }, "-=0.18")
    .to(word, { scale: 1.035, duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.05");
}

function playBond() {
  const cards = qsa(".bond-card");
  if (!cards.length) return;

  gsap.fromTo(cards, {
    y: 18,
    scale: 0.96,
    filter: "brightness(0.82)",
    "--aura-opacity": 0,
  }, {
    y: 0,
    scale: 1,
    filter: "brightness(1.22)",
    "--aura-opacity": 0.86,
    duration: 0.42,
    stagger: 0.12,
    ease: "back.out(1.7)",
  });
  cards.forEach((card, index) => {
    const mark = qs(".bond-mark", card);
    gsap.fromTo(mark, {
      rotation: -16,
      scale: 0.82,
    }, {
      rotation: 0,
      scale: 1.12,
      duration: 0.44,
      delay: index * 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    });
    gsap.fromTo(card, {
      boxShadow: "0 0 0 rgba(126, 247, 255, 0)",
    }, {
      boxShadow: card.classList.contains("angel")
        ? "0 0 30px rgba(223, 247, 255, 0.3)"
        : "0 0 30px rgba(255, 143, 202, 0.26)",
      duration: 0.34,
      delay: index * 0.1,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    });
    gsap.to(card, {
      "--aura-opacity": 0,
      duration: 0.44,
      delay: 0.52 + index * 0.08,
      ease: "power2.out",
    });
  });
}

function showToast(message = toastMessages[demoState.toastIndex % toastMessages.length]) {
  demoState.toastIndex += 1;
  const stack = qs(".toast-stack");
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  stack.prepend(toast);

  gsap.fromTo(toast, {
    autoAlpha: 0,
    x: 42,
    y: 10,
    scale: 0.96,
  }, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: 0.38,
    ease: "power3.out",
  });
  gsap.to(toast, {
    autoAlpha: 0,
    x: 22,
    duration: 0.28,
    delay: 2.35,
    ease: "power2.in",
    onComplete: () => toast.remove(),
  });
}

function bindActions() {
  qsa("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "loading") playLoading();
      if (action === "combat") spawnDamage();
      if (action === "callout") playCallout();
      if (action === "bond") playBond();
      if (action === "toast") showToast();
    });
  });
}

function startDemoLoops() {
  playLoading();
  spawnDamage();
  playCallout();
  playBond();
  showToast("GSAP motion lab online");

  gsap.delayedCall(1.9, spawnDamage);
  gsap.delayedCall(2.4, playCallout);
  gsap.delayedCall(3.1, playBond);
}

function init() {
  document.body.dataset.gsapReady = "true";
  gsap.defaults({ overwrite: "auto" });
  initMenuMotion();
  initAmbientMotion();
  bindActions();
  startDemoLoops();
  window.GSAP_TEST_READY = true;
  window.__gsapTestDiagnostics = () => ({
    ready: window.GSAP_TEST_READY === true,
    gsapVersion: gsap.version,
    buttons: qsa(".menu-button").length,
    panels: qsa(".demo-panel").length,
    toasts: qsa(".toast").length,
  });
}

if (requireGsap()) {
  init();
}
