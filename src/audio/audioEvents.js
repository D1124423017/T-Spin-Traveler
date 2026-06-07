export const temporaryGlobalBgmRotation = Object.freeze([
  "bgmMenu01",
  "bgmMenu02",
  "bgmMenu03",
  "bgmMenu04",
  "bgmMenu05",
  "bgmMenu06",
]);

export const LEGACY_BGM_PLAYLISTS = Object.freeze({
  menu: Object.freeze(["menuAncientRift"]),
  early: Object.freeze(["battleForestRuins"]),
  mid: Object.freeze(["battleDeepRuins"]),
  late: Object.freeze(["battleRiftPressure"]),
  boss: Object.freeze(["bossAncientRiftColossus"]),
  upgrade: Object.freeze(["upgradeRelicCards"]),
});

export const BGM_PLAYLISTS = Object.freeze({
  menu: temporaryGlobalBgmRotation,
  early: temporaryGlobalBgmRotation,
  mid: temporaryGlobalBgmRotation,
  late: temporaryGlobalBgmRotation,
  boss: temporaryGlobalBgmRotation,
  upgrade: temporaryGlobalBgmRotation,
});

export function pickNextBgmAssetKey(playlist, currentKey = "") {
  if (!playlist?.length) return "";
  const currentIndex = playlist.indexOf(currentKey);
  return playlist[(currentIndex + 1) % playlist.length];
}

export const FILE_SFX_EVENTS = Object.freeze({
  start: Object.freeze(["sfxGameStart01"]),
  loadingComplete: Object.freeze(["sfxLoadingComplete01"]),
  move: Object.freeze(["sfxBlockMove01", "sfxBlockMove02", "sfxBlockMove03"]),
  softDrop: Object.freeze(["sfxSoftDrop01"]),
  rotate: Object.freeze(["sfxBlockRotate01", "sfxBlockRotate02"]),
  rotateT: Object.freeze(["sfxTPieceRotateSpecial01"]),
  spinReady: Object.freeze(["sfxSpinReady01", "sfxSpinReady02"]),
  drop: Object.freeze(["sfxHardDrop01"]),
  lock: Object.freeze(["sfxBlockLock01"]),
  hold: Object.freeze(["sfxHold01"]),
  holdUnavailable: Object.freeze(["sfxHoldUnavailable01"]),
  invalidMove: Object.freeze(["sfxInvalidMove01"]),
  invalidRotate: Object.freeze(["sfxInvalidRotate01"]),
  clear: Object.freeze(["sfxLineClear1"]),
  doubleClear: Object.freeze(["sfxLineClear2"]),
  tripleClear: Object.freeze(["sfxLineClear3"]),
  bigClear: Object.freeze(["sfxLineClear4Tetris"]),
  combo: Object.freeze(["sfxCombo1", "sfxCombo2", "sfxCombo3Plus"]),
  b2b: Object.freeze(["sfxBackToBack"]),
  tspin: Object.freeze(["sfxTspinSuccess"]),
  spin: Object.freeze(["sfxSpinSuccess"]),
  perfect: Object.freeze(["sfxPerfectClear"]),
  playerAttackLight: Object.freeze(["sfxPlayerAttackLight01"]),
  playerAttackHeavy: Object.freeze(["sfxPlayerAttackHeavy01"]),
  playerAttackArcane: Object.freeze(["sfxPlayerAttackArcane01"]),
  hitLight: Object.freeze(["sfxEnemyHurtLight01"]),
  hitHeavy: Object.freeze(["sfxEnemyHurtHeavy01"]),
  hitArcane: Object.freeze(["sfxPlayerAttackArcane01", "sfxEnemyHurtHeavy01"]),
  weakness: Object.freeze(["sfxEnemyHurtHeavy01"]),
  enemyWarn: Object.freeze(["sfxEnemyAttackWarn01"]),
  enemyWarnStrong: Object.freeze(["sfxBossEnter01", "sfxEnemyAttackWarn01"]),
  enemy: Object.freeze(["sfxEnemyAttackHit01", "sfxPlayerHurt01"]),
  shield: Object.freeze(["sfxShieldBlock01"]),
  shieldBreak: Object.freeze(["sfxShieldBreak01"]),
  cancel: Object.freeze(["sfxUiCancel01"]),
  wave: Object.freeze(["sfxWaveStart01"]),
  waveVictory: Object.freeze(["sfxWaveVictory01"]),
  victory: Object.freeze(["jingleVictoryRelicCleansed"]),
  bossEnter: Object.freeze(["sfxBossEnter01"]),
  bossDefeated: Object.freeze(["sfxBossDefeated01"]),
  upgradeReady: Object.freeze(["sfxUpgradeHover01"]),
  upgradeReveal: Object.freeze(["sfxUpgradeReveal01"]),
  upgrade: Object.freeze(["sfxUpgradeConfirm01"]),
  upgradeConfirm: Object.freeze(["sfxUpgradeConfirm01"]),
  metaUpgradeSuccess: Object.freeze(["sfxMetaUpgradePurchaseSuccess01"]),
  metaUpgradeFail: Object.freeze(["sfxMetaUpgradePurchaseFail01"]),
  riftEnergyTick: Object.freeze(["sfxRiftEnergyTick01"]),
  riftEnergyComplete: Object.freeze(["jingleRiftEnergySettlement"]),
  riftEnergyCompleteShort: Object.freeze(["sfxRiftEnergyComplete01"]),
  uiHover: Object.freeze(["sfxUiHover01"]),
  uiConfirm: Object.freeze(["sfxUiConfirm01"]),
  uiCancel: Object.freeze(["sfxUiCancel01"]),
  defeat: Object.freeze(["jingleDefeatRiftCollapse"]),
  gameOver: Object.freeze(["sfxGameOver01"]),
});

