import { getAscensionStageName } from "../core/ascensionChallenge.js";
import { getAscensionResultButtonRects } from "./hudLayout.js";
import {
  drawOverlayGlassPanel,
  drawOverlayGlassSection,
  drawOverlayTitleRule,
} from "./overlayGlassSkin.js";

export function drawAscensionResultOverlay({
  ctx,
  run,
  metaProgress,
  message,
  t,
  fmt,
  drawDimOverlay,
  resultScrim,
  drawCornerGlyph,
  label,
  wrapText,
  roundedRect,
  drawMenuButton,
} = {}) {
  const succeeded = run?.status === "success";
  const buttons = getAscensionResultButtonRects();
  const accent = succeeded ? "#fff0a6" : "#ff8f98";
  const panel = { x: 342, y: 126, w: 596, h: 424 };
  const skinDeps = { ctx, roundedRect };
  ctx.save();
  drawDimOverlay(resultScrim);
  drawOverlayGlassPanel(skinDeps, panel, {
    colors: succeeded
      ? ["#fff0a6", "#9b78ff", "#6de8ff", "#fff0a6"]
      : ["#ff8f98", "#9b78ff", "#6de8ff", "#ff8f98"],
    glowIntensity: 0.68,
    glowRadius: 26,
    selectedIntensity: 0.22,
  });
  drawCornerGlyph(640, 150, accent);
  label(
    t(succeeded ? "ascensionChallengeSuccessTitle" : "ascensionChallengeFailedTitle"),
    400,
    214,
    38,
    "#f5f1e6",
  );
  drawOverlayTitleRule(skinDeps, 402, 230, 310, accent);
  wrapText(message, 402, 258, 476, 25, "rgba(238,244,252,0.72)", 17);
  drawOverlayGlassSection(skinDeps, { x: 402, y: 320, w: 476, h: 86 }, {
    color: accent,
    edgeSensitivity: 28,
    selected: true,
    selectedIntensity: 0.18,
  });
  label(
    fmt("ascensionChallengeLinesHud", {
      current: run?.linesCleared || 0,
      target: run?.targetLines || 0,
    }),
    430,
    354,
    18,
    "#9df7da",
  );
  label(
    succeeded
      ? fmt("metaUpgradeStage", { stage: getAscensionStageName(metaProgress) })
      : fmt("ascensionChallengeTimeHud", {
        seconds: Math.ceil(Math.max(0, run?.remainingMs || 0) / 1000),
      }),
    430,
    386,
    18,
    accent,
  );
  drawMenuButton(
    succeeded ? buttons.single.x : buttons.primary.x,
    succeeded ? buttons.single.y : buttons.primary.y,
    succeeded ? buttons.single.w : buttons.primary.w,
    succeeded ? buttons.single.h : buttons.primary.h,
    t("ascensionReturnToUpgrades"),
    succeeded ? "Enter" : "Esc",
    "primary",
  );
  if (!succeeded) {
    drawMenuButton(
      buttons.secondary.x,
      buttons.secondary.y,
      buttons.secondary.w,
      buttons.secondary.h,
      t("ascensionRetry"),
      "Enter",
    );
  }
  ctx.restore();
}

export function drawAscensionChallengeHud({
  ctx,
  run,
  fmt,
  fitLabel,
  roundedRect,
} = {}) {
  const remainingSeconds = Math.ceil(Math.max(0, run.remainingMs || 0) / 1000);
  const urgent = run.status === "active" && remainingSeconds <= 15;
  ctx.save();
  ctx.fillStyle = "rgba(14, 8, 28, 0.88)";
  roundedRect(404, 8, 472, 42, 10, true, false);
  ctx.strokeStyle = urgent ? "rgba(255, 111, 124, 0.72)" : "rgba(184, 141, 255, 0.58)";
  ctx.lineWidth = 1.7;
  roundedRect(404, 8, 472, 42, 10, false, true);
  fitLabel(
    fmt("ascensionChallengeGoal", {
      seconds: Math.round(run.durationMs / 1000),
      lines: run.targetLines,
    }),
    424,
    25,
    238,
    13,
    "#d7c2ff",
    10,
    "900",
    true,
  );
  fitLabel(
    fmt("ascensionChallengeTimeHud", { seconds: remainingSeconds }),
    672,
    25,
    92,
    14,
    urgent ? "#ff8f98" : "#fff0a6",
    11,
    "900",
    true,
  );
  fitLabel(
    fmt("ascensionChallengeLinesHud", {
      current: run.linesCleared,
      target: run.targetLines,
    }),
    770,
    25,
    86,
    14,
    "#9df7da",
    11,
    "900",
    true,
  );
  ctx.restore();
}
