export function createCombatAnimationStateController({
  state,
  heroAnimations,
  heroLevelUpEffect,
  enemyAttackAnimations,
  enemyAttackDurationMs,
  enemyHitDelayMs,
  bossWindupMs,
  bossPhaseBannerMs,
  enemyDeathDurationMs,
  heavyAttackWarningDamage,
  boardX,
  boardY,
  cols,
  tileSize,
  resolvePlayerAttackVfx,
  resolveEnemyAttackVfx,
  getAnimationDuration,
  getBossPhase,
  format,
  translate,
  playSfx,
  spawnEnemyDeathParticles,
  now = () => performance.now(),
}) {
  function getHeroAnimationDuration(kind, comboAttackStyle = "") {
    return resolvePlayerAttackVfx(kind, comboAttackStyle).totalDurationMs;
  }

  function getHeroHitDelay(kind, comboAttackStyle = "") {
    return resolvePlayerAttackVfx(kind, comboAttackStyle).hitDelayMs;
  }

  function getEnemyAnimationDuration(kind) {
    const vfx = resolveEnemyAttackVfx(kind);
    return vfx?.bodyDurationMs || enemyAttackDurationMs;
  }

  function getEnemyHitDelay() {
    return enemyHitDelayMs;
  }

  function startHeroAttackAnimation(kind, comboAttackStyle = "") {
    const vfx = resolvePlayerAttackVfx(kind, comboAttackStyle);
    const config = vfx.heroConfig || heroAnimations.slash;
    state.heroAnimation = {
      kind: vfx.heroKind,
      startedAt: now(),
      duration: getAnimationDuration(config),
    };
  }

  function startHeroLevelUpEffect() {
    state.heroLevelUpFx = {
      startedAt: now(),
      duration: getAnimationDuration(heroLevelUpEffect),
    };
  }

  function startEnemyAttackAnimation(kind, resolvedConfig = null) {
    const config = resolvedConfig || enemyAttackAnimations[kind];
    if (!config) return;
    state.enemyAnimation = {
      kind,
      config,
      startedAt: now(),
      duration: getAnimationDuration(config),
    };
  }

  function startEnemyAttackPresentation(enemy, bossPhase, enemyVfx) {
    if (enemy.id === "king") startBossWindup(bossPhase, enemyVfx?.shake);
    if (enemy.attackSprite === false && !enemyVfx) state.enemyAnimation = null;
    else startEnemyAttackAnimation(enemy.id, enemyVfx?.bodyConfig);
    const duration = enemyVfx?.totalDurationMs
      || (enemy.attackSprite === false ? 860 : getEnemyAnimationDuration(enemy.id));
    state.attacks.push({
      type: "enemy",
      attackKind: enemy.id,
      bossPhase,
      x0: 994,
      y0: 344,
      x1: 266,
      y1: 330,
      life: duration,
      duration,
    });
  }

  function getPlayerAttackSfx(result) {
    if (result.context?.perfect || result.spinType || result.attackStyle === "ultimate") {
      return "playerAttackArcane";
    }
    if (result.lines >= 3 || result.b2bHit || result.comboBurst) {
      return "playerAttackHeavy";
    }
    return "playerAttackLight";
  }

  function startPlayerAttackPresentation(result) {
    const vfx = resolvePlayerAttackVfx(result.attackStyle, result.comboAttackStyle);
    startHeroAttackAnimation(result.attackStyle, result.comboAttackStyle);
    playSfx(getPlayerAttackSfx(result));
    state.attacks.push({
      type: "player",
      x0: 244,
      y0: 358,
      x1: 994,
      y1: 346,
      life: vfx.totalDurationMs,
      duration: vfx.totalDurationMs,
      damage: result.damage,
      spin: result.isTSpin,
      heroStyle: result.attackStyle,
      comboStyle: result.comboAttackStyle,
      vfxStyle: vfx.style,
      special: result.special,
      lines: result.lines,
    });
  }

  function startBossWindup(phase = getBossPhase(), shake = 8 + phase * 2) {
    if (state.enemyType?.id !== "king") return;
    state.bossWindup = {
      phase,
      life: bossWindupMs,
      duration: bossWindupMs,
      startedAt: now(),
    };
    state.shake = Math.max(state.shake, shake);
  }

  function triggerBossPhaseSignal(phase) {
    state.lastBossPhase = phase;
    state.bossPhaseBanner = {
      phase,
      life: bossPhaseBannerMs,
      duration: bossPhaseBannerMs,
    };
    state.floaters.push({
      x: boardX + cols * tileSize + 36,
      y: boardY + 96,
      text: format("bossPhaseShift", { phase }),
      color: "#fff0a6",
      life: bossPhaseBannerMs,
    });
    startBossWindup(phase);
    playSfx("enemyWarnStrong");
  }

  function startEnemyDeathTransition(enemy, revealNext) {
    if (!enemy) return;
    state.enemyDeathVfx = {
      enemy,
      revealNext,
      startedAt: now(),
      duration: enemyDeathDurationMs,
    };
    state.enemyAnimation = null;
    spawnEnemyDeathParticles(enemy);
  }

  function triggerHeavyAttackWarning() {
    if (state.enemyCountdown > 1 || state.enemyAttackDamage < heavyAttackWarningDamage) return;
    state.floaters.push({
      x: boardX + cols * tileSize + 214,
      y: boardY + 278,
      text: translate("heavyAttackIncoming"),
      color: "#ff8ca0",
      life: 1250,
    });
    state.bursts.push({
      x: boardX + cols * tileSize + 232,
      y: boardY + 326,
      radius: 18,
      color: "#ff6f9f",
      life: 420,
      duration: 420,
      intensity: 1.1,
    });
  }

  return {
    getEnemyAnimationDuration,
    getEnemyHitDelay,
    getHeroAnimationDuration,
    getHeroHitDelay,
    startBossWindup,
    startEnemyAttackAnimation,
    startEnemyAttackPresentation,
    startEnemyDeathTransition,
    startHeroAttackAnimation,
    startHeroLevelUpEffect,
    startPlayerAttackPresentation,
    triggerHeavyAttackWarning,
    triggerBossPhaseSignal,
  };
}
