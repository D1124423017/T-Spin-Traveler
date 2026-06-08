export function createBattleParticleSpawner({
  state,
  boardX,
  boardY,
  cols,
  rows,
  hiddenRows,
  tileSize,
  uiLayout,
  enemyBaseline,
  enemyDeathParticleCount,
  getUltimateWellRange,
  isUltimateWellColumn,
  random = Math.random,
} = {}) {
  function spawnLineParticles(lines) {
    for (const line of lines) {
      const py = boardY + (line - hiddenRows) * tileSize + tileSize / 2;
      if (py < boardY) continue;
      const well = getUltimateWellRange();
      const colStart = state.ultimateActive ? well.start : 0;
      const colEnd = state.ultimateActive ? well.end : cols;
      for (let x = colStart; x < colEnd; x += 1) {
        state.particles.push({
          x: boardX + x * tileSize + tileSize / 2,
          y: py,
          vx: (random() - 0.5) * 2.8,
          vy: -1.1 - random() * 2.2,
          size: 1.6 + random() * 2.4,
          color: random() > 0.45 ? "#c8d2ff" : "#78e0cc",
          life: 320 + random() * 180,
        });
      }
    }
  }

  function spawnClearBurst(lines, combo) {
    const intensity = Math.min(1.35, 0.42 + lines * 0.16 + combo * 0.035);
    const well = getUltimateWellRange();
    const centerX = state.ultimateActive
      ? boardX + (well.start + well.width / 2) * tileSize
      : boardX + (cols * tileSize) / 2;
    state.bursts.push({
      x: centerX,
      y: boardY + rows * tileSize - 122,
      radius: 22,
      color: lines >= 4 ? "#fff0a6" : combo >= 3 ? "#7ef7ff" : "#b9c2ff",
      life: 220 + lines * 42,
      duration: 220 + lines * 42,
      intensity,
    });
    const extra = Math.floor(4 * intensity);
    for (let i = 0; i < extra; i += 1) {
      const angle = random() * Math.PI * 2;
      const speed = 1.6 + random() * 3.2 * intensity;
      state.particles.push({
        x: centerX + (random() - 0.5) * (state.ultimateActive ? 84 : 150),
        y: boardY + rows * tileSize - 112 + (random() - 0.5) * 48,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        size: 1.8 + random() * 3,
        color: lines >= 4 ? "#fff0a6" : random() > 0.5 ? "#7ef7ff" : "#c7a7ff",
        life: 340 + random() * 190,
      });
    }
  }

  function spawnEnemyDeathParticles(enemy) {
    const centerX = uiLayout.enemyStage.x
      + uiLayout.enemyStage.w / 2
      + enemyBaseline.centerOffsetX;
    const centerY = enemyBaseline.groundY - 150 * enemyBaseline.scale;
    const colors = [
      "#a972ff",
      "#68dcff",
      "#5f7cff",
      "#fff0a6",
      enemy.color || "#c7a7ff",
    ];

    for (let index = 0; index < enemyDeathParticleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / enemyDeathParticleCount
        + (random() - 0.5) * 0.34;
      const speed = 1.8 + random() * 3.8;
      state.particles.push({
        kind: "enemy-death",
        x: centerX + (random() - 0.5) * 70,
        y: centerY + (random() - 0.5) * 90,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.018,
        size: 2.4 + random() * 4.8,
        rotation: random() * Math.PI,
        spin: (random() - 0.5) * 0.18,
        color: colors[index % colors.length],
        life: 760 + random() * 300,
      });
    }
  }

  function spawnGarbageParticles(hole) {
    const y = boardY + rows * tileSize - tileSize / 2;
    for (let x = 0; x < cols; x += 1) {
      if (state.ultimateActive && !isUltimateWellColumn(x)) continue;
      if (x === hole) continue;
      state.particles.push({
        x: boardX + x * tileSize + tileSize / 2,
        y,
        vx: (random() - 0.5) * 2.2,
        vy: -2.4 - random() * 2,
        size: 2 + random() * 3,
        color: "#aeb7bc",
        life: 480 + random() * 180,
      });
    }
  }

  return {
    spawnClearBurst,
    spawnEnemyDeathParticles,
    spawnGarbageParticles,
    spawnLineParticles,
  };
}
