import { getEquippedEquipment } from "../core/equipmentProgress.js";
import {
  getEquipmentLoadoutStats,
  normalizeEquipmentStatBonus,
} from "../core/equipmentStats.js";

export function buildEquipmentDetailsModel(metaProgress = {}, selectedItem = null) {
  const equipment = metaProgress?.equipment || {};
  const equipped = getEquippedEquipment(equipment);
  return {
    stats: getEquipmentLoadoutStats(metaProgress),
    equipped,
    selected: selectedItem
      ? {
        item: selectedItem,
        stats: normalizeEquipmentStatBonus(selectedItem.stats),
        equipped: equipment.equipped?.[selectedItem.slot] === selectedItem.id,
      }
      : null,
  };
}
