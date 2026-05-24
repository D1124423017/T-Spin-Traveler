export function sfxVolume(master, sfx, mix = 1) {
  return Math.max(0, master) * Math.max(0, sfx) * Math.max(0, mix);
}
