const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const Module = require("module");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "trailer.mp4");
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION_SECONDS = 55;
const FPS = 30;
const PORT = 8792;

function addBundledNodeModules() {
  const modulesRoot = path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
  const paths = [modulesRoot];
  const pnpmRoot = path.join(modulesRoot, ".pnpm");
  if (fs.existsSync(pnpmRoot)) {
    for (const name of fs.readdirSync(pnpmRoot)) {
      if (name.startsWith("playwright@") || name.startsWith("playwright-core@")) {
        paths.push(path.join(pnpmRoot, name, "node_modules"));
      }
    }
  }
  process.env.NODE_PATH = paths.filter(fs.existsSync).join(path.delimiter);
  Module._initPaths();
}

function findBrowserExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

addBundledNodeModules();
const { chromium } = require("playwright");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

const rendererHtml = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>T-Spin Traveler Trailer Renderer</title>
<style>
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
canvas {
  display: block;
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  background: #04070e;
}
</style>
</head>
<body>
<canvas id="trailer" width="1920" height="1080"></canvas>
<script>
(() => {
  const W = 1920;
  const H = 1080;
  const DURATION = 55;
  const FPS = 30;
  const canvas = document.getElementById("trailer");
  const ctx = canvas.getContext("2d", { alpha: false });
  const assets = {};
  const imagePaths = {
    day: "assets/backgrounds/stage_forest_ruins_day.png",
    night: "assets/backgrounds/stage_forest_gate_night.png",
    ruins: "assets/backgrounds/stage_arcane_ruins_mid.png",
    corrupt: "assets/backgrounds/stage_corrupted_forest_late.png",
    rift: "assets/backgrounds/stage_rift_boss.png",
    noa: "assets/images/clean/ET_Character_alpha.png",
    enemy: "assets/forest-slime.png"
  };

  function asset(path) {
    return new URL(path, location.href).href;
  }

  function loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        assets[key] = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error("Failed to load " + src));
      img.src = asset(src);
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function smoothstep(start, end, value) {
    const x = clamp((value - start) / (end - start), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function hold(t, start, end, fade) {
    return smoothstep(start, start + fade, t) * (1 - smoothstep(end - fade, end, t));
  }

  function drawCover(img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawContain(img, x, y, w, h) {
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function panel(x, y, w, h, r, fill, stroke, lineWidth) {
    ctx.save();
    roundedRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = lineWidth || 1;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  }

  function rgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function setFont(size, kind, weight) {
    const stack = kind === "display"
      ? '"TSpin Traveler Display", "Trebuchet MS", sans-serif'
      : '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
    ctx.font = (weight || 900) + " " + size + "px " + stack;
  }

  function label(value, x, y, size, color, kind, align, weight, glow) {
    ctx.save();
    setFont(size, kind || "ui", weight || 900);
    ctx.textAlign = align || "left";
    ctx.textBaseline = "alphabetic";
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = size * 0.45;
    }
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
    ctx.restore();
  }

  function labels(lines, x, y, size, color, kind, align, gap, weight, glow) {
    for (let i = 0; i < lines.length; i += 1) {
      label(lines[i], x, y + i * size * (gap || 1.2), size, color, kind, align, weight, glow);
    }
  }

  function vignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 1040);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.6, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const side = ctx.createLinearGradient(0, 0, W, 0);
    side.addColorStop(0, "rgba(0,0,0,0.52)");
    side.addColorStop(0.22, "rgba(0,0,0,0)");
    side.addColorStop(0.78, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,0.52)");
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, W, H);
  }

  function background(t) {
    ctx.fillStyle = "#04070e";
    ctx.fillRect(0, 0, W, H);
    const layers = [
      ["day", hold(t, 0, 14, 3), 0.18],
      ["night", hold(t, 9, 27, 4), 0.3],
      ["ruins", hold(t, 22, 39, 4), 0.38],
      ["corrupt", hold(t, 34, 48, 4), 0.48],
      ["rift", smoothstep(42, 51, t), 0.56],
    ];
    for (const layer of layers) {
      const key = layer[0];
      const alpha = layer[1];
      const dim = layer[2];
      if (alpha <= 0.002) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      drawCover(assets[key], 0, 0, W, H);
      ctx.fillStyle = "rgba(3,5,12," + dim + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const pulse = 0.12 + 0.08 * Math.sin(t * 1.2);
    const rift = smoothstep(38, 53, t);
    const glow = ctx.createRadialGradient(960, 500, 70, 960, 500, 700);
    glow.addColorStop(0, "rgba(168,122,255," + (pulse + rift * 0.18) + ")");
    glow.addColorStop(0.35, "rgba(92,220,255,0.09)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    vignette();
  }

  function borderSystem(t) {
    ctx.save();
    ctx.strokeStyle = "rgba(124,236,255,0.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);
    ctx.strokeStyle = "rgba(168,122,255,0.16)";
    ctx.strokeRect(42, 42, W - 84, H - 84);
    const sweep = (Math.sin(t * 1.4) + 1) / 2;
    const g = ctx.createLinearGradient(120, 0, 470, 0);
    g.addColorStop(0, "rgba(255,230,160,0)");
    g.addColorStop(0.5, "rgba(255,230,160," + (0.32 + sweep * 0.38) + ")");
    g.addColorStop(1, "rgba(255,230,160,0)");
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(140 + sweep * 32, 60);
    ctx.lineTo(460 + sweep * 32, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1450 - sweep * 32, 1020);
    ctx.lineTo(1780 - sweep * 32, 1020);
    ctx.stroke();
    ctx.restore();
  }

  function fragments(t) {
    const blocks = [
      [146, 126, "#7cecff", -2],
      [254, 164, "#a87aff", -5],
      [1714, 126, "#ffe6a0", -8],
      [1620, 190, "#7cecff", -12],
      [118, 880, "#a87aff", -7],
      [1754, 898, "#ffe6a0", -10],
    ];
    for (const b of blocks) {
      const p = Math.sin((t + b[3]) * 0.75);
      ctx.save();
      ctx.translate(b[0], b[1] - p * 15);
      ctx.rotate((p * 12 * Math.PI) / 180);
      ctx.globalAlpha = 0.34 + Math.abs(p) * 0.22;
      ctx.shadowColor = b[2];
      ctx.shadowBlur = 18;
      panel(-17, -17, 34, 34, 5, rgba(b[2], 0.24), "rgba(255,255,255,0.26)", 1);
      ctx.restore();
    }

    const particles = [
      [408, 102, "#9fefff", -1],
      [1502, 108, "#c9a7ff", -4],
      [202, 450, "#ffe6a0", -8],
      [1700, 502, "#9fefff", -2],
      [464, 994, "#c9a7ff", -7],
      [1444, 1000, "#ffe6a0", -10],
      [908, 74, "#7cecff", -5],
      [1018, 1034, "#c9a7ff", -11],
    ];
    for (const p of particles) {
      const s = Math.sin((t + p[3]) * 1.25);
      ctx.save();
      ctx.globalAlpha = 0.26 + Math.abs(s) * 0.48;
      ctx.fillStyle = p[2];
      ctx.shadowColor = p[2];
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(p[0] + s * 14, p[1] - Math.abs(s) * 22, 3.5 + Math.abs(s) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function characters(t) {
    const alpha = hold(t, 7, 53, 3);
    if (alpha <= 0) return;
    const floatNoa = Math.sin(t * 1.25) * 7;
    ctx.save();
    ctx.globalAlpha = alpha * 0.96;
    ctx.shadowColor = "rgba(124,236,255,0.5)";
    ctx.shadowBlur = 38;
    drawContain(assets.noa, 62, 520 + floatNoa, 300, 430);
    ctx.restore();
    label("NOA", 86, 972, 30, "#fff2c7", "display", "left", 400, "rgba(168,122,255,0.6)");
    label("ALIEN TRAVELER", 88, 1005, 16, "rgba(226,238,248,0.6)", "ui", "left", 900);

    const floatEnemy = Math.sin(t * 1.05 + 1.1) * 8;
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.shadowColor = "rgba(168,122,255,0.52)";
    ctx.shadowBlur = 36;
    drawContain(assets.enemy, 1555, 610 + floatEnemy, 330, 310);
    ctx.restore();
    label("FOREST MONSTER", 1832, 1000, 18, "rgba(226,238,248,0.62)", "ui", "right", 900);
  }

  function gameplayFrame(t) {
    const alpha = smoothstep(8, 11, t) * (1 - smoothstep(50, 54, t));
    if (alpha <= 0) return;
    const x = 320;
    const y = 188;
    const w = 1280;
    const h = 720;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(168,122,255,0.5)";
    ctx.shadowBlur = 62;
    panel(x, y, w, h, 26, "rgba(4,8,15,0.94)", "rgba(206,188,255,0.72)", 3);
    ctx.shadowBlur = 0;
    panel(x + 18, y + 18, w - 36, h - 36, 18, null, "rgba(124,236,255,0.2)", 1);
    ctx.strokeStyle = "rgba(255,230,160,0.76)";
    ctx.lineWidth = 4;
    const c = 82;
    ctx.beginPath();
    ctx.moveTo(x - 12 + c, y - 12);
    ctx.lineTo(x - 12, y - 12);
    ctx.lineTo(x - 12, y - 12 + c);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + 12 - c, y - 12);
    ctx.lineTo(x + w + 12, y - 12);
    ctx.lineTo(x + w + 12, y - 12 + c);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 12, y + h + 12 - c);
    ctx.lineTo(x - 12, y + h + 12);
    ctx.lineTo(x - 12 + c, y + h + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + 12 - c, y + h + 12);
    ctx.lineTo(x + w + 12, y + h + 12);
    ctx.lineTo(x + w + 12, y + h + 12 - c);
    ctx.stroke();
    label("GAMEPLAY FOOTAGE", x + w / 2, y + h / 2 + 10, 36, "rgba(226,238,248,0.44)", "ui", "center", 900);
    label("16:9 CAPTURE AREA", x + 34, y - 34, 18, "rgba(124,236,255,0.86)", "ui", "left", 900, "rgba(124,236,255,0.55)");
    label("SAFE FRAME", x + w - 32, y + h + 38, 16, "rgba(255,230,160,0.82)", "ui", "right", 900);
    ctx.restore();
  }

  function opening(t) {
    const alpha = hold(t, 0, 9, 1.2);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    label("AN ANCIENT GAME AWAKENS", 960, 390, 26, "#7cecff", "ui", "center", 900, "rgba(124,236,255,0.62)");
    label("T-Spin Traveler", 960, 520, 112, "#fff2c7", "display", "center", 400, "rgba(168,122,255,0.78)");
    label("FALLING BLOCKS x FANTASY COMBAT", 960, 590, 34, "rgba(234,246,255,0.86)", "ui", "center", 900);
    ctx.restore();
  }

  function conceptText(t) {
    function card(alpha, x, y, title, subtitle, alignRight) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      panel(x, y, 285, 124, 14, "rgba(5,9,16,0.62)", "rgba(124,236,255,0.24)", 1);
      labels(title, alignRight ? x + 265 : x + 20, y + 48, 30, "#fff2c7", "display", alignRight ? "right" : "left", 1.05, 400, "rgba(168,122,255,0.42)");
      label(subtitle, alignRight ? x + 265 : x + 20, y + 98, 14, "rgba(226,238,248,0.7)", "ui", alignRight ? "right" : "left", 900);
      ctx.restore();
    }
    card(hold(t, 12, 25, 2), 52, 212, ["Clear lines.", "Cast spells."], "EVERY CLEAR BECOMES AN ATTACK.", false);
    card(hold(t, 16, 29, 2), 1583, 224, ["Chain combos.", "Break monsters."], "BUILD PRESSURE THROUGH THE BOARD.", true);
    const bottom = hold(t, 20, 36, 2);
    if (bottom > 0) {
      ctx.save();
      ctx.globalAlpha = bottom;
      panel(655, 930, 610, 84, 14, "rgba(5,9,16,0.62)", "rgba(255,230,160,0.22)", 1);
      label("MASTER THE BOARD. DEFEAT THE MONSTERS.", 960, 982, 24, "#fff2c7", "ui", "center", 900, "rgba(255,230,160,0.35)");
      ctx.restore();
    }
  }

  function combatWords(t) {
    const a1 = hold(t, 26, 39, 1.8);
    const a2 = hold(t, 30, 43, 1.8);
    const a3 = hold(t, 34, 47, 1.8);
    if (a1 > 0) {
      ctx.save();
      ctx.globalAlpha = a1;
      label("T-SPIN", 76, 350, 62, "#decaff", "display", "left", 400, "rgba(168,122,255,0.86)");
      ctx.restore();
    }
    if (a2 > 0) {
      ctx.save();
      ctx.globalAlpha = a2;
      label("COMBO", 1848, 398, 58, "#bff7ff", "display", "right", 400, "rgba(124,236,255,0.72)");
      ctx.restore();
    }
    if (a3 > 0) {
      ctx.save();
      ctx.globalAlpha = a3;
      label("PERFECT CLEAR", 960, 1018, 58, "#ffe6a0", "display", "center", 400, "rgba(255,230,160,0.72)");
      ctx.restore();
    }
  }

  function stageText(t) {
    const alpha = hold(t, 37, 50, 2);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    panel(58, 166, 260, 236, 18, "rgba(6,9,16,0.68)", "rgba(255,230,160,0.24)", 1);
    label("Travel Deeper", 78, 220, 34, "#ffe6a0", "display", "left", 400, "rgba(255,230,160,0.45)");
    const rows = ["ENCHANTED FOREST", "ANCIENT RUINS", "CORRUPTED GROVE", "ARCANE RIFT"];
    for (let i = 0; i < rows.length; i += 1) {
      ctx.fillStyle = "#a87aff";
      ctx.shadowColor = "#a87aff";
      ctx.shadowBlur = 12;
      ctx.fillRect(80, 252 + i * 36, 9, 9);
      label(rows[i], 104, 263 + i * 36, 15, "rgba(236,243,255,0.76)", "ui", "left", 900);
    }
    ctx.restore();
  }

  function climax(t) {
    const alpha = hold(t, 43, 53, 1.5);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);
    const g = ctx.createRadialGradient(960, 510, 60, 960, 510, 620 + pulse * 60);
    g.addColorStop(0, "rgba(255,255,255,0.13)");
    g.addColorStop(0.26, "rgba(168,122,255,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    labels(["Build. Survive.", "Travel deeper."], 1832, 268, 48, "#fff2c7", "display", "right", 1.08, 400, "rgba(168,122,255,0.8)");
    labels(["BLOCK FRAGMENTS AND MAGIC ENERGY", "SURGE AROUND THE RIFT."], 1832, 386, 16, "rgba(226,238,248,0.78)", "ui", "right", 1.45, 900);
    ctx.restore();
  }

  function cta(t) {
    const alpha = smoothstep(50, 54, t);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(2,4,10," + (0.48 * alpha) + ")";
    ctx.fillRect(0, 0, W, H);
    label("T-Spin Traveler", 960, 500, 108, "#fff2c7", "display", "center", 400, "rgba(168,122,255,0.82)");
    label("AVAILABLE ON WEB", 960, 570, 33, "rgba(226,238,248,0.84)", "ui", "center", 900);
    panel(728, 622, 220, 64, 14, "rgba(255,230,160,0.2)", "rgba(255,230,160,0.72)", 2);
    panel(972, 622, 220, 64, 14, "rgba(168,122,255,0.18)", "rgba(255,230,160,0.72)", 2);
    label("PLAY NOW", 838, 663, 22, "#fff2c7", "ui", "center", 900);
    label("TRY THE DEMO", 1082, 663, 22, "#fff2c7", "ui", "center", 900);
    ctx.restore();
  }

  function render(t) {
    background(t);
    borderSystem(t);
    fragments(t);
    characters(t);
    gameplayFrame(t);
    opening(t);
    conceptText(t);
    combatWords(t);
    stageText(t);
    climax(t);
    cta(t);
  }

  async function audioTrack() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const audio = new AudioContext({ sampleRate: 48000 });
    await audio.resume();
    const destination = audio.createMediaStreamDestination();
    const master = audio.createGain();
    master.gain.value = 0.18;
    master.connect(destination);

    function tone(freq, start, duration, type, gainValue) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, audio.currentTime + start);
      gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(gainValue || 0.08, audio.currentTime + start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(audio.currentTime + start);
      osc.stop(audio.currentTime + start + duration + 0.05);
    }

    tone(73.42, 0, DURATION, "sine", 0.09);
    tone(110, 0, DURATION, "triangle", 0.035);
    for (let beat = 0; beat < DURATION; beat += 2) {
      tone(146.83, beat, 0.18, "triangle", beat % 8 === 0 ? 0.08 : 0.04);
    }
    for (const hit of [9, 18, 27, 34, 43, 50]) {
      tone(440, hit, 0.34, "sine", 0.07);
      tone(880, hit + 0.04, 0.28, "triangle", 0.045);
    }
    for (let chime = 6; chime < DURATION - 3; chime += 5.5) {
      tone(659.25, chime, 0.42, "sine", 0.035);
      tone(987.77, chime + 0.08, 0.34, "sine", 0.025);
    }
    return { track: destination.stream.getAudioTracks()[0], close: () => audio.close() };
  }

  window.renderTrailer = async function renderTrailer() {
    const avMime = 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"';
    const vMime = 'video/mp4;codecs="avc1.42E01E"';
    const mimeType = MediaRecorder.isTypeSupported(avMime) ? avMime : vMime;
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error("MP4 recording is not supported by this browser.");

    await Promise.all(Object.entries(imagePaths).map((entry) => loadImage(entry[0], entry[1])));
    const face = new FontFace("TSpin Traveler Display", "url(" + asset("assets/fonts/TSpinTravelerDisplay.woff2") + ")");
    await face.load();
    document.fonts.add(face);
    await document.fonts.ready;

    const stream = canvas.captureStream(FPS);
    let audio = null;
    if (mimeType === avMime) {
      try {
        audio = await audioTrack();
        if (audio && audio.track) stream.addTrack(audio.track);
      } catch (error) {
        console.warn("Audio track skipped", error);
      }
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 9000000,
      audioBitsPerSecond: 128000,
    });
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) chunks.push(event.data);
    };
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    let startTime = performance.now();
    let done = false;

    function tick(now) {
      const elapsed = (now - startTime) / 1000;
      render(Math.min(DURATION, elapsed));
      if (elapsed >= DURATION) {
        done = true;
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        if (audio) audio.close();
        return;
      }
      requestAnimationFrame(tick);
    }

    render(0);
    recorder.start(1000);
    requestAnimationFrame(tick);
    while (!done) await new Promise((resolve) => setTimeout(resolve, 500));
    await stopped;
    const blob = new Blob(chunks, { type: "video/mp4" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "trailer.mp4";
    document.body.appendChild(link);
    link.click();
    return { size: blob.size, chunks: chunks.length, mimeType, duration: DURATION, width: W, height: H };
  };
})();
</script>
</body>
</html>`;

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (url.pathname === "/__render_trailer") {
      send(res, 200, rendererHtml, "text/html; charset=utf-8");
      return;
    }
    const requested = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    const filePath = path.resolve(PROJECT_ROOT, requested);
    if (!filePath.startsWith(PROJECT_ROOT)) {
      send(res, 403, "Forbidden");
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        send(res, 404, "Not found");
        return;
      }
      send(res, 200, data, mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    });
  });
}

async function main() {
  const browserPath = findBrowserExecutable();
  if (!browserPath) throw new Error("Chrome or Edge is required to render trailer.mp4.");
  fs.rmSync(OUTPUT_PATH, { force: true });

  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", resolve);
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: browserPath,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      acceptDownloads: true,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(160000);
    await page.goto(`http://127.0.0.1:${PORT}/__render_trailer`, { waitUntil: "load" });
    const downloadPromise = page.waitForEvent("download", { timeout: 160000 });
    const result = await page.evaluate(() => window.renderTrailer());
    const download = await downloadPromise;
    await download.saveAs(OUTPUT_PATH);
    const stat = fs.statSync(OUTPUT_PATH);
    console.log(JSON.stringify({
      output: OUTPUT_PATH,
      bytes: stat.size,
      durationSeconds: result.duration,
      width: result.width,
      height: result.height,
      mimeType: result.mimeType,
      chunks: result.chunks,
    }, null, 2));
    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
