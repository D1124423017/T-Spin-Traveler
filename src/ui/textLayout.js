const DEFAULT_DISPLAY_FONT_PATTERN = /^[A-Za-z0-9 .,!?:;()[\]+\-/%<>×]+$/;

export function shouldUseDisplayFont(text, pattern = DEFAULT_DISPLAY_FONT_PATTERN) {
  const content = String(text ?? "").trim();
  return content.length > 0 && content.length <= 30 && pattern.test(content);
}

export function createCanvasFont({
  displayFontStack,
  uiFontStack,
  displayPattern = DEFAULT_DISPLAY_FONT_PATTERN,
}) {
  return function canvasFont(weight, size, text = "", forceDisplay = false) {
    const fontStack = forceDisplay || shouldUseDisplayFont(text, displayPattern)
      ? displayFontStack
      : uiFontStack;
    return `${weight} ${size}px ${fontStack}`;
  };
}

export function tokenizeForWrap(text) {
  const tokens = [];
  let word = "";
  const flush = () => {
    if (word) tokens.push(word);
    word = "";
  };
  for (const ch of [...text]) {
    if (ch === "\n") {
      flush();
      tokens.push("\n");
    } else if (/\s/.test(ch)) {
      flush();
      tokens.push(" ");
    } else if (isCjkChar(ch)) {
      flush();
      tokens.push(ch);
    } else {
      word += ch;
    }
  }
  flush();
  return tokens;
}

export function isCjkChar(ch) {
  return /[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch);
}

export function createTextLayout(ctx, { canvasFont, uiFontStack }) {
  function label(text, x, y, size, color) {
    ctx.font = canvasFont("700", size, text);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function fitLabel(text, x, y, maxWidth, size, color, minSize = 12, weight = "700", forceDisplay = false) {
    const content = String(text);
    let fontSize = size;
    ctx.fillStyle = color;
    while (fontSize > minSize) {
      ctx.font = canvasFont(weight, fontSize, content, forceDisplay);
      if (ctx.measureText(content).width <= maxWidth) break;
      fontSize -= 1;
    }
    ctx.fillText(content, x, y);
  }

  function breakOversizedToken(token, maxWidth) {
    const parts = [];
    let current = "";
    for (const ch of [...token]) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth && current) {
        parts.push(current);
        current = ch;
      } else {
        current = test;
      }
    }
    if (current) parts.push(current);
    return parts;
  }

  function wrapText(text, x, y, maxWidth, lineHeight, color, size) {
    ctx.font = `700 ${size}px ${uiFontStack}`;
    ctx.fillStyle = color;
    const tokens = tokenizeForWrap(String(text));
    let line = "";
    let cy = y;
    for (const token of tokens) {
      if (token === "\n") {
        if (line.trim()) ctx.fillText(line.trimEnd(), x, cy);
        line = "";
        cy += lineHeight;
        continue;
      }
      const next = line ? line + token : token.trimStart();
      const test = next.trimStart();
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trimEnd(), x, cy);
        line = token.trimStart();
        cy += lineHeight;
        if (ctx.measureText(line).width > maxWidth) {
          const broken = breakOversizedToken(line, maxWidth);
          for (let i = 0; i < broken.length - 1; i += 1) {
            ctx.fillText(broken[i], x, cy);
            cy += lineHeight;
          }
          line = broken[broken.length - 1] || "";
        }
      } else {
        line = next;
      }
    }
    if (line.trim()) ctx.fillText(line.trimEnd(), x, cy);
  }

  function drawLimitedWrapText(text, x, y, maxWidth, lineHeight, color, size, maxLines = 2, weight = "700", forceDisplay = false) {
    ctx.save();
    ctx.font = canvasFont(weight, size, text, forceDisplay);
    ctx.fillStyle = color;
    const tokens = tokenizeForWrap(String(text));
    const lines = [];
    let line = "";
    let truncated = false;
    for (const token of tokens) {
      if (token === "\n") {
        if (line.trim()) lines.push(line.trimEnd());
        line = "";
        if (lines.length >= maxLines) {
          truncated = true;
          break;
        }
        continue;
      }
      const next = line ? line + token : token.trimStart();
      const test = next.trimStart();
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trimEnd());
        line = token.trimStart();
        if (lines.length >= maxLines) {
          truncated = true;
          break;
        }
      } else {
        line = next;
      }
    }
    if (lines.length < maxLines && line.trim()) lines.push(line.trimEnd());
    const limited = lines.slice(0, maxLines);
    if (truncated) {
      const lastIndex = limited.length - 1;
      if (lastIndex >= 0) {
        let last = limited[lastIndex].replace(/\s+$/, "");
        while (last.length > 1 && ctx.measureText(`${last}...`).width > maxWidth) {
          last = last.slice(0, -1).trimEnd();
        }
        limited[lastIndex] = `${last}...`;
      }
    }
    limited.forEach((lineText, index) => {
      fitLabel(lineText, x, y + index * lineHeight, maxWidth, size, color, Math.max(8, size - 4), weight, forceDisplay);
    });
    ctx.restore();
  }

  return {
    label,
    fitLabel,
    wrapText,
    drawLimitedWrapText,
    breakOversizedToken,
  };
}
