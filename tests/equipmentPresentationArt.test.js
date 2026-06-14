import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("equipment presentation art", () => {
  it("uses one geometry-driven Canvas rotor without wheel-slot image overlays", () => {
    const source = fs.readFileSync(
      path.join(projectRoot, "src/ui/equipmentRouletteScreen.js"),
      "utf8",
    );
    const rotorSource = fs.readFileSync(
      path.join(projectRoot, "src/render/equipmentCanvasRotorRenderer.js"),
      "utf8",
    );

    expect(source).toContain("drawEquipmentCanvasRotor");
    expect(source).not.toContain("drawWheelSlots");
    expect(source).not.toContain("ctx.drawImage(emblem");
    expect(rotorSource).toContain("drawRaritySector");
    expect(rotorSource).toContain("drawRarityGlyph");
    expect(rotorSource).not.toContain("drawImage");
    expect(source).not.toContain("slotCradle");
  });

  it("removes the persistent recent-draw panel from the roulette screen", () => {
    const source = fs.readFileSync(
      path.join(projectRoot, "src/ui/equipmentRouletteScreen.js"),
      "utf8",
    );
    const layoutSource = fs.readFileSync(
      path.join(projectRoot, "src/ui/equipmentLayout.js"),
      "utf8",
    );

    expect(source).not.toContain("drawRecentResult");
    expect(source).not.toContain("equipmentRecentResult");
    expect(layoutSource).not.toContain("recent:");
  });

  it("uses wheel-level reward panels instead of a procedural Canvas panel", () => {
    const source = fs.readFileSync(
      path.join(projectRoot, "src/ui/equipmentRewardReveal.js"),
      "utf8",
    );

    expect(source).toContain("equipmentRewardPanelArts");
    expect(source).toContain("motion.wheelLevel");
    expect(source).toContain("ctx.drawImage(panelArt");
    expect(source).not.toContain("ctx.strokeRect");
    expect(source).not.toContain("createLinearGradient");
  });

  it("keeps rarity content under the cohesive rotating body and fixed pointer", () => {
    const source = fs.readFileSync(
      path.join(projectRoot, "src/ui/equipmentRouletteScreen.js"),
      "utf8",
    );
    const drawWheelStart = source.indexOf("  function drawWheel(wheel");
    const drawWheelEnd = source.indexOf(
      "  function drawWheelBackgroundGlow",
      drawWheelStart,
    );
    const drawWheelSource = source.slice(drawWheelStart, drawWheelEnd);
    const orderedCalls = [
      "drawWheelBackgroundGlow",
      "drawWheelBackgroundParticles",
      "drawEquipmentCanvasRotor",
      "drawRotorInterferenceUnderFrame",
      "drawEquipmentWheelBody",
      "drawPointerAuraUnderFrame",
      "drawFixedWheelPointer",
    ];
    const positions = orderedCalls.map((call) => drawWheelSource.indexOf(call));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
