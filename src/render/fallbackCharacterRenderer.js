export function createFallbackCharacterRenderer({
  ctx,
  hexToRgba,
  roundedRect,
}) {
  function drawNoaFallback() {
    ctx.fillStyle = "#151821";
    ctx.beginPath();
    ctx.ellipse(0, 162, 86, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2d3340";
    ctx.beginPath();
    ctx.moveTo(-64, 32);
    ctx.quadraticCurveTo(-22, 98, -42, 154);
    ctx.quadraticCurveTo(6, 174, 52, 152);
    ctx.quadraticCurveTo(36, 92, 72, 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(209, 220, 235, 0.25)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#d8d8d2";
    ctx.beginPath();
    ctx.ellipse(0, -34, 62, 72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f1f0e7";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#111218";
    ctx.beginPath();
    ctx.ellipse(-22, -42, 15, 25, -0.14, 0, Math.PI * 2);
    ctx.ellipse(24, -42, 15, 25, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#191d26";
    ctx.fillRect(-24, 100, 16, 68);
    ctx.fillRect(14, 100, 16, 68);
    ctx.fillStyle = "#1d2028";
    ctx.fillRect(-36, 158, 34, 14);
    ctx.fillRect(10, 158, 38, 14);
    ctx.fillStyle = "#78dcff";
    ctx.shadowColor = "#78dcff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 62, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnemySilhouette(enemy, hit) {
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.8 : 0.55);
    ctx.shadowBlur = hit ? 34 : 22;
    if (hit) ctx.globalCompositeOperation = "lighter";
    if (enemy.id === "vine") drawVineGuardBody(enemy);
    else if (enemy.id === "mushroom") drawMushroomMageBody(enemy);
    else if (enemy.id === "beetle") drawStoneBeetleBody(enemy);
    else if (enemy.id === "mist") drawMistDeerBody(enemy);
    else if (enemy.id === "thorn") drawStoneBeetleBody(enemy);
    else if (enemy.id === "wisp") drawMistDeerBody(enemy);
    else if (enemy.id === "sentinel") drawSlimeKingBody(enemy);
    else if (enemy.id === "king") drawSlimeKingBody(enemy);
    ctx.restore();
  }

  function drawVineGuardBody(enemy) {
    ctx.strokeStyle = "#1d3a25";
    ctx.lineWidth = 16;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-96 + i * 48, 88);
      ctx.bezierCurveTo(-126 + i * 58, 10, -58 + i * 34, -40, -62 + i * 38, -110);
      ctx.stroke();
    }
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(0, 18, 72, 88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0e2018";
    ctx.beginPath();
    ctx.ellipse(-24, -12, 10, 18, -0.3, 0, Math.PI * 2);
    ctx.ellipse(24, -12, 10, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMushroomMageBody(enemy) {
    ctx.fillStyle = "#d8f7ff";
    roundedRect(-30, -8, 60, 112, 26, true, false);
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.ellipse(0, -60, 118, 54, 0, Math.PI, 0);
    ctx.lineTo(96, -22);
    ctx.lineTo(-96, -22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#143844";
    for (const [x, y, r] of [[-44, -48, 10], [0, -66, 13], [46, -45, 9]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStoneBeetleBody(enemy) {
    ctx.fillStyle = "#7f7664";
    ctx.beginPath();
    ctx.ellipse(0, 8, 112, 72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 8;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 12, 94 - i * 16, Math.PI * 0.12, Math.PI * 0.88);
      ctx.stroke();
    }
    ctx.fillStyle = "#1f1c18";
    ctx.beginPath();
    ctx.moveTo(-98, -8);
    ctx.lineTo(-144, -46);
    ctx.lineTo(-116, 8);
    ctx.moveTo(98, -8);
    ctx.lineTo(144, -46);
    ctx.lineTo(116, 8);
    ctx.fill();
  }

  function drawMistDeerBody(enemy) {
    ctx.fillStyle = "rgba(210, 206, 255, 0.48)";
    ctx.beginPath();
    ctx.ellipse(0, 24, 82, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-8, -52, 36, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 6;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 18, -86);
      ctx.lineTo(side * 58, -140);
      ctx.moveTo(side * 38, -114);
      ctx.lineTo(side * 78, -126);
      ctx.stroke();
    }
    drawMistWisps(enemy);
  }

  function drawMistWisps(enemy) {
    ctx.save();
    ctx.strokeStyle = hexToRgba(enemy.color, 0.56);
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i += 1) {
      const y = -84 + i * 32 + Math.sin(performance.now() * 0.002 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(-132, y);
      ctx.bezierCurveTo(-58, y - 24, 48, y + 24, 132, y - 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSlimeKingBody(enemy) {
    ctx.fillStyle = "#6cc76f";
    ctx.beginPath();
    ctx.ellipse(0, 24, 124, 86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(-54, -82);
    ctx.lineTo(-28, -130);
    ctx.lineTo(-4, -86);
    ctx.lineTo(26, -132);
    ctx.lineTo(58, -82);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#173018";
    ctx.beginPath();
    ctx.ellipse(-34, 0, 16, 22, -0.25, 0, Math.PI * 2);
    ctx.ellipse(38, 0, 16, 22, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnemyOverlay(enemy) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    if (enemy.id === "vine") {
      ctx.strokeStyle = "#9de06c";
      ctx.lineWidth = 5;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-112 + i * 68, 62);
        ctx.bezierCurveTo(-90 + i * 54, 16, -42 + i * 28, 4, -24 + i * 24, -70);
        ctx.stroke();
      }
    } else if (enemy.id === "mushroom") {
      ctx.fillStyle = "#77e8ff";
      ctx.shadowColor = "#77e8ff";
      ctx.shadowBlur = 16;
      for (const [x, y, scale] of [
        [-70, -100, 0.9],
        [0, -118, 1.15],
        [72, -98, 0.78],
      ]) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 18, Math.PI, 0);
        ctx.lineTo(18, 8);
        ctx.lineTo(-18, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-4, 4, 8, 18);
        ctx.restore();
      }
    } else if (enemy.id === "beetle") {
      ctx.strokeStyle = "#d5c49b";
      ctx.lineWidth = 7;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(0, -20 + i * 28, 96 - i * 10, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }
    } else if (enemy.id === "mist") {
      ctx.strokeStyle = "rgba(210, 206, 255, 0.56)";
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i += 1) {
        const y = -84 + i * 36 + Math.sin(performance.now() * 0.002 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(-132, y);
        ctx.bezierCurveTo(-58, y - 24, 48, y + 24, 132, y - 8);
        ctx.stroke();
      }
    } else if (enemy.id === "king") {
      ctx.fillStyle = "#f1d36b";
      ctx.shadowColor = "#f1d36b";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(-54, -138);
      ctx.lineTo(-28, -174);
      ctx.lineTo(-6, -136);
      ctx.lineTo(22, -176);
      ctx.lineTo(52, -138);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3b2d18";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSlimeFallback(hit) {
    ctx.fillStyle = "rgba(102, 224, 135, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 74, 118, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    const body = ctx.createRadialGradient(-32, -22, 20, 0, 0, 112);
    body.addColorStop(0, hit ? "#e3ffd5" : "#9cf2a9");
    body.addColorStop(0.55, "#4fc47f");
    body.addColorStop(1, "rgba(27, 102, 68, 0.84)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 92, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(203, 255, 210, 0.38)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#0f251e";
    ctx.beginPath();
    ctx.ellipse(-28, -16, 11, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(29, -16, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#16412d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 12, 26, 0.18, Math.PI - 0.18);
    ctx.stroke();
  }

  return {
    drawEnemyOverlay,
    drawEnemySilhouette,
    drawNoaFallback,
    drawSlimeFallback,
  };
}
