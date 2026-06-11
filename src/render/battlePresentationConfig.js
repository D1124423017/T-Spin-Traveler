export const ROSTER_CELLS = {
  noa: [0, 0],
  slime: [1, 0],
  vine: [2, 0],
  mushroom: [3, 0],
  beetle: [0, 1],
  mist: [1, 1],
  thorn: [2, 0],
  wisp: [1, 1],
  stalker: [2, 1],
  sentinel: [3, 1],
  king: [3, 1],
};

export function createBattlePresentationConfig({
  boardX,
  boardY,
  cols,
  rows,
  tile,
  uiLayout,
}) {
  const stageBaselineOffsets = {
    player: { centerX: -6, groundY: 384 },
    enemy: { centerX: 12, groundY: 352 },
  };

  return {
    feedbackPositions: Object.freeze({
      combo: { x: boardX - 92, y: boardY + 196 },
      b2b: { x: boardX - 92, y: boardY + 250 },
      tspin: { x: boardX - 92, y: boardY + 304 },
      perfect: { x: boardX + (cols * tile) / 2, y: boardY + rows * tile * 0.42 },
      damage: { x: uiLayout.enemyStage.x + 34, y: uiLayout.enemyStage.y + 126 },
    }),
    characterBaselines: {
      player: {
        groundY: uiLayout.playerStage.y + stageBaselineOffsets.player.groundY,
        centerOffsetX: stageBaselineOffsets.player.centerX,
        localY: 120,
        scale: 0.88,
        glowRadius: 150,
        sigilRadius: 116,
        sigilYOffset: -2,
        shadowW: 112,
        animationScale: 1,
        animationBottomOffset: 18,
      },
      enemy: {
        groundY: uiLayout.enemyStage.y + stageBaselineOffsets.enemy.groundY,
        centerOffsetX: stageBaselineOffsets.enemy.centerX,
        localY: 104,
        scale: 1,
        glowRadius: 176,
        sigilRadius: 144,
        sigilYOffset: -2,
        shadowW: 134,
      },
    },
  };
}
