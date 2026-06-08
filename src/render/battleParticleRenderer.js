export function createBattleParticleRenderer({
  ctx,
  state,
}) {
  function drawBursts() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const burst of state.bursts) {
      const t = 1 - burst.life / burst.duration;
      const alpha = Math.max(0, 1 - t);
      ctx.globalAlpha = alpha * 0.34;
      ctx.strokeStyle = burst.color;
      ctx.lineWidth = 2 + burst.intensity * 1.2;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.08;
      ctx.fillStyle = burst.color;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of state.particles) {
      if (particle.kind === "enemy-death") {
        ctx.save();
        ctx.globalAlpha = Math.min(0.9, particle.life / 260);
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation || 0);
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 1.6);
        ctx.lineTo(particle.size * 0.72, 0);
        ctx.lineTo(0, particle.size * 1.6);
        ctx.lineTo(-particle.size * 0.72, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.globalAlpha = Math.min(0.72, particle.life / 260);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  return {
    drawBursts,
    drawParticles,
  };
}
