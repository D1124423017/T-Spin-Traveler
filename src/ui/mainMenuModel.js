export const MAIN_MENU_ACTIONS = Object.freeze([
  Object.freeze({
    id: "start",
    labelKey: "startGame",
    descriptionKey: "endlessDescription",
    hintKey: "endless",
    enabled: true,
  }),
  Object.freeze({
    id: "mainStage",
    labelKey: "mainMenuStory",
    descriptionKey: "mainStageEgyptDescription",
    hintKey: "mainStageEgyptShort",
    enabled: true,
  }),
  Object.freeze({
    id: "equipment",
    labelKey: "mainMenuEquipment",
    descriptionKey: "mainMenuEquipmentDescription",
    enabled: true,
  }),
  Object.freeze({
    id: "metaUpgrade",
    labelKey: "upgradeMenu",
    descriptionKey: "metaUpgradeHelp",
    hintKey: "riftEnergy",
    enabled: true,
  }),
  Object.freeze({
    id: "guide",
    labelKey: "moveGuide",
    descriptionKey: "moveGuideSubtitle",
    enabled: true,
  }),
  Object.freeze({
    id: "settings",
    labelKey: "settings",
    descriptionKey: "menuSettingsDescription",
    enabled: true,
  }),
]);

export function getMainMenuActions() {
  return MAIN_MENU_ACTIONS;
}

export function normalizeMainMenuSelectedIndex(index, actionCount = MAIN_MENU_ACTIONS.length) {
  const count = Math.max(1, actionCount);
  const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  return ((safeIndex % count) + count) % count;
}

export function getSelectedMainMenuAction(index) {
  return MAIN_MENU_ACTIONS[normalizeMainMenuSelectedIndex(index)];
}
