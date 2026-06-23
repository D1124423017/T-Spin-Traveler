import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");

describe("battle HUD trait list", () => {
  it("uses generated upgrade type icons and progress only in compact gameplay trait rows", () => {
    const source = fs.readFileSync(path.join(root, "src/ui/battleHud.js"), "utf8");

    expect(source).toContain("drawTraitListRow");
    expect(source).toContain("upgradeTypeIcons");
    expect(source).toContain("TRAIT_HUD_ICON_ASSET_BY_TAG");
    expect(source).toContain("drawImageContain(iconImage");
    expect(source).toContain("ctx.fillText(trait.def.icon");
    expect(source).toContain("getTraitProgressStatusTextForPanel");
    expect(source).not.toContain("getTraitHudLabelForPanel");
  });
});
