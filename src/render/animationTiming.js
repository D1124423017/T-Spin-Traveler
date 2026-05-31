import { clamp } from "./drawUtils.js";

export function getAnimationFrameDuration(config, index) {
  if (Array.isArray(config?.timing) && config.timing.length) {
    const value = Number(config.timing[Math.min(index, config.timing.length - 1)]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  const fallback = Number(config?.frameMs);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 100;
}

export function getAnimationDuration(config) {
  if (!config?.frames?.length) return 0;
  let duration = 0;
  for (let i = 0; i < config.frames.length; i += 1) {
    duration += getAnimationFrameDuration(config, i);
  }
  return duration;
}

export function getAnimationFrameInfo(config, elapsed) {
  const frames = config?.frames || [];
  if (!frames.length) return { frameIndex: 0, frame: 0, local: 0, frameDuration: 100 };
  let remaining = Math.max(0, elapsed);
  for (let i = 0; i < frames.length; i += 1) {
    const frameDuration = getAnimationFrameDuration(config, i);
    if (remaining < frameDuration || i === frames.length - 1) {
      return {
        frameIndex: i,
        frame: frames[i],
        local: clamp(remaining / frameDuration, 0, 1),
        frameDuration,
      };
    }
    remaining -= frameDuration;
  }
  const lastIndex = frames.length - 1;
  return {
    frameIndex: lastIndex,
    frame: frames[lastIndex],
    local: 1,
    frameDuration: getAnimationFrameDuration(config, lastIndex),
  };
}

export function getAnimationHitDelay(config, fallbackRatio) {
  const duration = getAnimationDuration(config);
  if (duration <= 0) return 0;
  if (typeof config.hitRatio === "number") return Math.floor(duration * config.hitRatio);
  const fallbackFrame = Math.floor((config.frames?.length || 1) * fallbackRatio);
  const hitFrame = clamp(
    typeof config.hitFrame === "number" ? config.hitFrame : fallbackFrame,
    0,
    Math.max(0, (config.frames?.length || 1) - 1),
  );
  let delay = 0;
  for (let i = 0; i < hitFrame; i += 1) delay += getAnimationFrameDuration(config, i);
  delay += getAnimationFrameDuration(config, hitFrame) * 0.5;
  return Math.min(Math.max(0, duration - 40), Math.floor(delay));
}
