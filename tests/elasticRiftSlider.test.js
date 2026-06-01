import { describe, expect, it } from "vitest";
import {
  ELASTIC_RIFT_SLIDER,
  createElasticRiftSlider,
  getElasticRiftSliderReleaseOverflow,
  getElasticRiftSliderValueFromPointer,
  normalizeElasticRiftSliderValue,
} from "../src/ui/elasticRiftSlider.js";

describe("elastic rift slider helpers", () => {
  it("clamps actual values while preserving edge overflow for visuals", () => {
    const left = getElasticRiftSliderValueFromPointer({
      pointerX: 70,
      trackX: 100,
      trackWidth: 200,
      min: 0,
      max: 1,
    });
    expect(left.value).toBe(0);
    expect(left.ratio).toBe(0);
    expect(left.overflow).toBeLessThan(0);

    const right = getElasticRiftSliderValueFromPointer({
      pointerX: 340,
      trackX: 100,
      trackWidth: 200,
      min: 0,
      max: 1,
    });
    expect(right.value).toBe(1);
    expect(right.ratio).toBe(1);
    expect(right.overflow).toBeGreaterThan(0);
    expect(right.overflow).toBeLessThanOrEqual(ELASTIC_RIFT_SLIDER.maxOverflowPx);
  });

  it("keeps existing numeric formats and step behavior reusable", () => {
    expect(normalizeElasticRiftSliderValue(1.4)).toBe(1);
    expect(normalizeElasticRiftSliderValue(-0.2)).toBe(0);
    expect(normalizeElasticRiftSliderValue(52.4, { min: 0, max: 100, step: 5 })).toBe(50);

    const model = createElasticRiftSlider({ min: 0, max: 100, step: 10, value: 35 });
    expect(model.getValue()).toBe(40);
    expect(model.setValue(104)).toBe(100);
    expect(model.getValue()).toBe(100);
  });

  it("supports tuning slider millisecond ranges without changing units", () => {
    const das = getElasticRiftSliderValueFromPointer({
      pointerX: 190,
      trackX: 100,
      trackWidth: 180,
      min: 60,
      max: 240,
      step: 1,
    });
    expect(das.value).toBe(150);

    const lockDelay = getElasticRiftSliderValueFromPointer({
      pointerX: 999,
      trackX: 100,
      trackWidth: 280,
      min: 200,
      max: 900,
      step: 1,
    });
    expect(lockDelay.value).toBe(900);
    expect(lockDelay.overflow).toBeGreaterThan(0);
  });

  it("decays release overflow back to rest", () => {
    const active = getElasticRiftSliderReleaseOverflow({
      key: "audio:musicVolume",
      releaseKey: "audio:musicVolume",
      releaseOverflow: 20,
      releaseStartedAt: 1000,
      now: 1100,
    });
    expect(active).not.toBe(0);

    const done = getElasticRiftSliderReleaseOverflow({
      key: "audio:musicVolume",
      releaseKey: "audio:musicVolume",
      releaseOverflow: 20,
      releaseStartedAt: 1000,
      now: 1000 + ELASTIC_RIFT_SLIDER.releaseMs + 1,
    });
    expect(done).toBe(0);
  });
});
