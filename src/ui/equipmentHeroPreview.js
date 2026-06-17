const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const FRAME_COUNT = GRID_COLUMNS * GRID_ROWS;
const DEFAULT_FRAME_MS = 190;
const DEFAULT_IDLE_DELAY_MIN_MS = 5000;
const DEFAULT_IDLE_DELAY_MAX_MS = 8000;
const DEFAULT_IDLE_FADE_MS = 180;
const DEFAULT_IDLE_RESET_GAP_MS = 1200;

function easePulse(edge, value) {
  const safeEdge = Math.max(1, Number(edge) || DEFAULT_IDLE_FADE_MS);
  const t = Math.max(0, Math.min(1, Number(value) / safeEdge));
  return t * t * (3 - 2 * t);
}

function normalizeIdleAnimation(animation, fallbackFrameMs = DEFAULT_FRAME_MS) {
  if (!animation) return null;
  return {
    id: animation.id || "",
    image: animation.image,
    frameMs: Math.max(1, Number(animation.frameMs) || fallbackFrameMs),
    frameCount: Math.max(1, Math.floor(Number(animation.frameCount) || FRAME_COUNT)),
  };
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function getAnimationDuration(animation) {
  return Math.max(1, animation.frameCount * animation.frameMs);
}

function getRandomDelay(random, minMs, maxMs) {
  const t = clamp01(random());
  return minMs + (maxMs - minMs) * t;
}

function pickRandomAnimation(animations, random) {
  const t = clamp01(random());
  const index = Math.min(animations.length - 1, Math.floor(t * animations.length));
  return animations[index];
}

export function getEquipmentHeroFrameIndex(
  elapsed,
  {
    frameMs = DEFAULT_FRAME_MS,
    frameCount = FRAME_COUNT,
    reducedMotion = false,
  } = {},
) {
  if (reducedMotion) return 0;
  const safeFrameMs = Math.max(1, Number(frameMs) || DEFAULT_FRAME_MS);
  const safeFrameCount = Math.max(1, Math.floor(Number(frameCount) || FRAME_COUNT));
  return Math.floor(Math.max(0, Number(elapsed) || 0) / safeFrameMs) % safeFrameCount;
}

export function getEquipmentHeroFrameSource(image, frameIndex) {
  const frameWidth = Math.max(1, (image?.naturalWidth || 2048) / GRID_COLUMNS);
  const frameHeight = Math.max(1, (image?.naturalHeight || 3072) / GRID_ROWS);
  const safeIndex = Math.max(0, Math.floor(Number(frameIndex) || 0)) % FRAME_COUNT;
  return {
    x: (safeIndex % GRID_COLUMNS) * frameWidth,
    y: Math.floor(safeIndex / GRID_COLUMNS) * frameHeight,
    w: frameWidth,
    h: frameHeight,
  };
}

export function createEquipmentHeroIdlePlayback(
  {
    animations = [],
    delayMinMs = DEFAULT_IDLE_DELAY_MIN_MS,
    delayMaxMs = DEFAULT_IDLE_DELAY_MAX_MS,
    fadeMs = DEFAULT_IDLE_FADE_MS,
    resetGapMs = DEFAULT_IDLE_RESET_GAP_MS,
    random = Math.random,
  } = {},
) {
  const normalized = animations
    .map((animation) => normalizeIdleAnimation(animation))
    .filter(Boolean);
  const safeMin = Math.max(0, Number(delayMinMs) || DEFAULT_IDLE_DELAY_MIN_MS);
  const safeMax = Math.max(safeMin, Number(delayMaxMs) || DEFAULT_IDLE_DELAY_MAX_MS);
  const safeFade = Math.max(1, Number(fadeMs) || DEFAULT_IDLE_FADE_MS);
  const safeResetGap = Math.max(0, Number(resetGapMs) || DEFAULT_IDLE_RESET_GAP_MS);
  const getRandom = typeof random === "function" ? random : Math.random;
  let initialized = false;
  let nextStartAt = Number.POSITIVE_INFINITY;
  let activeAnimation = null;
  let activeStartedAt = 0;
  let lastTickAt = null;

  function scheduleNext(fromTime) {
    activeAnimation = null;
    activeStartedAt = 0;
    nextStartAt = normalized.length
      ? fromTime + getRandomDelay(getRandom, safeMin, safeMax)
      : Number.POSITIVE_INFINITY;
  }

  function reset(time = 0) {
    initialized = false;
    activeAnimation = null;
    activeStartedAt = 0;
    lastTickAt = null;
    nextStartAt = Number.POSITIVE_INFINITY;
    if (Number.isFinite(time)) {
      initialized = true;
      scheduleNext(Math.max(0, Number(time) || 0));
    }
  }

  function get(elapsed, { reducedMotion = false } = {}) {
    const time = Math.max(0, Number(elapsed) || 0);
    if (
      initialized
      && lastTickAt !== null
      && safeResetGap > 0
      && time - lastTickAt > safeResetGap
    ) {
      reset(time);
      lastTickAt = time;
      return null;
    }

    if (!initialized) {
      initialized = true;
      scheduleNext(time);
      lastTickAt = time;
      return null;
    }

    lastTickAt = time;
    if (reducedMotion || !normalized.length) return null;

    if (!activeAnimation && time >= nextStartAt) {
      activeAnimation = pickRandomAnimation(normalized, getRandom);
      activeStartedAt = time;
    }

    if (!activeAnimation) return null;

    const local = time - activeStartedAt;
    const duration = getAnimationDuration(activeAnimation);
    if (local >= duration) {
      scheduleNext(time);
      return null;
    }

    const fadeIn = easePulse(safeFade, local);
    const fadeOut = easePulse(safeFade, duration - local);
    return {
      animation: activeAnimation,
      elapsed: local,
      alpha: Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut))),
    };
  }

  return {
    get,
    reset,
  };
}

