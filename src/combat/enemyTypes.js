export function isBossEnemy(enemy) {
  return Boolean(enemy?.id === "king" || enemy?.boss || enemy?.type === "boss" || enemy?.rank === "boss" || enemy?.kind === "boss");
}

export function isMiniBossEnemy(enemy, context = {}) {
  return Boolean(
    context.miniBoss
    || enemy?.miniBoss
    || enemy?.miniboss
    || enemy?.type === "miniBoss"
    || enemy?.type === "miniboss"
    || enemy?.rank === "miniBoss"
    || enemy?.rank === "miniboss"
    || enemy?.kind === "miniBoss"
    || enemy?.kind === "miniboss"
    || (Array.isArray(enemy?.tags) && (enemy.tags.includes("miniBoss") || enemy.tags.includes("miniboss")))
  );
}

export function isBossLikeEnemy(enemy, context = {}) {
  return isBossEnemy(enemy) || isMiniBossEnemy(enemy, context);
}
