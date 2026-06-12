import { EQUIPMENT_SCREEN_VIEWS } from "../data/equipment.js";
import { OVERLAY_READABILITY } from "../render/drawUtils.js";
import { createEquipmentInventoryScreenRenderer } from "./equipmentInventoryScreen.js";
import { createEquipmentRouletteScreenRenderer } from "./equipmentRouletteScreen.js";

export function createEquipmentScreenRenderer({
  drawMainMenuScene,
  drawDimOverlay,
  ...bindings
} = {}) {
  const inventoryRenderer = createEquipmentInventoryScreenRenderer(bindings);
  const rouletteRenderer = createEquipmentRouletteScreenRenderer(bindings);

  function drawEquipmentScreen() {
    bindings.ctx.save();
    drawMainMenuScene();
    drawDimOverlay(OVERLAY_READABILITY.scrim.standard);
    if (bindings.state.equipmentUi?.view === EQUIPMENT_SCREEN_VIEWS.roulette) {
      rouletteRenderer.draw();
    } else {
      inventoryRenderer.draw();
    }
    bindings.ctx.restore();
  }

  return {
    drawEquipmentScreen,
  };
}
