export const TUNING_SLIDERS = {
  das: { min: 60, max: 240, unit: "ms" },
  arr: { min: 0, max: 80, unit: "ms" },
  softDrop: { min: 1, max: 32, unit: "ms" },
  lockDelay: { min: 200, max: 900, unit: "ms" },
};

export const DEFAULT_CONTROLS = {
  left: ["arrowleft"],
  right: ["arrowright"],
  softDrop: ["arrowdown"],
  hardDrop: [" "],
  rotateCW: ["arrowup", "x"],
  rotateCCW: ["z"],
  rotate180: ["a"],
  hold: ["shift", "c"],
  pause: ["p", "escape"],
  mute: ["m"],
};

export const SETTINGS_TABS = ["controls", "handling", "audio", "language", "feedback"];

export const CONTROL_ACTIONS = [
  { id: "left", labelKey: "control.left" },
  { id: "right", labelKey: "control.right" },
  { id: "softDrop", labelKey: "control.softDrop" },
  { id: "hardDrop", labelKey: "control.hardDrop" },
  { id: "rotateCW", labelKey: "control.rotateCW" },
  { id: "rotateCCW", labelKey: "control.rotateCCW" },
  { id: "rotate180", labelKey: "control.rotate180" },
  { id: "hold", labelKey: "control.hold" },
  { id: "pause", labelKey: "control.pause" },
  { id: "mute", labelKey: "control.mute" },
];
