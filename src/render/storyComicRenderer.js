import {
  clamp,
  drawRoundedRect,
  hexToRgba,
  pointInRect,
} from "./drawUtils.js";
import { drawBorderGlow } from "../ui/borderGlow.js";
import {
  createStoryComicOverlayModel,
  getStoryComicLayout,
} from "../ui/storyComicOverlay.js";
import {
  getStoryUiEntryMotion,
  getStoryUiShimmer,
} from "../ui/storyComicMotion.js";

function defaultNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

function defaultPrefersReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

function drawImageCover(ctx, image, rect) {
  const iw = image?.naturalWidth || image?.width || 0;
  const ih = image?.naturalHeight || image?.height || 0;
  if (iw <= 0 || ih <= 0) return false;
  const scale = Math.max(rect.w / iw, rect.h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(image, rect.x + (rect.w - dw) / 2, rect.y + (rect.h - dh) / 2, dw, dh);
  return true;
}

export function createStoryComicRenderer({
  ctx,
  width,
  height,
  state,
  getScene,
  t,
  canvasFont,
  fitLabel,
  wrapText,
  isImageReady = () => false,
  now = defaultNow,
  prefersReducedMotion = defaultPrefersReducedMotion,
} = {}) {
  let panelMotionKey = "";
  let panelMotionStartedAt = 0;
  let sceneMotionKey = "";
  let sceneMotionStartedAt = 0;

  function drawStoryComicOverlay() {
    const scene = getScene?.(state.story?.sceneId);
    const model = createStoryComicOverlayModel({
      story: state.story,
      scene,
      translate: t,
    });
    if (!model) return;

    const layout = getStoryComicLayout(width, height);
    const motion = getStoryMotion(model);
    ctx.save();
    drawPanelArt(model, layout);
    drawHeader(model, layout, motion);
    drawTextBox(model, layout, motion);
    drawControls(layout, motion);
    ctx.restore();
  }

  function getStoryMotion(model) {
    const currentNow = now();
    const nextSceneMotionKey = `${model.sceneId}:${model.title || ""}`;
    const nextPanelMotionKey = `${model.sceneId}:${model.progress.panelIndex}:${model.panel.id || ""}`;
    if (nextSceneMotionKey !== sceneMotionKey) {
      sceneMotionKey = nextSceneMotionKey;
      sceneMotionStartedAt = currentNow;
    }
    if (nextPanelMotionKey !== panelMotionKey) {
      panelMotionKey = nextPanelMotionKey;
      panelMotionStartedAt = currentNow;
    }
    const reducedMotion = Boolean(prefersReducedMotion());
    const sceneEntry = getStoryUiEntryMotion({
      elapsedMs: currentNow - sceneMotionStartedAt,
      reducedMotion,
    });
    const panelEntry = getStoryUiEntryMotion({
      elapsedMs: currentNow - panelMotionStartedAt,
      reducedMotion,
    });
    return {
      now: currentNow,
      reducedMotion,
      entry: {
        ...panelEntry,
        title: sceneEntry.title,
      },
      shimmer: getStoryUiShimmer({
        now: currentNow,
        reducedMotion,
      }),
    };
  }

  function drawPanelArt(model, layout) {
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, width, height);
    if (isImageReady(model.panel.image)) {
      drawImageCover(ctx, model.panel.image, layout.imageRect);
    }

    const vignette = ctx.createRadialGradient(
      width * 0.52,
      height * 0.48,
      height * 0.16,
      width * 0.52,
      height * 0.5,
      height * 0.95,
    );
    vignette.addColorStop(0, "rgba(2, 4, 10, 0)");
    vignette.addColorStop(0.66, "rgba(2, 4, 10, 0.08)");
    vignette.addColorStop(1, "rgba(1, 2, 7, 0.62)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const bottomFade = ctx.createLinearGradient(0, height * 0.68, 0, height);
    bottomFade.addColorStop(0, "rgba(2, 4, 10, 0)");
    bottomFade.addColorStop(0.72, "rgba(4, 5, 13, 0.22)");
    bottomFade.addColorStop(1, "rgba(1, 2, 7, 0.58)");
    ctx.fillStyle = bottomFade;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
  }

  function applyLayerMotion(layer) {
    ctx.globalAlpha *= layer.alpha;
    ctx.translate(layer.offsetX || 0, layer.offsetY || 0);
  }

  function roundedRect(x, y, w, h, r, fill, stroke) {
    drawRoundedRect(ctx, x, y, w, h, r, fill, stroke);
  }

  function drawGlassSurface(rect, {
    radius = 12,
    active = false,
    selected = false,
    glowIntensity = 0.52,
    glowRadius = 18,
    edgeSensitivity = 36,
    selectedIntensity = selected ? 0.34 : 0,
    fillOpacity = 0.018,
    lineWidth = selected ? 1.8 : 1.2,
    fillTop = "rgba(8, 15, 26, 0.78)",
    fillBottom = "rgba(5, 7, 18, 0.72)",
    stroke = "rgba(126, 231, 255, 0.24)",
  } = {}, motion) {
    const fill = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    fill.addColorStop(0, fillTop);
    fill.addColorStop(0.58, "rgba(7, 10, 22, 0.68)");
    fill.addColorStop(1, fillBottom);
    ctx.fillStyle = fill;
    roundedRect(rect.x, rect.y, rect.w, rect.h, radius, true, false);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    roundedRect(rect.x, rect.y, rect.w, rect.h, radius, false, true);

    drawBorderGlow(ctx, {
      rect,
      roundedRect,
      pointer: state.pointer,
      now: motion.now,
      reducedMotion: motion.reducedMotion,
      radius,
      edgeSensitivity,
      selected,
      selectedIntensity,
      force: active,
      fillOpacity,
      glowIntensity,
      glowRadius,
    });
  }

  function drawStoryCornerCuts(rect, radius = 12, alpha = 0.7) {
    const pad = Math.min(22, Math.max(12, rect.h * 0.22));
    const len = Math.min(36, Math.max(22, rect.w * 0.045));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = "rgba(255, 240, 166, 0.44)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rect.x + pad, rect.y + radius);
    ctx.lineTo(rect.x + pad, rect.y + pad);
    ctx.lineTo(rect.x + pad + len, rect.y + pad);
    ctx.moveTo(rect.x + rect.w - pad - len, rect.y + pad);
    ctx.lineTo(rect.x + rect.w - pad, rect.y + pad);
    ctx.lineTo(rect.x + rect.w - pad, rect.y + radius);
    ctx.moveTo(rect.x + pad, rect.y + rect.h - radius);
    ctx.lineTo(rect.x + pad, rect.y + rect.h - pad);
    ctx.lineTo(rect.x + pad + len, rect.y + rect.h - pad);
    ctx.moveTo(rect.x + rect.w - pad - len, rect.y + rect.h - pad);
    ctx.lineTo(rect.x + rect.w - pad, rect.y + rect.h - pad);
    ctx.lineTo(rect.x + rect.w - pad, rect.y + rect.h - radius);
    ctx.stroke();
    ctx.restore();
  }

  function drawCaptionBand(rect, motion) {
    const fill = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    fill.addColorStop(0, "rgba(4, 9, 18, 0.38)");
    fill.addColorStop(0.52, "rgba(5, 7, 17, 0.54)");
    fill.addColorStop(1, "rgba(3, 5, 13, 0.36)");
    ctx.fillStyle = fill;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 10, true, false);

    const line = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
    line.addColorStop(0, "rgba(126, 231, 255, 0)");
    line.addColorStop(0.08, "rgba(126, 231, 255, 0.2)");
    line.addColorStop(0.52, "rgba(255, 240, 166, 0.12)");
    line.addColorStop(0.92, "rgba(126, 231, 255, 0.17)");
    line.addColorStop(1, "rgba(126, 231, 255, 0)");
    ctx.save();
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rect.x + 18, rect.y + 1);
    ctx.lineTo(rect.x + rect.w - 18, rect.y + 1);
    ctx.moveTo(rect.x + 18, rect.y + rect.h - 1);
    ctx.lineTo(rect.x + rect.w - 18, rect.y + rect.h - 1);
    ctx.stroke();
    ctx.restore();

    drawRiftShimmer(rect, motion.shimmer.panelPhase, motion.shimmer.intensity * 0.22, 0.28);
  }

  function getMagnetOffset(rect, pointer, {
    padding = 56,
    strength = 24,
    reducedMotion = false,
  } = {}) {
    if (reducedMotion || !Number.isFinite(pointer?.x) || !Number.isFinite(pointer?.y)) {
      return { x: 0, y: 0 };
    }
    const centerX = rect.x + rect.w / 2;
    const centerY = rect.y + rect.h / 2;
    const distX = Math.abs(centerX - pointer.x);
    const distY = Math.abs(centerY - pointer.y);
    if (distX >= rect.w / 2 + padding || distY >= rect.h / 2 + padding) {
      return { x: 0, y: 0 };
    }
    return {
      x: clamp((pointer.x - centerX) / strength, -10, 10),
      y: clamp((pointer.y - centerY) / strength, -7, 7),
    };
  }

  function drawRiftShimmer(rect, phase, intensity, heightRatio = 0.54) {
    if (intensity <= 0) return;
    const bandW = rect.w * 0.22;
    const centerX = rect.x + rect.w * phase;
    const x = clamp(centerX - bandW / 2, rect.x, rect.x + rect.w);
    const w = Math.min(bandW, rect.x + rect.w - x);
    if (w <= 0) return;

    const y = rect.y + rect.h * ((1 - heightRatio) / 2);
    const h = rect.h * heightRatio;
    const glow = ctx.createLinearGradient(x, y, x + w, y);
    glow.addColorStop(0, "rgba(126, 231, 255, 0)");
    glow.addColorStop(0.5, `rgba(169, 113, 255, ${intensity})`);
    glow.addColorStop(1, "rgba(126, 231, 255, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function drawHeader(model, layout, motion) {
    const title = layout.titleRect;
    ctx.save();
    applyLayerMotion(motion.entry.title);
    drawGlassSurface(title, {
      radius: 11,
      active: true,
      selected: true,
      edgeSensitivity: 38,
      fillOpacity: 0.01,
      glowIntensity: 0.38,
      glowRadius: 16,
      lineWidth: 1.1,
      selectedIntensity: 0.13,
      fillTop: "rgba(8, 15, 26, 0.58)",
      fillBottom: "rgba(5, 7, 18, 0.48)",
      stroke: "rgba(126, 231, 255, 0.22)",
    }, motion);
    drawRiftShimmer(title, motion.shimmer.titlePhase, motion.shimmer.intensity * 0.44, 0.36);
    drawStoryCornerCuts(title, 11, 0.36);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.84)";
    ctx.shadowBlur = 7;
    fitLabel(
      model.title,
      title.x + title.w / 2,
      title.y + title.h / 2 + 1,
      title.w * 0.86,
      Math.max(22, Math.min(30, title.h * 0.48)),
      "#fff6dc",
      15,
      "900",
      true,
    );
    ctx.restore();
  }

  function drawTextBox(model, layout, motion) {
    const box = layout.textBox;
    ctx.save();
    applyLayerMotion(motion.entry.textBox);
    ctx.shadowColor = "rgba(0, 0, 0, 0.78)";
    ctx.shadowBlur = 22;
    drawCaptionBand(box, motion);
    drawStoryCornerCuts(box, 10, 0.14);
    ctx.shadowBlur = 0;

    const textX = box.x + Math.max(32, box.w * 0.044);
    const contentW = box.w - Math.max(64, box.w * 0.082);
    let textY = box.y + Math.max(38, box.h * 0.3);
    if (model.speaker) {
      drawSpeakerName(model.speaker, box, textX, contentW);
      textY += Math.max(20, box.h * 0.14);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.88)";
    ctx.shadowBlur = 5;
    wrapText(
      model.text,
      textX,
      textY,
      contentW,
      model.speaker ? 23 : 26,
      model.isDialogue ? "#fff7e8" : "#eaf6ff",
      model.speaker ? 19 : 20,
    );
    ctx.restore();
  }

  function drawSpeakerName(speaker, box, textX, contentW) {
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
    ctx.shadowBlur = 5;
    fitLabel(
      speaker,
      textX,
      box.y + Math.max(22, box.h * 0.2),
      Math.min(210, contentW * 0.42),
      17,
      "#ffdfa8",
      12,
      "900",
    );

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(126, 231, 255, 0.38)";
    ctx.fillRect(textX, box.y + Math.max(36, box.h * 0.31), Math.min(160, contentW * 0.25), 1);
    ctx.restore();
  }

  function drawControls(layout, motion) {
    const hint = layout.hintRect;
    ctx.save();
    applyLayerMotion(motion.entry.controls);
    drawGlassSurface(hint, {
      radius: 8,
      active: false,
      selected: true,
      selectedIntensity: 0.08,
      edgeSensitivity: 18,
      fillOpacity: 0.006,
      glowIntensity: 0.18,
      glowRadius: 10,
      lineWidth: 0.8,
      fillTop: "rgba(6, 12, 20, 0.42)",
      fillBottom: "rgba(4, 7, 15, 0.34)",
      stroke: "rgba(126, 231, 255, 0.13)",
    }, motion);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = canvasFont("800", 13, t("story.hint.controls"));
    ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = hexToRgba("#d7f5ff", 0.84);
    ctx.fillText(t("story.hint.controls"), hint.x + hint.w / 2, hint.y + hint.h / 2);
    ctx.shadowBlur = 0;

    drawStoryButton(layout.skipButton, t("story.action.skip"), "secondary", motion);
    drawStoryButton(layout.nextButton, t("story.action.next"), "primary", motion);
    ctx.restore();
  }

  function drawStoryButton(rect, text, variant = "secondary", motion) {
    const pointer = state.pointer || {};
    const hovered = pointInRect(pointer.x, pointer.y, rect.x, rect.y, rect.w, rect.h);
    const pressed = hovered && Boolean(pointer.down);
    const primary = variant === "primary";
    const lift = pressed ? 1 : hovered ? -1 : 0;
    const hoverPulse = hovered ? 0.5 + Math.sin(motion.now * 0.008) * 0.5 : 0;
    const magnet = getMagnetOffset(rect, pointer, {
      padding: primary ? 72 : 52,
      strength: primary ? 22 : 28,
      reducedMotion: motion.reducedMotion,
    });

    ctx.save();
    ctx.translate(magnet.x, lift + magnet.y);
    drawGlassSurface(rect, {
      radius: 9,
      active: hovered,
      selected: primary || hovered,
      edgeSensitivity: primary ? 30 : 24,
      fillOpacity: hovered ? 0.018 : 0.008,
      glowIntensity: primary ? 0.62 : 0.38,
      glowRadius: hovered ? 18 : 12,
      lineWidth: primary ? 1.2 : 0.9,
      selectedIntensity: primary ? 0.2 : 0.08,
      fillTop: primary ? "rgba(18, 28, 44, 0.68)" : "rgba(8, 14, 24, 0.48)",
      fillBottom: primary ? "rgba(19, 11, 36, 0.58)" : "rgba(5, 8, 17, 0.42)",
      stroke: primary ? "rgba(255, 240, 166, 0.24)" : "rgba(126, 231, 255, 0.16)",
    }, motion);
    if (primary) {
      drawRiftShimmer(rect, motion.shimmer.buttonPhase, motion.shimmer.intensity * 0.42, 0.34);
    }

    if (hovered) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = primary
        ? `rgba(169, 113, 255, ${0.13 + hoverPulse * 0.08})`
        : `rgba(126, 231, 255, ${0.08 + hoverPulse * 0.05})`;
      ctx.fillRect(rect.x + rect.w * 0.1, rect.y + rect.h * 0.22, rect.w * 0.8, rect.h * 0.56);
      ctx.globalCompositeOperation = "source-over";
    }
    drawStoryCornerCuts(rect, 9, primary ? 0.28 : 0.18);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.86)";
    ctx.shadowBlur = 4;
    fitLabel(
      text,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1,
      rect.w - 34,
      primary ? 18 : 15,
      primary ? "#fff8e7" : "#e8f8ff",
      11,
      "900",
      true,
    );
    ctx.restore();
  }

  return {
    drawStoryComicOverlay,
  };
}
