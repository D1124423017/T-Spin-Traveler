import React, { useEffect, useRef } from "react";

const h = React.createElement;
const TAU = Math.PI * 2;

export const RIFT_CLICK_SPARK_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const RIFT_CLICK_SPARK_DEFAULTS = Object.freeze({
  duration: 460,
  lineWidth: 2.4,
  radius: 34,
  sparkCount: 12,
  sparkSize: 22,
});

const SPARK_COLORS = Object.freeze([
  "rgba(129, 245, 255, 0.96)",
  "rgba(178, 150, 255, 0.94)",
  "rgba(117, 87, 255, 0.9)",
  "rgba(255, 224, 154, 0.72)",
]);

function getDevicePixelRatio() {
  if (typeof window === "undefined") return 1;
  return Math.min(2, Math.max(1, window.devicePixelRatio || 1));
}

export function shouldReduceRiftClickSparkMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return Boolean(window.matchMedia(RIFT_CLICK_SPARK_REDUCED_MOTION_QUERY).matches);
}

function getSparkJitter(index) {
  return Math.sin((index + 1) * 12.9898) * 0.13;
}

export function createRiftClickSparkBurst({
  duration = RIFT_CLICK_SPARK_DEFAULTS.duration,
  lineWidth = RIFT_CLICK_SPARK_DEFAULTS.lineWidth,
  now = 0,
  radius = RIFT_CLICK_SPARK_DEFAULTS.radius,
  reducedMotion = false,
  sparkCount = RIFT_CLICK_SPARK_DEFAULTS.sparkCount,
  sparkSize = RIFT_CLICK_SPARK_DEFAULTS.sparkSize,
  x = 0,
  y = 0,
} = {}) {
  if (reducedMotion) return [];
  const count = Math.max(0, Math.min(14, Math.floor(sparkCount)));
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / Math.max(1, count)) * TAU + getSparkJitter(index);
    const length = sparkSize * (0.72 + (index % 3) * 0.16);
    return {
      angle,
      color: SPARK_COLORS[index % SPARK_COLORS.length],
      core: index === 0,
      delay: (index % 2) * 18,
      dotSize: Math.max(2.2, lineWidth * (1.15 + (index % 2) * 0.45)),
      duration,
      length,
      lineWidth,
      radius,
      ringRadius: radius * 0.62,
      secondaryDot: index % 3 === 0,
      startedAt: now,
      x,
      y,
    };
  });
}

