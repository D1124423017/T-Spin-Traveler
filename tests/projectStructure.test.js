import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

describe("project structure", () => {
  it("keeps contributor docs, preview tools, and dev scripts in their formal folders", () => {
    for (const relativePath of [
      "docs/PROJECT_STRUCTURE.md",
      "docs/ASSET_WORKFLOW.md",
      "docs/TESTING.md",
      "tools/previews/sprite-test.html",
      "tools/previews/gsap-test.html",
      "tools/previews/font-test.html",
      "scripts/dev/start-game.bat",
      "scripts/dev/test-and-start.bat",
    ]) {
      expect(exists(relativePath), `${relativePath} should exist`).toBe(true);
    }
  });

  it("does not restore deprecated root preview, script, or documentation paths", () => {
    for (const relativePath of [
      "sprite-test.html",
      "sprite-test.css",
      "gsap-test.html",
      "start-game.bat",
      "test-and-start.bat",
      "TESTING.md",
      "README.zh-TW.md",
    ]) {
      expect(exists(relativePath), `${relativePath} should stay relocated`).toBe(false);
    }
  });
});
