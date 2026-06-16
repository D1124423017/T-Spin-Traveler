import { hexToRgba } from "./drawUtils.js";
import {
  createStoryComicOverlayModel,
  getStoryComicLayout,
} from "../ui/storyComicOverlay.js";

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
  roundedRect,
  drawMenuButton,
  isImageReady = () => false,
} = {}) {
  function drawStoryComicOverlay() {
    const scene = getScene?.(state.story?.sceneId);
    const model = createStoryComicOverlayModel({
      story: state.story,
      scene,
      translate: t,
    });
    if (!model) return;

    const layout = getStoryComicLayout(width, height);
    ctx.save();
    drawPanelArt(model, layout);
    drawComicFrame(layout);
    drawHeader(model, layout);
    drawTextBox(model, layout);
    drawControls(layout);
    ctx.restore();
  }

  function drawPanelArt(model, layout) {
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, width, height);
    if (isImageReady(model.panel.image)) {
      drawImageCover(ctx, model.panel.image, layout.imageRect);
    }

    const vignette = ctx.createRadialGradient(width * 0.52, height * 0.48, height * 0.22, width * 0.52, height * 0.5, height * 0.92);
    vignette.addColorStop(0, "rgba(2, 4, 10, 0)");
    vignette.addColorStop(0.72, "rgba(2, 4, 10, 0.18)");
    vignette.addColorStop(1, "rgba(1, 2, 7, 0.68)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function drawComicFrame(layout) {
    const frame = layout.frameRect;
    ctx.save();
    ctx.strokeStyle = "rgba(2, 4, 10, 0.88)";
    ctx.lineWidth = 16;
    roundedRect(frame.x, frame.y, frame.w, frame.h, 8, false, true);
    ctx.strokeStyle = "rgba(255, 215, 154, 0.54)";
    ctx.lineWidth = 2;
    roundedRect(frame.x + 7, frame.y + 7, frame.w - 14, frame.h - 14, 5, false, true);
    ctx.strokeStyle = "rgba(126, 231, 255, 0.24)";
    ctx.lineWidth = 1.5;
    roundedRect(frame.x + 14, frame.y + 14, frame.w - 28, frame.h - 28, 4, false, true);

    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(142, 78, 255, 0.34)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const y = frame.y + 26 + i * 34;
      ctx.beginPath();
      ctx.moveTo(frame.x + 22 + i * 18, y);
      ctx.lineTo(frame.x + 88 + i * 14, y + 28);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeader(model, layout) {
    ctx.save();
    const title = layout.titleRect;
    ctx.fillStyle = "rgba(4, 7, 15, 0.58)";
    roundedRect(title.x - 12, title.y - 10, title.w + 24, title.h + 14, 10, true, false);
    ctx.strokeStyle = "rgba(255, 215, 154, 0.34)";
    ctx.lineWidth = 1.3;
    roundedRect(title.x - 12, title.y - 10, title.w + 24, title.h + 14, 10, false, true);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    fitLabel(model.title, title.x, title.y + title.h / 2, title.w, 24, "#fff0c8", 16, "900");

    ctx.restore();
  }

  function drawTextBox(model, layout) {
    const box = layout.textBox;
    ctx.save();
    const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
    gradient.addColorStop(0, "rgba(5, 8, 16, 0.88)");
    gradient.addColorStop(0.66, "rgba(11, 8, 25, 0.78)");
    gradient.addColorStop(1, "rgba(29, 16, 48, 0.54)");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(126, 231, 255, 0.18)";
    ctx.shadowBlur = 18;
    roundedRect(box.x, box.y, box.w, box.h, 14, true, false);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 215, 154, 0.38)";
    ctx.lineWidth = 1.5;
    roundedRect(box.x, box.y, box.w, box.h, 14, false, true);
    ctx.strokeStyle = "rgba(139, 102, 255, 0.26)";
    roundedRect(box.x + 7, box.y + 7, box.w - 14, box.h - 14, 10, false, true);

    drawRiftGlyph(box.x + 28, box.y + 31);

    const textX = box.x + 62;
    let textY = box.y + 40;
    if (model.speaker) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      fitLabel(model.speaker, textX, textY, box.w - 98, 20, "#ffdfa8", 14, "900");
      textY += 32;
    }
    wrapText(model.text, textX, textY, box.w - 96, 29, model.isDialogue ? "#fff7e8" : "#eaf6ff", 20);
    ctx.restore();
  }

  function drawRiftGlyph(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#9d75ff";
    ctx.shadowColor = "#8d55ff";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "#7ee7ff";
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawControls(layout) {
    ctx.save();
    const hint = layout.hintRect;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = canvasFont("800", 14, t("story.hint.controls"));
    ctx.fillStyle = hexToRgba("#d7f5ff", 0.76);
    ctx.fillText(t("story.hint.controls"), hint.x + hint.w, hint.y + hint.h / 2);
    ctx.restore();

    drawMenuButton(
      layout.skipButton.x,
      layout.skipButton.y,
      layout.skipButton.w,
      layout.skipButton.h,
      t("story.action.skip"),
      "",
      "secondary",
    );
    drawMenuButton(
      layout.nextButton.x,
      layout.nextButton.y,
      layout.nextButton.w,
      layout.nextButton.h,
      t("story.action.next"),
      "",
      "primary",
    );
  }

  return {
    drawStoryComicOverlay,
  };
}