export default function RiftClickSpark({
  className = "",
  disabled = false,
  duration = RIFT_CLICK_SPARK_DEFAULTS.duration,
  lineWidth = RIFT_CLICK_SPARK_DEFAULTS.lineWidth,
  radius = RIFT_CLICK_SPARK_DEFAULTS.radius,
  sparkCount = RIFT_CLICK_SPARK_DEFAULTS.sparkCount,
  sparkSize = RIFT_CLICK_SPARK_DEFAULTS.sparkSize,
  targetSelector = ".shell",
} = {}) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const sparksRef = useRef([]);
  const frameRef = useRef(0);
  const settingsRef = useRef({
    disabled,
    duration,
    lineWidth,
    radius,
    sparkCount,
    sparkSize,
    targetSelector,
  });

  useEffect(() => {
    settingsRef.current = {
      disabled,
      duration,
      lineWidth,
      radius,
      sparkCount,
      sparkSize,
      targetSelector,
    };
  }, [disabled, duration, lineWidth, radius, sparkCount, sparkSize, targetSelector]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host || typeof window === "undefined") return undefined;

    const resizeCanvas = () => {
      const rect = host.getBoundingClientRect();
      const ratio = getDevicePixelRatio();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const context = canvas.getContext("2d");
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();
    let observer = null;
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(resizeCanvas);
      observer.observe(host);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      observer?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const draw = (timestamp) => {
    frameRef.current = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    sparksRef.current = sparksRef.current.filter((spark) => {
      const progress = Math.max(0, (timestamp - spark.startedAt - spark.delay) / spark.duration);
      if (progress > 1) return false;
      if (progress <= 0) return true;

      const eased = 1 - Math.pow(1 - progress, 2.8);
      const alpha = Math.pow(1 - progress, 1.35);
      const distance = spark.radius * eased;
      const headX = spark.x + Math.cos(spark.angle) * distance;
      const headY = spark.y + Math.sin(spark.angle) * distance;
      const tailX = spark.x + Math.cos(spark.angle) * Math.max(0, distance - spark.length);
      const tailY = spark.y + Math.sin(spark.angle) * Math.max(0, distance - spark.length);

      context.save();
      context.globalCompositeOperation = "lighter";
      if (spark.core) {
        const ringProgress = 1 - Math.pow(1 - progress, 2.1);
        const coreAlpha = Math.pow(1 - progress, 1.8);
        const coreRadius = 7 + spark.radius * 0.18 * ringProgress;
        const coreGlow = context.createRadialGradient(
          spark.x,
          spark.y,
          0,
          spark.x,
          spark.y,
          coreRadius,
        );
        coreGlow.addColorStop(0, `rgba(126, 247, 255, ${0.56 * coreAlpha})`);
        coreGlow.addColorStop(0.42, `rgba(142, 92, 255, ${0.32 * coreAlpha})`);
        coreGlow.addColorStop(1, "rgba(142, 92, 255, 0)");
        context.fillStyle = coreGlow;
        context.beginPath();
        context.arc(spark.x, spark.y, coreRadius, 0, TAU);
        context.fill();
        context.globalAlpha = 0.52 * coreAlpha;
        context.strokeStyle = "rgba(151, 230, 255, 0.8)";
        context.lineWidth = Math.max(1.1, spark.lineWidth * 0.55);
        context.beginPath();
        context.arc(spark.x, spark.y, spark.ringRadius * ringProgress, 0, TAU);
        context.stroke();
      }
      context.globalAlpha = alpha;
      context.strokeStyle = spark.color;
      context.lineWidth = spark.lineWidth;
      context.lineCap = "round";
      context.shadowBlur = 13;
      context.shadowColor = spark.color;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(headX, headY);
      context.stroke();
      context.fillStyle = spark.color;
      context.beginPath();
      context.arc(headX, headY, spark.dotSize * (1 - progress * 0.35), 0, TAU);
      context.fill();
      if (spark.secondaryDot) {
        const midDistance = distance * 0.54;
        const midX = spark.x + Math.cos(spark.angle + 0.08) * midDistance;
        const midY = spark.y + Math.sin(spark.angle + 0.08) * midDistance;
        context.globalAlpha = alpha * 0.62;
        context.beginPath();
        context.arc(midX, midY, spark.dotSize * 0.52 * (1 - progress * 0.2), 0, TAU);
        context.fill();
      }
      context.restore();
      return true;
    });

    if (sparksRef.current.length > 0 && typeof window !== "undefined") {
      frameRef.current = window.requestAnimationFrame(draw);
    }
  };

  const scheduleDraw = () => {
    if (frameRef.current || typeof window === "undefined") return;
    frameRef.current = window.requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const handleGlobalPointerDown = (event) => {
      const settings = settingsRef.current;
      if (settings.disabled || typeof performance === "undefined") return;
      if (Number.isFinite(event.button) && event.button !== 0) return;
      const host = hostRef.current;
      const target = document.querySelector(settings.targetSelector) || document.body;
      if (!host || !target || !target.contains(event.target)) return;
      const hostRect = host.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      if (
        event.clientX < targetRect.left
        || event.clientX > targetRect.right
        || event.clientY < targetRect.top
        || event.clientY > targetRect.bottom
      ) {
        return;
      }
      const x = event.clientX - hostRect.left;
      const y = event.clientY - hostRect.top;
      if (x < 0 || y < 0 || x > hostRect.width || y > hostRect.height) return;

      const burst = createRiftClickSparkBurst({
        duration: settings.duration,
        lineWidth: settings.lineWidth,
        now: performance.now(),
        radius: settings.radius,
        reducedMotion: shouldReduceRiftClickSparkMotion(),
        sparkCount: settings.sparkCount,
        sparkSize: settings.sparkSize,
        x,
        y,
      });
      if (burst.length === 0) return;
      sparksRef.current.push(...burst);
      scheduleDraw();
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown, true);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown, true);
    };
  }, []);

  return h("div", {
    className: ["tst-rift-click-spark", "tst-rift-click-spark-global", className].filter(Boolean).join(" "),
    "data-tst-global-rift-click-spark": "true",
    ref: hostRef,
  },
    h("canvas", {
      "aria-hidden": "true",
      className: "tst-rift-click-spark-canvas",
      ref: canvasRef,
    }),
  );
}
