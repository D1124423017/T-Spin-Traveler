export const MAIN_MENU_HERO_DIALOGUE_KEYS = Object.freeze([
  "menuHeroDialogue1",
  "menuHeroDialogue2",
  "menuHeroDialogue3",
  "menuHeroDialogue4",
  "menuHeroDialogue5",
  "menuHeroDialogue6",
  "menuHeroDialogue7",
  "menuHeroDialogue8",
  "menuHeroDialogue9",
  "menuHeroDialogue10",
  "menuHeroDialogue11",
  "menuHeroDialogue12",
  "menuHeroDialogue13",
  "menuHeroDialogue14",
]);

export const MAIN_MENU_DIALOGUE_STYLE = Object.freeze({
  maxLines: 2,
  zh: Object.freeze({
    width: 430,
    fontSize: 16,
    minFontSize: 13,
    lineHeight: 22,
  }),
  en: Object.freeze({
    width: 450,
    fontSize: 15,
    minFontSize: 12,
    lineHeight: 21,
  }),
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function tokenizeDialogue(text, language) {
  if (language === "en") return String(text).trim().split(/\s+/).filter(Boolean);
  return Array.from(String(text).replace(/\s+/g, ""));
}

function joinDialogueTokens(tokens, language) {
  return language === "en" ? tokens.join(" ") : tokens.join("");
}

export function wrapMainMenuDialogueText({
  text,
  language = "zh",
  maxWidth,
  measureText,
}) {
  const tokens = tokenizeDialogue(text, language);
  const lines = [];
  let current = [];

  for (const token of tokens) {
    const candidate = [...current, token];
    if (current.length && measureText(joinDialogueTokens(candidate, language)) > maxWidth) {
      lines.push(joinDialogueTokens(current, language));
      current = [token];
    } else {
      current = candidate;
    }
  }
  if (current.length) lines.push(joinDialogueTokens(current, language));
  return lines;
}

export function getMainMenuDialogueLayout({
  hero,
  menuX,
  language = "zh",
  uiScale = 1,
}) {
  const style = MAIN_MENU_DIALOGUE_STYLE[language === "en" ? "en" : "zh"];
  const width = style.width * uiScale;
  const height = width * (809 / 1944);
  const x = clamp(menuX - width - 8 * uiScale, 88, menuX - width);
  const y = clamp(hero.y - 322 * uiScale, 246 * uiScale, 310 * uiScale);

  return {
    x,
    y,
    w: width,
    h: height,
    textX: x + width * 0.105,
    labelY: y + height * 0.285,
    bodyY: y + height * 0.47,
    textWidth: width * 0.79,
    style,
  };
}

export function getMainMenuDialogueAlpha(interaction, now) {
  if (!interaction?.lineKey || now >= interaction.lineUntil) return 0;
  const age = now - interaction.lineStartedAt;
  const remaining = interaction.lineUntil - now;
  return Math.min(clamp(age / 180, 0, 1), clamp(remaining / 320, 0, 1));
}

function fitDialogueText({
  ctx,
  text,
  language,
  maxWidth,
  style,
  canvasFont,
}) {
  for (let size = style.fontSize; size >= style.minFontSize; size -= 1) {
    ctx.font = canvasFont("700", size, text);
    const lines = wrapMainMenuDialogueText({
      text,
      language,
      maxWidth,
      measureText: (value) => ctx.measureText(value).width,
    });
    if (lines.length <= MAIN_MENU_DIALOGUE_STYLE.maxLines) {
      return { lines, size };
    }
  }

  ctx.font = canvasFont("700", style.minFontSize, text);
  const lines = wrapMainMenuDialogueText({
    text,
    language,
    maxWidth,
    measureText: (value) => ctx.measureText(value).width,
  });
  return {
    lines: lines.slice(0, MAIN_MENU_DIALOGUE_STYLE.maxLines),
    size: style.minFontSize,
  };
}

export function drawMainMenuHeroDialogue({
  ctx,
  frameImage,
  interaction,
  now,
  language,
  text,
  hero,
  menuX,
  uiScale = 1,
  canvasFont,
  isImageReady,
  interactive = true,
}) {
  if (!interactive) return false;
  const alpha = getMainMenuDialogueAlpha(interaction, now);
  if (alpha <= 0 || !isImageReady(frameImage)) return false;

  const layout = getMainMenuDialogueLayout({
    hero,
    menuX,
    language,
    uiScale,
  });
  const fitted = fitDialogueText({
    ctx,
    text,
    language,
    maxWidth: layout.textWidth,
    style: layout.style,
    canvasFont,
  });
  const clickLine = interaction.lineKind === "click";

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = clickLine
    ? "rgba(255, 226, 154, 0.46)"
    : "rgba(139, 104, 255, 0.56)";
  ctx.shadowBlur = clickLine ? 22 : 18;
  ctx.drawImage(frameImage, layout.x, layout.y, layout.w, layout.h);
  ctx.shadowBlur = 0;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = canvasFont("900", 11 * uiScale, "NOA", true);
  ctx.fillStyle = clickLine ? "#ffe9a8" : "#bceaff";
  ctx.shadowColor = clickLine ? "rgba(255, 215, 116, 0.7)" : "rgba(126, 231, 255, 0.72)";
  ctx.shadowBlur = 8;
  ctx.fillText("NOA", layout.textX, layout.labelY);

  ctx.font = canvasFont("700", fitted.size * uiScale, text);
  ctx.fillStyle = "#f8f5ff";
  ctx.shadowColor = "rgba(13, 7, 30, 0.96)";
  ctx.shadowBlur = 5;
  fitted.lines.forEach((line, index) => {
    ctx.fillText(
      line,
      layout.textX,
      layout.bodyY + index * layout.style.lineHeight * uiScale,
      layout.textWidth,
    );
  });
  ctx.restore();
  return true;
}
