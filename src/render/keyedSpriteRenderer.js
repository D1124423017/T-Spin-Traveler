import { getAnimationFrameInfo } from "./animationTiming.js";
import {
  getSpriteFrameRect,
  insetSpriteFrameRect,
  smoothstep,
} from "./drawUtils.js";

export function sampleCornerColor(data, width, height) {
  const points = [
    0,
    width - 1,
    (height - 1) * width,
    (height - 1) * width + width - 1,
  ];
  const color = { r: 0, g: 0, b: 0 };
  for (const point of points) {
    const offset = point * 4;
    color.r += data[offset];
    color.g += data[offset + 1];
    color.b += data[offset + 2];
  }
  color.r /= points.length;
  color.g /= points.length;
  color.b /= points.length;
  return color;
}

export function isPaperPixel(data, offset, key) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const distance = Math.abs(r - key.r) + Math.abs(g - key.g) + Math.abs(b - key.b);
  const chromaKey =
    (key.r > 210 && key.b > 210 && key.g < 80)
    || (key.g > 210 && key.r < 80 && key.b < 80);
  if (chromaKey) return distance < 130;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = r * 0.299 + g * 0.587 + b * 0.114;
  const lowSaturation = max - min < 74;
  const warmPaper = r > 150 && g > 132 && b > 108 && r >= b - 6;
  const paleBackground = luma > 176 && lowSaturation;
  const cornerMatch = distance < 124 && warmPaper;
  return paleBackground || cornerMatch;
}

