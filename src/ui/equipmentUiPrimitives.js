export const EQUIPMENT_RARITY_RUNES = Object.freeze({
  common: "◇",
  rare: "◆",
  relic: "✦",
  legendary: "✧",
});

export function hexAlpha(hex, alpha) {
  const value = String(hex || "#ffffff").replace("#", "");
  const full = value.length === 3
    ? value.split("").map((char) => char + char).join("")
    : value.padEnd(6, "f").slice(0, 6);
  const number = Number.parseInt(full, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

export function clampEquipmentSelection(index, count) {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(Number(index) || 0)));
}
