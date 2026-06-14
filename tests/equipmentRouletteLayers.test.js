import { describe, expect, it, vi } from "vitest";
import { drawEquipmentCanvasRotor } from "../src/render/equipmentCanvasRotorRenderer.js";
import {
  drawEquipmentWheelBody,
  drawEquipmentWheelPointer,
} from "../src/render/equipmentWheelLayerRenderer.js";
import {
  createEquipmentWheelGeometry,
  getEquipmentRewardRevealLayout,
  getEquipmentWheelBadgePosition,
  getEquipmentWheelSlotLayout,
  getEquipmentWheelTargetRotation,
} from "../src/ui/equipmentWheelGeometry.js";
import { EQUIPMENT_ROULETTE_LAYOUT } from "../src/ui/equipmentLayout.js";
import { EQUIPMENT_WHEEL_SEGMENT_COUNT } from "../src/data/equipment.js";

describe("equipment roulette layer renderer", () => {
  it("draws only the pointer as a fixed image layer", () => {
    const calls = [];
    const ctx = {
      save: vi.fn(() => calls.push(["save"])),
      restore: vi.fn(() => calls.push(["restore"])),
      translate: vi.fn((x, y) => calls.push(["translate", x, y])),
      rotate: vi.fn((angle) => calls.push(["rotate", angle])),
      drawImage: vi.fn((image, ...args) => calls.push(["drawImage", image.id, ...args])),
      shadowColor: "",
      shadowBlur: 0,
    };
    const pointerArt = { id: "pointer" };
    const geometry = createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT);

    const drawn = drawEquipmentWheelPointer({
      ctx,
      pointerArt,
      isImageReady: () => true,
      geometry,
      visualPower: 0.5,
    });

    expect(drawn).toBe(true);
    expect(ctx.translate).toHaveBeenCalledOnce();
    expect(ctx.translate).toHaveBeenCalledWith(342, 382);
    expect(calls.filter(([type]) => type === "drawImage").map((call) => call[1]))
      .toEqual(["pointer"]);
    expect(ctx.drawImage).toHaveBeenCalledWith(
      pointerArt,
      -306,
      -306,
      612,
      612,
    );
  });

  it("skips unavailable layer images without drawing procedural wheel bodies", () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
    };

    expect(drawEquipmentWheelPointer({
      ctx,
      pointerArt: null,
      isImageReady: () => false,
      geometry: createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT),
    })).toBe(false);
    expect(ctx.drawImage).not.toHaveBeenCalled();
  });

  it("draws the complete wheel body once without applying spin rotation", () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      shadowColor: "",
      shadowBlur: 0,
    };
    const bodyArt = { id: "body" };
    const geometry = createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT);

    expect(drawEquipmentWheelBody({
      ctx,
      bodyArt,
      isImageReady: () => true,
      geometry,
      visualPower: 0.6,
    })).toBe(true);

    expect(ctx.translate).toHaveBeenCalledWith(342, 382);
    expect(ctx.rotate).not.toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalledOnce();
    expect(ctx.drawImage).toHaveBeenCalledWith(
      bodyArt,
      -306,
      -306,
      612,
      612,
    );
  });

  it("renders every rarity sector inside one rotating Canvas coordinate system", () => {
    const calls = [];
    const gradient = { addColorStop: vi.fn() };
    const ctx = {
      save: vi.fn(() => calls.push(["save"])),
      restore: vi.fn(() => calls.push(["restore"])),
      translate: vi.fn((x, y) => calls.push(["translate", x, y])),
      rotate: vi.fn((angle) => calls.push(["rotate", angle])),
      createRadialGradient: vi.fn(() => gradient),
      beginPath: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      setLineDash: vi.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      shadowColor: "",
      shadowBlur: 0,
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
    };
    const geometry = createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT);
    const segments = Array.from({ length: EQUIPMENT_WHEEL_SEGMENT_COUNT }, (_, index) => ({
      index,
      rarity: ["common", "rare", "relic", "legendary"][index % 4],
    }));

    expect(drawEquipmentCanvasRotor({
      ctx,
      geometry,
      segments,
      rotation: 1.25,
      presentation: { ringCount: 3 },
      visualPower: 0.6,
      currentTime: 500,
    })).toBe(true);
    expect(ctx.translate).toHaveBeenNthCalledWith(1, 342, 382);
    expect(ctx.rotate).toHaveBeenNthCalledWith(1, 1.25);
    expect(ctx.clip).toHaveBeenCalledTimes(1);
    expect(ctx.arc).toHaveBeenNthCalledWith(
      1,
      0,
      0,
      geometry.rotorOuterRadius,
      0,
      Math.PI * 2,
    );
    expect(ctx.drawImage).toBeUndefined();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("uses one canonical center for every wheel layer and stop target", () => {
    const geometry = createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT);
    const targetRotation = getEquipmentWheelTargetRotation(
      7,
      EQUIPMENT_WHEEL_SEGMENT_COUNT,
    );
    const targetBadge = getEquipmentWheelBadgePosition(
      geometry,
      7,
      EQUIPMENT_WHEEL_SEGMENT_COUNT,
      targetRotation,
    );

    expect(geometry.center).toEqual({ x: 342, y: 382 });
    expect(geometry.drawRect).toEqual({ x: 36, y: 76, w: 612, h: 612 });
    expect(geometry.layers.body).toEqual(geometry.layers.pointer);
    expect(geometry.slotRadius).toBeCloseTo(168.86, 2);
    expect(geometry.rotorInnerRadius).toBeCloseTo(92.73, 2);
    expect(geometry.rotorOuterRadius).toBeCloseTo(219.62, 2);
    expect(geometry.slotGlyphSize).toBeCloseTo(35.14, 2);
    expect(targetBadge.x).toBeCloseTo(geometry.pointerTarget.x, 8);
    expect(targetBadge.y).toBeCloseTo(geometry.pointerTarget.y, 8);
    expect(geometry.pointerTip.x).toBeCloseTo(geometry.pointerTarget.x, 8);
    expect(geometry.pointerTip.y).toBeLessThan(geometry.pointerTarget.y);
  });

  it("lays all 20 visual slots on one exact circle with one shared anchor", () => {
    const geometry = createEquipmentWheelGeometry(EQUIPMENT_ROULETTE_LAYOUT);
    const slots = getEquipmentWheelSlotLayout(
      geometry,
      EQUIPMENT_WHEEL_SEGMENT_COUNT,
      0.73,
    );
    const radii = slots.map((slot) => Math.hypot(
      slot.x - geometry.center.x,
      slot.y - geometry.center.y,
    ));

    expect(slots).toHaveLength(20);
    expect(new Set(slots.map(({ glyphSize }) => glyphSize)).size).toBe(1);
    for (const radius of radii) {
      expect(radius).toBeCloseTo(geometry.slotRadius, 8);
    }
    for (let index = 1; index < slots.length; index += 1) {
      expect(slots[index].angle - slots[index - 1].angle)
        .toBeCloseTo((Math.PI * 2) / 20, 8);
    }
  });

  it("places every wheel-level reveal beside the wheel instead of over its center", () => {
    const wheelRight = EQUIPMENT_ROULETTE_LAYOUT.wheel.cx
      + EQUIPMENT_ROULETTE_LAYOUT.wheel.radius;
    const iconCenters = new Set();

    for (let level = 1; level <= 5; level += 1) {
      const reveal = getEquipmentRewardRevealLayout(
        EQUIPMENT_ROULETTE_LAYOUT,
        level,
      );
      expect(reveal.rect.x).toBeGreaterThan(wheelRight);
      expect(reveal.rect.x + reveal.rect.w).toBeLessThanOrEqual(1280);
      expect(reveal.rect.y + reveal.rect.h).toBeLessThanOrEqual(720);
      iconCenters.add(`${reveal.icon.centerX}:${reveal.icon.centerY}`);
    }

    expect(iconCenters.size).toBe(5);
  });
});
