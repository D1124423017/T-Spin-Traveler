import { pointInRect } from "../render/drawUtils.js";

export function createMetaScreenPointerRouter({
  state,
  metaUpgradeDefs,
  getMetaUpgradeBackButtonRect,
  getMetaAscensionEntryRect,
  getMetaUpgradeRowRects,
  getAscensionResultButtonRects,
  actions,
} = {}) {
  const {
    playSfx,
    purchaseMetaUpgrade,
    returnToMetaUpgradeFromAscension,
    setGameMode,
    startAscensionChallenge,
  } = actions;

  function handleMetaUpgradePointerDown(x, y) {
    const back = getMetaUpgradeBackButtonRect();
    if (pointInRect(x, y, back.x, back.y, back.w, back.h)) {
      setGameMode("start");
      state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
      playSfx("hold");
      return true;
    }
    const ascension = getMetaAscensionEntryRect();
    if (pointInRect(x, y, ascension.x, ascension.y, ascension.w, ascension.h)) {
      startAscensionChallenge();
      return true;
    }
    const rows = getMetaUpgradeRowRects();
    for (const def of Object.values(metaUpgradeDefs)) {
      const rect = rows[def.id];
      if (pointInRect(x, y, rect.buyX, rect.buyY, rect.buyW, rect.buyH)) {
        purchaseMetaUpgrade(def.id);
        return true;
      }
    }
    return false;
  }

  function handleAscensionResultPointerDown(x, y) {
    const buttons = getAscensionResultButtonRects();
    const primary = state.ascensionRun?.status === "success"
      ? buttons.single
      : buttons.primary;
    if (pointInRect(x, y, primary.x, primary.y, primary.w, primary.h)) {
      returnToMetaUpgradeFromAscension();
      return true;
    }
    if (
      state.ascensionRun?.status === "failed"
      && pointInRect(
        x,
        y,
        buttons.secondary.x,
        buttons.secondary.y,
        buttons.secondary.w,
        buttons.secondary.h,
      )
    ) {
      startAscensionChallenge();
      return true;
    }
    return false;
  }

  return {
    handleAscensionResultPointerDown,
    handleMetaUpgradePointerDown,
  };
}