export function createEquipmentHeroPreviewRenderer({
  ctx,
  idleSheet,
  idleAnimations = [],
  idleDelayMinMs = DEFAULT_IDLE_DELAY_MIN_MS,
  idleDelayMaxMs = DEFAULT_IDLE_DELAY_MAX_MS,
  idleFadeMs = DEFAULT_IDLE_FADE_MS,
  idleRandom = Math.random,
  fallbackArt,
  isImageReady,
  drawImageContain,
  now = () => performance.now(),
  reducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true,
} = {}) {
  const idlePlayback = createEquipmentHeroIdlePlayback({
    animations: idleAnimations,
    delayMinMs: idleDelayMinMs,
    delayMaxMs: idleDelayMaxMs,
    fadeMs: idleFadeMs,
    random: idleRandom,
  });

  function draw({ stageRect, imageRect } = {}) {
    const time = Math.max(0, Number(now()) || 0);
    const motionReduced = Boolean(reducedMotion());
    drawRiftAura(stageRect, time, motionReduced);
    drawRiftPlatform(stageRect, time, motionReduced);

    ctx.save();
    ctx.shadowColor = "rgba(155, 105, 255, 0.58)";
    ctx.shadowBlur = motionReduced ? 18 : 22 + Math.sin(time / 520) * 4;
    const playback = idlePlayback.get(time, {
      reducedMotion: motionReduced,
    });
    if (playback && isImageReady(playback.animation.image)) {
      if (playback.alpha < 0.98) {
        ctx.save();
        ctx.globalAlpha *= 1 - playback.alpha;
        drawImageContain(
          fallbackArt,
          imageRect.x,
          imageRect.y,
          imageRect.w,
          imageRect.h,
        );
        ctx.restore();
      }
      drawIdleSheetFrame(
        playback.animation.image,
        getEquipmentHeroFrameIndex(playback.elapsed, {
          frameMs: playback.animation.frameMs,
          frameCount: playback.animation.frameCount,
        }),
        imageRect,
        playback.alpha,
      );
    } else {
      drawStaticHero(imageRect);
    }
    ctx.restore();
  }

  function drawStaticHero(imageRect) {
    if (isImageReady(fallbackArt)) {
      drawImageContain(
        fallbackArt,
        imageRect.x,
        imageRect.y,
        imageRect.w,
        imageRect.h,
      );
      return;
    }
    if (isImageReady(idleSheet)) {
      drawIdleSheetFrame(idleSheet, 0, imageRect);
      return;
    }
    drawImageContain(
      fallbackArt,
      imageRect.x,
      imageRect.y,
      imageRect.w,
      imageRect.h,
    );
  }

  function drawIdleSheetFrame(image, frameIndex, imageRect, alpha = 1) {
    const source = getEquipmentHeroFrameSource(image, frameIndex);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(
      image,
      source.x,
      source.y,
      source.w,
      source.h,
      imageRect.x,
      imageRect.y,
      imageRect.w,
      imageRect.h,
    );
    ctx.restore();
  }

  function drawRiftAura(rect, time, motionReduced) {
    const pulse = motionReduced ? 0.5 : 0.5 + Math.sin(time / 720) * 0.12;
    const centerX = rect.x + rect.w * 0.5;
    const centerY = rect.y + rect.h * 0.48;
    const aura = ctx.createRadialGradient(
      centerX,
      centerY,
      18,
      centerX,
      centerY,
      rect.w * 0.48,
    );
    aura.addColorStop(0, `rgba(139, 91, 255, ${0.17 + pulse * 0.1})`);
    aura.addColorStop(0.52, "rgba(70, 151, 255, 0.08)");
    aura.addColorStop(1, "rgba(4, 7, 17, 0)");
    ctx.save();
    ctx.fillStyle = aura;
    ctx.fillRect(rect.x + 8, rect.y + 26, rect.w - 16, rect.h - 40);
    ctx.restore();
  }

  function drawRiftPlatform(rect, time, motionReduced) {
    const pulse = motionReduced ? 0.62 : 0.62 + Math.sin(time / 600) * 0.08;
    const centerX = rect.x + rect.w * 0.5;
    const centerY = rect.y + rect.h - 19;
    ctx.save();
    ctx.fillStyle = `rgba(72, 52, 154, ${0.12 + pulse * 0.08})`;
    ctx.strokeStyle = `rgba(152, 114, 255, ${0.34 + pulse * 0.22})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, rect.w * 0.36, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgba(102, 196, 255, ${0.18 + pulse * 0.14})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, rect.w * 0.25, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const innerX = centerX + Math.cos(angle) * rect.w * 0.28;
      const innerY = centerY + Math.sin(angle) * 10;
      const outerX = centerX + Math.cos(angle) * rect.w * 0.34;
      const outerY = centerY + Math.sin(angle) * 14;
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }
    ctx.restore();
  }

  return {
    draw,
  };
}