export function createKeyedSpriteRenderer({
  ctx,
  documentTarget = globalThis.document,
  drawImageCropContain,
  cropInset = 3,
}) {
  const spriteFrameCache = new Map();

  function drawSpriteAnimationFrame(config, elapsed, x, y, w, h) {
    const { frameIndex, local } = getAnimationFrameInfo(config, elapsed);
    const currentFrame = config.frames[frameIndex];
    const previousFrame = config.frames[Math.max(0, frameIndex - 1)];
    const nextFrame = config.frames[Math.min(config.frames.length - 1, frameIndex + 1)];
    const motion = String(config.id || "").startsWith("enemy") ? 7 : 10;
    const blendFrames = config.blendFrames === true;
    if (blendFrames && previousFrame !== currentFrame && local < 0.42) {
      const ghostAlpha = (1 - local / 0.42) * 0.18;
      drawSpriteSheetFrame(config, previousFrame, x - motion * ghostAlpha, y, w, h, ghostAlpha);
    }
    drawSpriteSheetFrame(config, currentFrame, x, y, w, h);
    const blend = smoothstep(0.5, 1, local);
    if (blendFrames && blend > 0 && nextFrame !== currentFrame) {
      drawSpriteSheetFrame(config, nextFrame, x + motion * 0.04 * blend, y, w, h, blend * 0.48);
    }
  }

  function drawSpriteSheetFrame(config, frame, x, y, w, h, alpha = 1) {
    const img = config.image;
    const inset = config.cropInset ?? cropInset;
    const rect = insetSpriteFrameRect(getSpriteFrameRect(config, frame), img, inset);
    const keyed = getKeyedSpriteFrame(config, frame, rect);
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (keyed) {
      drawCanvasContain(keyed, x, y, w, h);
    } else {
      drawImageCropContain(img, rect.x, rect.y, rect.w, rect.h, x, y, w, h);
    }
    ctx.restore();
  }

  function getKeyedSpriteFrame(config, frame, rect) {
    if (config.noKeying) return null;
    const img = config.image;
    const key = `${config.id}:${frame}:${img.naturalWidth}x${img.naturalHeight}`;
    if (spriteFrameCache.has(key)) return spriteFrameCache.get(key);
    const canvasFrame = makeKeyedCropCanvas(img, rect.x, rect.y, rect.w, rect.h);
    spriteFrameCache.set(key, canvasFrame);
    return canvasFrame;
  }

  function drawKeyedImageCropContain(img, sx, sy, sw, sh, x, y, w, h, id, alpha = 1) {
    const key = `${id}:${img.naturalWidth}x${img.naturalHeight}`;
    if (!spriteFrameCache.has(key)) {
      spriteFrameCache.set(key, makeKeyedCropCanvas(img, sx, sy, sw, sh));
    }
    const keyed = spriteFrameCache.get(key);
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (keyed) drawCanvasContain(keyed, x, y, w, h);
    else drawImageCropContain(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
  }

  function makeKeyedCropCanvas(img, sx, sy, sw, sh) {
    try {
      const output = documentTarget.createElement("canvas");
      output.width = Math.max(1, Math.round(sw));
      output.height = Math.max(1, Math.round(sh));
      const outputCtx = output.getContext("2d", { willReadFrequently: true });
      outputCtx.drawImage(img, sx, sy, sw, sh, 0, 0, output.width, output.height);
      const imageData = outputCtx.getImageData(0, 0, output.width, output.height);
      removeConnectedPaperBackground(imageData, output.width, output.height);
      keepPrimaryForeground(imageData, output.width, output.height);
      outputCtx.putImageData(imageData, 0, 0);
      return output;
    } catch {
      return null;
    }
  }

  function removeConnectedPaperBackground(imageData, width, height) {
    const data = imageData.data;
    const key = sampleCornerColor(data, width, height);
    const visited = new Uint8Array(width * height);
    const stack = [];
    const tryVisit = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const pos = y * width + x;
      if (visited[pos]) return;
      visited[pos] = 1;
      if (isPaperPixel(data, pos * 4, key)) stack.push(pos);
    };
    for (let x = 0; x < width; x += 1) {
      tryVisit(x, 0);
      tryVisit(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      tryVisit(0, y);
      tryVisit(width - 1, y);
    }
    while (stack.length) {
      const pos = stack.pop();
      const offset = pos * 4;
      data[offset + 3] = 0;
      const x = pos % width;
      const y = Math.floor(pos / width);
      tryVisit(x + 1, y);
      tryVisit(x - 1, y);
      tryVisit(x, y + 1);
      tryVisit(x, y - 1);
    }
    softenPaperHalo(imageData, width, height);
  }

  function softenPaperHalo(imageData, width, height) {
    const data = imageData.data;
    const alpha = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i += 1) alpha[i] = data[i * 4 + 3];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pos = y * width + x;
        const offset = pos * 4;
        if (alpha[pos] === 0) continue;
        const nearTransparent =
          alpha[pos - 1] === 0
          || alpha[pos + 1] === 0
          || alpha[pos - width] === 0
          || alpha[pos + width] === 0;
        if (!nearTransparent) continue;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const luma = r * 0.299 + g * 0.587 + b * 0.114;
        if (luma > 168 && max - min < 82) data[offset + 3] = Math.min(data[offset + 3], 82);
      }
    }
  }

  function keepPrimaryForeground(imageData, width, height) {
    const data = imageData.data;
    const total = width * height;
    const labels = new Int32Array(total);
    const components = [{ area: 0 }];
    const stack = [];
    let currentLabel = 0;

    for (let start = 0; start < total; start += 1) {
      if (labels[start] || data[start * 4 + 3] <= 18) continue;
      currentLabel += 1;
      const component = {
        area: 0,
        minX: width,
        minY: height,
        maxX: 0,
        maxY: 0,
        saturation: 0,
        luma: 0,
      };
      stack.push(start);
      labels[start] = currentLabel;
      while (stack.length) {
        const pos = stack.pop();
        const offset = pos * 4;
        const x = pos % width;
        const y = Math.floor(pos / width);
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        component.area += 1;
        component.minX = Math.min(component.minX, x);
        component.minY = Math.min(component.minY, y);
        component.maxX = Math.max(component.maxX, x);
        component.maxY = Math.max(component.maxY, y);
        component.saturation += Math.max(r, g, b) - Math.min(r, g, b);
        component.luma += r * 0.299 + g * 0.587 + b * 0.114;
        const neighbors = [pos - 1, pos + 1, pos - width, pos + width];
        for (const next of neighbors) {
          if (next < 0 || next >= total || labels[next]) continue;
          if (
            (pos % width === 0 && next === pos - 1)
            || (pos % width === width - 1 && next === pos + 1)
          ) continue;
          if (data[next * 4 + 3] <= 18) continue;
          labels[next] = currentLabel;
          stack.push(next);
        }
      }
      component.saturation /= component.area;
      component.luma /= component.area;
      components[currentLabel] = component;
    }

    if (currentLabel <= 1) return;
    let mainIndex = 1;
    for (let i = 2; i < components.length; i += 1) {
      if (components[i].area > components[mainIndex].area) mainIndex = i;
    }
    const main = components[mainIndex];
    const keep = new Uint8Array(components.length);
    keep[mainIndex] = 1;
    for (let i = 1; i < components.length; i += 1) {
      if (i === mainIndex) continue;
      const component = components[i];
      const nearMain =
        component.maxX >= main.minX - 34
        && component.minX <= main.maxX + 34
        && component.maxY >= main.minY - 34
        && component.minY <= main.maxY + 34;
      const overlapsMainVertically = component.minY < main.maxY - 8;
      const meaningfulLargePart =
        component.area >= Math.max(260, main.area * 0.025)
        && (overlapsMainVertically || component.saturation > 24);
      const energeticParticle =
        component.area >= 8
        && component.saturation > 44
        && component.luma > 68;
      const bodyFragment = nearMain && component.area >= 20 && overlapsMainVertically;
      if (meaningfulLargePart || energeticParticle || bodyFragment) keep[i] = 1;
    }

    for (let pos = 0; pos < total; pos += 1) {
      const labelIndex = labels[pos];
      if (labelIndex && !keep[labelIndex]) data[pos * 4 + 3] = 0;
    }
  }

  function drawCanvasContain(source, x, y, w, h) {
    const scale = Math.min(w / source.width, h / source.height);
    const dw = source.width * scale;
    const dh = source.height * scale;
    ctx.drawImage(source, x + (w - dw) / 2, y + h - dh, dw, dh);
  }

  return {
    drawKeyedImageCropContain,
    drawSpriteAnimationFrame,
    drawSpriteSheetFrame,
  };
}