export const FILE_SFX_MIX = Object.freeze({
  move: 0.38,
  softDrop: 0.28,
  rotate: 0.46,
  rotateT: 0.58,
  spinReady: 0.46,
  drop: 0.78,
  lock: 0.48,
  hold: 0.5,
  holdUnavailable: 0.48,
  invalidMove: 0.4,
  invalidRotate: 0.42,
  clear: 0.72,
  doubleClear: 0.8,
  tripleClear: 0.86,
  bigClear: 0.98,
  combo: 0.82,
  b2b: 0.96,
  tspin: 1.04,
  spin: 0.78,
  perfect: 1.08,
  playerAttackLight: 0.58,
  playerAttackHeavy: 0.78,
  playerAttackArcane: 0.86,
  hitLight: 0.56,
  hitHeavy: 0.82,
  hitArcane: 0.94,
  weakness: 0.74,
  enemyWarn: 0.56,
  enemyWarnStrong: 0.72,
  enemy: 0.8,
  shield: 0.72,
  shieldBreak: 0.8,
  wave: 0.74,
  waveVictory: 0.82,
  victory: 0.9,
  bossEnter: 0.82,
  bossDefeated: 0.88,
  upgradeReady: 0.5,
  upgradeReveal: 0.78,
  upgrade: 0.78,
  upgradeConfirm: 0.8,
  metaUpgradeSuccess: 0.82,
  metaUpgradeFail: 0.54,
  riftEnergyTick: 0.38,
  riftEnergyComplete: 0.88,
  riftEnergyCompleteShort: 0.7,
  uiHover: 0.24,
  uiConfirm: 0.44,
  uiCancel: 0.42,
  loadingComplete: 0.48,
  start: 0.72,
  defeat: 0.88,
  gameOver: 0.78,
});

export const SPIN_READY_COOLDOWN_MS = 650;

export function getFileSfxAssetKeys(name, eventMap = FILE_SFX_EVENTS) {
  return eventMap[name] || Object.freeze([]);
}

export function pickFileSfxAssetKey(name, rotationState, eventMap = FILE_SFX_EVENTS) {
  const keys = getFileSfxAssetKeys(name, eventMap);
  if (!keys.length) return "";
  const index = rotationState.get(name) || 0;
  rotationState.set(name, index + 1);
  return keys[index % keys.length];
}
