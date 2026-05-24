export function hasUpgrade(upgrades, key) {
  return Boolean(upgrades && upgrades[key] > 0);
}
