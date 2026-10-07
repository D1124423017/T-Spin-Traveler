import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getWebAssetPath } from "../src/data/webAssetPaths.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = await readFile(path.join(root, "src/data/assets.js"), "utf8");
const images = [...new Set([...registry.matchAll(/"(assets\/[^"\n]+\.png)"/g)].map((match) => match[1]))];
let originalBytes = 0;
let webBytes = 0;
let cursor = 0;

async function encodeImages() {
  while (cursor < images.length) {
    const asset = images[cursor++];
    const input = path.join(root, asset);
    const output = path.join(root, getWebAssetPath(asset));
    const original = await stat(input);
    let encoded = await stat(output).catch(() => null);
    if (!encoded || encoded.mtimeMs < original.mtimeMs) {
      await mkdir(path.dirname(output), { recursive: true });
      await sharp(input).webp({ quality: 90, alphaQuality: 100, effort: 4 }).toFile(output);
      encoded = await stat(output);
    }
    const [sourceInfo, webInfo] = await Promise.all([sharp(input).metadata(), sharp(output).metadata()]);
    // Encoders may omit an alpha channel when every source pixel is opaque.
    const lostTransparency = sourceInfo.hasAlpha && !webInfo.hasAlpha && !(await sharp(input).stats()).isOpaque;
    if (sourceInfo.width !== webInfo.width || sourceInfo.height !== webInfo.height || lostTransparency) {
      throw new Error(`Web asset dimensions or transparency changed: ${asset}`);
    }
    originalBytes += original.size;
    webBytes += encoded.size;
  }
}

await Promise.all([encodeImages(), encodeImages()]);
console.log(`Prepared ${images.length} full-size WebP images: ${(originalBytes / 1048576).toFixed(1)} MiB -> ${(webBytes / 1048576).toFixed(1)} MiB`);
