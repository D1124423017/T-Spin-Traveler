export function createImageRenderer({
  ctx,
  isImageReady,
  getImageAssetRecord,
  roundedRect,
  canvasFont,
}) {
  function drawImageContain(img, x, y, w, h) {
    if (!isImageReady(img)) {
      drawImageFallbackBox(x, y, w, h, getMissingImageLabel(img, "IMAGE"));
      return;
    }
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawImageCoverRaw(img, x, y, w, h) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawImageCropContain(img, sx, sy, sw, sh, x, y, w, h) {
    if (!isImageReady(img) || sw <= 0 || sh <= 0) {
      drawImageFallbackBox(x, y, w, h, getMissingImageLabel(img, "CROP"));
      return;
    }
    const scale = Math.min(w / sw, h / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.drawImage(img, sx, sy, sw, sh, x + (w - dw) / 2, y + h - dh, dw, dh);
  }

  function getMissingImageLabel(img, fallback) {
    const record = getImageAssetRecord(img);
    return record ? record.id.replace(/-/g, " ").toUpperCase() : fallback;
  }

  function drawImageFallbackBox(x, y, w, h, text = "MISSING IMAGE") {
    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 16, 0.46)";
    roundedRect(x, y, w, h, 10, true, false);
    ctx.strokeStyle = "rgba(126, 231, 255, 0.2)";
    ctx.setLineDash([7, 5]);
    roundedRect(x, y, w, h, 10, false, true);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(238, 244, 252, 0.58)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = canvasFont("800", Math.max(10, Math.min(14, w / 14)), text, true);
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }

  return {
    drawImageContain,
    drawImageCoverRaw,
    drawImageCropContain,
    drawImageFallbackBox,
  };
}
