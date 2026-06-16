import {
  EQUIPMENT_SCREEN_VIEWS,
  getEquipmentDrawCost,
  getEquipmentWheelLevel,
  getEquipmentWheelUpgradeCost,
} from "../data/equipment.js";
import {
  drawEquipment,
  equipOwnedItem,
  unequipOwnedItem,
  upgradeEquipmentWheel,
} from "./equipmentProgress.js";

export function createEquipmentController({
  state,
  loadMetaProgress,
  saveMetaProgress,
  spendRiftEnergy,
  setGameMode,
  translate,
  format,
  prefersReducedMotion,
  createSpinMotion,
  createUpgradeMotion,
  getMotionState,
  showToast,
  playSfx,
  now = () => performance.now(),
  random = Math.random,
} = {}) {
  function isMotionActive() {
    return getMotionState(state.equipmentUi.motion, now()).active;
  }

  function setMessage(key, vars = {}, durationMs = 2000) {
    state.equipmentUi.message = {
      key,
      vars,
      until: now() + durationMs,
    };
  }

  function openEquipmentScreen() {
    state.metaProgress = loadMetaProgress();
    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.inventory;
    state.equipmentUi.filter = "all";
    state.equipmentUi.motion = null;
    state.equipmentUi.message = { key: "", vars: {}, until: 0 };
    state.equipmentUi.selectedOwnedIndex = 0;
    setGameMode("equipment");
    playSfx("uiConfirm");
  }

  function openEquipmentRoulette() {
    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.roulette;
    state.equipmentUi.motion = null;
    state.equipmentUi.message = { key: "", vars: {}, until: 0 };
    playSfx("uiConfirm");
  }

  function returnToEquipmentInventory() {
    state.equipmentUi.view = EQUIPMENT_SCREEN_VIEWS.inventory;
    state.equipmentUi.motion = null;
    state.equipmentUi.message = { key: "", vars: {}, until: 0 };
    playSfx("uiCancel");
  }

  function drawEquipmentRoulette() {
    if (state.equipmentUi.view !== EQUIPMENT_SCREEN_VIEWS.roulette) return false;
    if (isMotionActive()) return false;
    const before = loadMetaProgress();
    const cost = getEquipmentDrawCost(before.equipment);
    const payment = spendRiftEnergy(before, cost);
    if (!payment.ok) {
      state.metaProgress = payment.progress;
      setMessage("equipmentDrawNotEnough", { cost }, 1800);
      playSfx("metaUpgradeFail");
      return false;
    }
    const result = drawEquipment(payment.progress.equipment, random);
    payment.progress.equipment = result.progress;
    state.metaProgress = payment.progress;
    saveMetaProgress(state.metaProgress);
    state.equipmentUi.filter = "all";
    state.equipmentUi.selectedOwnedIndex = result.progress.ownedEquipment.indexOf(result.item.id);
    state.equipmentUi.motion = createSpinMotion({
      now: now(),
      wheelLevel: result.progress.wheelLevel,
      rarity: result.rarity,
      itemId: result.item.id,
      duplicate: result.duplicate,
      reducedMotion: prefersReducedMotion(),
      random,
    });
    const messageKey = result.duplicate ? "equipmentDrawDuplicate" : "equipmentDrawResult";
    const vars = { name: translate(result.item.nameKey) };
    setMessage(messageKey, vars, 2600);
    showToast({
      type: "equipment-draw",
      text: format(messageKey, vars),
      tone: "rift",
      durationMs: 2200,
    });
    playSfx(result.rarity === "legendary" ? "upgrade" : "uiConfirm");
    return true;
  }

  function upgradeEquipmentRoulette() {
    if (state.equipmentUi.view !== EQUIPMENT_SCREEN_VIEWS.roulette) return false;
    if (isMotionActive()) return false;
    const before = loadMetaProgress();
    const cost = getEquipmentWheelUpgradeCost(before.equipment?.wheelLevel);
    const upgrade = upgradeEquipmentWheel(before.equipment);
    if (!upgrade.ok) {
      setMessage("equipmentWheelMaxed", {}, 1800);
      playSfx("metaUpgradeFail");
      return false;
    }
    const payment = spendRiftEnergy(before, cost);
    if (!payment.ok) {
      state.metaProgress = payment.progress;
      setMessage("equipmentWheelUpgradeNotEnough", { cost }, 1800);
      playSfx("metaUpgradeFail");
      return false;
    }
    payment.progress.equipment = upgrade.progress;
    state.metaProgress = payment.progress;
    saveMetaProgress(state.metaProgress);
    state.equipmentUi.motion = createUpgradeMotion({
      now: now(),
      wheelLevel: upgrade.level,
      reducedMotion: prefersReducedMotion(),
    });
    const wheel = getEquipmentWheelLevel(upgrade.level);
    const vars = { name: translate(wheel.nameKey) };
    setMessage("equipmentWheelUpgradeSuccess", vars, 2600);
    showToast({
      type: "equipment-wheel-upgrade",
      text: format("equipmentWheelUpgradeSuccess", vars),
      tone: "rift",
      durationMs: 2400,
    });
    playSfx("metaUpgradeSuccess");
    return true;
  }

  function equipEquipmentItem(itemId) {
    if (state.equipmentUi.view !== EQUIPMENT_SCREEN_VIEWS.inventory) return false;
    const nextProgress = loadMetaProgress();
    const equipped = Object.values(nextProgress.equipment?.equipped || {}).includes(itemId);
    const result = equipped
      ? unequipOwnedItem(nextProgress.equipment, itemId)
      : equipOwnedItem(nextProgress.equipment, itemId);
    if (!result.ok) return false;
    nextProgress.equipment = result.progress;
    state.metaProgress = nextProgress;
    saveMetaProgress(state.metaProgress);
    setMessage(
      equipped ? "equipmentItemUnequipped" : "equipmentItemEquipped",
      { name: translate(result.item.nameKey) },
      1800,
    );
    playSfx("hold");
    return true;
  }

  return {
    drawEquipmentRoulette,
    equipEquipmentItem,
    openEquipmentScreen,
    openEquipmentRoulette,
    returnToEquipmentInventory,
    upgradeEquipmentRoulette,
  };
}
