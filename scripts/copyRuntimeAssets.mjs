import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(rootDir, "assets");
const targetDir = path.join(rootDir, "dist", "assets");
const runtimeAssetDirs = new Set(["audio", "fonts", "future", "images"]);

await mkdir(targetDir, { recursive: true });

const entries = await readdir(sourceDir, { withFileTypes: true });
const copied = [];

for (const entry of entries) {
  if (!entry.isDirectory() || !runtimeAssetDirs.has(entry.name)) continue;
  const sourcePath = path.join(sourceDir, entry.name);
  const targetPath = path.join(targetDir, entry.name);
  await cp(sourcePath, targetPath, {
    force: true,
    recursive: true,
  });
  copied.push(entry.name);
}

console.log(`Copied runtime assets to dist/assets: ${copied.join(", ")}`);
