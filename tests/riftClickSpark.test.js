import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RiftClickSpark, {
  RIFT_CLICK_SPARK_DEFAULTS,
  RIFT_CLICK_SPARK_REDUCED_MOTION_QUERY,
  createRiftClickSparkBurst,
} from "../src/react/components/RiftClickSpark.js";

describe("RiftClickSpark", () => {
  it("renders a global non-interactive spark canvas", () => {
    const markup = renderToStaticMarkup(
      React.createElement(RiftClickSpark),
    );
    const css = fs.readFileSync(
      path.join(process.cwd(), "src/react/styles/riftClickSpark.css"),
      "utf8",
    );

    expect(markup).toContain("data-tst-global-rift-click-spark");
    expect(markup).toContain("tst-rift-click-spark-canvas");
    expect(markup).toContain("tst-rift-click-spark-global");
    expect(css).toContain(".tst-react-global-rift-click-spark-layer");
    expect(css).toContain(".tst-rift-click-spark-canvas");
    expect(css).toContain("pointer-events: none");
  });

  it("creates a stronger purple-blue rift burst and disables it for reduced motion", () => {
    const burst = createRiftClickSparkBurst({
      now: 128,
      sparkCount: 13,
      x: 24,
      y: 32,
    });
    const clamped = createRiftClickSparkBurst({
      sparkCount: 24,
      x: 24,
      y: 32,
    });
    const reduced = createRiftClickSparkBurst({
      reducedMotion: true,
      sparkCount: 7,
      x: 24,
      y: 32,
    });

    expect(RIFT_CLICK_SPARK_DEFAULTS).toMatchObject({
      duration: 460,
      lineWidth: 2.4,
      radius: 34,
      sparkCount: 12,
      sparkSize: 22,
    });
    expect(burst).toHaveLength(13);
    expect(clamped).toHaveLength(14);
    expect(burst[0]).toMatchObject({
      core: true,
      duration: RIFT_CLICK_SPARK_DEFAULTS.duration,
      lineWidth: RIFT_CLICK_SPARK_DEFAULTS.lineWidth,
      radius: RIFT_CLICK_SPARK_DEFAULTS.radius,
      ringRadius: RIFT_CLICK_SPARK_DEFAULTS.radius * 0.62,
      startedAt: 128,
      x: 24,
      y: 32,
    });
    expect(burst.some(({ secondaryDot }) => secondaryDot)).toBe(true);
    expect(burst.map(({ color }) => color).join(" ")).toContain("rgba(129, 245, 255");
    expect(burst.map(({ color }) => color).join(" ")).toContain("rgba(178, 150, 255");
    expect(reduced).toEqual([]);
  });

  it("listens globally without blocking click propagation and cleans up resources", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/react/components/RiftClickSpark.js"),
      "utf8",
    );

    expect(source).toContain('window.addEventListener("pointerdown", handleGlobalPointerDown, true)');
    expect(source).toContain('window.removeEventListener("pointerdown", handleGlobalPointerDown, true)');
    expect(source).toContain('target.contains(event.target)');
    expect(source).not.toContain("preventDefault");
    expect(source).not.toContain("stopPropagation");
    expect(source).toContain("cancelAnimationFrame");
    expect(source).toContain("observer?.disconnect()");
    expect(source).toContain(RIFT_CLICK_SPARK_REDUCED_MOTION_QUERY);
  });
});
