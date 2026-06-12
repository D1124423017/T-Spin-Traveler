import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_SLOT_ORDER,
  getEquipmentRarityStyle,
} from "../data/equipment.js";
import {
  getEquippedEquipment,
  getOwnedEquipmentForFilter,
} from "../core/equipmentProgress.js";
import { pointInRect } from "../render/drawUtils.js";
import {
  EQUIPMENT_INVENTORY_LAYOUT,
  getEquipmentFilterRects,
  getEquipmentInventoryRects,
  getEquipmentSlotRects,
} from "./equipmentLayout.js";
import {
  EQUIPMENT_RARITY_RUNES,
  clampEquipmentSelection,
  hexAlpha,
} from "./equipmentUiPrimitives.js";

export function createEquipmentInventoryScreenRenderer({
  ctx,
  state,
  t,
  fmt,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawImageContain,
  drawCard,
  drawMenuButton,
  equipmentIcons = {},
  noaPreviewArt,
  isImageReady,
  layout = EQUIPMENT_INVENTORY_LAYOUT,
  now = () => performance.now(),
} = {}) {
  function draw() {
    const equipment = state.metaProgress?.equipment || {};
    const filter = EQUIPMENT_FILTER_ORDER.includes(state.equipmentUi?.filter)
      ? state.equipmentUi.filter
      : "all";
    const owned = getOwnedEquipmentForFilter(equipment, filter);
    const selectedIndex = clampEquipmentSelection(
      state.equipmentUi?.selectedOwnedIndex,
      owned.length,
    );
    const selectedItem = owned[selectedIndex] || null;

    drawHeader();
    drawNoaPreview();
    drawEquippedSlots(equipment);
    drawFilters(filter);
    drawInventory(equipment, owned, selectedIndex);
    drawDetails(equipment, selectedItem);
    drawMessage();
  }

  function drawHeader() {
    label(t("equipmentInventoryTitle"), layout.title.x, layout.title.y + 35, 36, "#f7f0ff");
    label(t("equipmentInventorySubtitle"), layout.title.x, layout.title.y + 57, 13, "#cbb5ff");
    const back = layout.backButton;
    drawMenuButton(back.x, back.y, back.w, back.h, t("backToMenu"), "Esc");
  }

  function drawNoaPreview() {
    const rect = layout.heroStage;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    const aura = ctx.createRadialGradient(
      rect.x + rect.w * 0.5,
      rect.y + rect.h * 0.62,
      18,
      rect.x + rect.w * 0.5,
      rect.y + rect.h * 0.62,
      rect.w * 0.48,
    );
    aura.addColorStop(0, "rgba(137, 93, 255, 0.22)");
    aura.addColorStop(0.55, "rgba(83, 156, 255, 0.08)");
    aura.addColorStop(1, "rgba(4, 7, 17, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(rect.x + 8, rect.y + 44, rect.w - 16, rect.h - 58);

    ctx.save();
    if (isImageReady(noaPreviewArt)) {
      ctx.shadowColor = "rgba(155, 103, 255, 0.44)";
      ctx.shadowBlur = 22;
    }
    drawImageContain(
      noaPreviewArt,
      layout.heroImage.x,
      layout.heroImage.y,
      layout.heroImage.w,
      layout.heroImage.h,
    );
    ctx.restore();

    label(t("equipmentNoaPreview"), rect.x + 18, rect.y + 28, 12, "#9edff8");
    fitLabel(
      t("equipmentNoaPreviewHint"),
      rect.x + 18,
      rect.y + rect.h - 24,
      rect.w - 36,
      11,
      "rgba(233,238,255,0.66)",
      9,
      "700",
    );
  }

  function drawEquippedSlots(equipment) {
    const rect = layout.equipped;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    label(t("equipmentEquippedTitle"), rect.x + 16, rect.y + 27, 15, "#f1e9ff");
    const equipped = getEquippedEquipment(equipment);
    const slotRects = getEquipmentSlotRects(layout);
    for (const slot of EQUIPMENT_SLOT_ORDER) {
      drawEquipmentSlot(slotRects[slot], slot, equipped[slot]);
    }
  }

  function drawEquipmentSlot(rect, slot, item) {
    const style = getEquipmentRarityStyle(item?.rarity || "common");
    ctx.save();
    const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
    gradient.addColorStop(0, item ? hexAlpha(style.color, 0.18) : "rgba(7, 10, 19, 0.54)");
    gradient.addColorStop(1, "rgba(5, 8, 18, 0.3)");
    ctx.fillStyle = gradient;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 8, true, false);
    ctx.strokeStyle = item ? hexAlpha(style.color, 0.68) : "rgba(160, 180, 220, 0.2)";
    ctx.lineWidth = item ? 1.8 : 1.2;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 8, false, true);
    if (item) drawEquipmentIcon(item, rect.x + 8, rect.y + 22, 52, 52);
    const textX = item ? rect.x + 68 : rect.x + 12;
    label(t(`equipmentSlot.${slot}`), textX, rect.y + 19, 10, style.color);
    fitLabel(
      item ? t(item.nameKey) : t("equipmentEmptySlot"),
      textX,
      rect.y + 48,
      rect.w - (item ? 78 : 24),
      15,
      item ? "#f4f2ff" : "rgba(224,230,245,0.45)",
      9,
      "900",
      true,
    );
    if (item) {
      label(t("equipmentEquipped"), rect.x + rect.w - 72, rect.y + 19, 9, "#fff0a6");
      label(
        t(`equipmentRarity.${item.rarity}`),
        textX,
        rect.y + 68,
        9,
        style.color,
      );
    }
    ctx.restore();
  }

  function drawFilters(activeFilter) {
    label(t("equipmentFilterLabel"), layout.filters.x, layout.filters.y - 10, 10, "#9edff8");
    for (const rect of getEquipmentFilterRects(layout)) {
      const active = rect.filter === activeFilter;
      const hovered = pointIn(rect);
      ctx.save();
      ctx.fillStyle = active
        ? "rgba(122, 81, 220, 0.34)"
        : hovered
          ? "rgba(76, 113, 176, 0.2)"
          : "rgba(7, 10, 20, 0.44)";
      roundedRect(rect.x, rect.y, rect.w, rect.h, 7, true, false);
      ctx.strokeStyle = active
        ? "rgba(202, 164, 255, 0.86)"
        : "rgba(145, 178, 232, 0.24)";
      ctx.lineWidth = active ? 1.8 : 1;
      roundedRect(rect.x, rect.y, rect.w, rect.h, 7, false, true);
      fitLabel(
        t(`equipmentFilter.${rect.filter}`),
        rect.x + rect.w / 2,
        rect.y + 26,
        rect.w - 20,
        13,
        active ? "#fff5dc" : "rgba(235,240,252,0.76)",
        9,
        "900",
        true,
      );
      ctx.restore();
    }
    const roulette = layout.rouletteButton;
    drawMenuButton(
      roulette.x,
      roulette.y,
      roulette.w,
      roulette.h,
      t("equipmentGoToRoulette"),
      "R",
      "primary",
    );
  }

  function drawInventory(equipment, owned, selectedIndex) {
    const rect = layout.inventory;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    label(
      fmt("equipmentOwnedTitle", {
        count: equipment.ownedEquipment?.length || 0,
      }),
      rect.x + 16,
      rect.y + 28,
      15,
      "#f1e9ff",
    );
    if (!owned.length) {
      wrapText(
        t("equipmentFilterEmpty"),
        rect.x + 18,
        rect.y + 72,
        rect.w - 36,
        22,
        "rgba(231,238,255,0.58)",
        13,
      );
      return;
    }
    const equippedIds = new Set(Object.values(equipment.equipped || {}).filter(Boolean));
    const itemRects = getEquipmentInventoryRects(owned.length, layout);
    itemRects.forEach((itemRect, index) => {
      drawInventoryItem(
        itemRect,
        owned[index],
        equippedIds.has(owned[index].id),
        index === selectedIndex,
      );
    });
  }

  function drawInventoryItem(rect, item, equipped, selected) {
    const style = getEquipmentRarityStyle(item.rarity);
    const hovered = pointIn(rect);
    ctx.save();
    ctx.fillStyle = equipped
      ? hexAlpha(style.color, 0.2)
      : selected
        ? hexAlpha(style.color, 0.16)
        : hovered
          ? hexAlpha(style.color, 0.12)
          : "rgba(6, 9, 18, 0.52)";
    roundedRect(rect.x, rect.y, rect.w, rect.h, 6, true, false);
    ctx.strokeStyle = selected
      ? "#fff0a6"
      : hexAlpha(style.color, equipped ? 0.72 : hovered ? 0.5 : 0.28);
    ctx.lineWidth = equipped || selected ? 1.8 : 1;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 6, false, true);
    drawEquipmentIcon(item, rect.x + 5, rect.y + 5, 40, 40);
    fitLabel(
      t(item.nameKey),
      rect.x + 50,
      rect.y + 20,
      rect.w - 58,
      11,
      "#f3f0fb",
      8,
      "800",
      true,
    );
    label(
      equipped ? t("equipmentEquipped") : t(`equipmentSlot.${item.slot}`),
      rect.x + 50,
      rect.y + 39,
      8,
      equipped ? "#fff0a6" : hexAlpha(style.color, 0.84),
    );
    ctx.restore();
  }

  function drawDetails(equipment, item) {
    const rect = layout.details;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    label(t("equipmentSelectedTitle"), rect.x + 18, rect.y + 28, 12, "#9edff8");
    if (!item) {
      wrapText(
        t("equipmentSelectPrompt"),
        rect.x + 18,
        rect.y + 72,
        rect.w - 36,
        21,
        "rgba(231,238,255,0.56)",
        13,
      );
      return;
    }

    const style = getEquipmentRarityStyle(item.rarity);
    drawEquipmentIcon(item, rect.x + 18, rect.y + 48, 92, 92);
    fitLabel(
      t(item.nameKey),
      rect.x + 124,
      rect.y + 70,
      rect.w - 142,
      19,
      style.titleColor,
      12,
      "900",
      true,
    );
    label(t(`equipmentSlot.${item.slot}`), rect.x + 124, rect.y + 98, 11, "#d9ccff");
    label(t(`equipmentRarity.${item.rarity}`), rect.x + 124, rect.y + 121, 11, style.color);
    label(t("equipmentDescriptionLabel"), rect.x + 20, rect.y + 165, 10, "#9edff8");
    wrapText(
      t(item.descriptionKey),
      rect.x + 20,
      rect.y + 190,
      rect.w - 40,
      17,
      "rgba(230,235,250,0.7)",
      11,
    );
    label(t("equipmentEffectLabel"), rect.x + 20, rect.y + 240, 10, style.color);
    wrapText(
      t(item.effectKey),
      rect.x + 20,
      rect.y + 260,
      rect.w - 40,
      18,
      "rgba(249,244,255,0.9)",
      12,
    );

    const equipped = equipment.equipped?.[item.slot] === item.id;
    const button = layout.equipButton;
    drawMenuButton(
      button.x,
      button.y,
      button.w,
      button.h,
      equipped ? t("equipmentEquipped") : t("equipmentEquipAction"),
      equipped ? "" : "Enter / E",
      equipped ? "muted" : "primary",
    );
  }

  function drawMessage() {
    const message = state.equipmentUi?.message;
    if (message?.key && now() <= message.until) {
      fitLabel(
        fmt(message.key, message.vars || {}),
        layout.controlsHint.x,
        layout.controlsHint.y - 20,
        layout.controlsHint.w,
        11,
        "#f0dcff",
        9,
        "900",
        true,
      );
    }
    fitLabel(
      t("equipmentInventoryControlsHint"),
      layout.controlsHint.x,
      layout.controlsHint.y,
      layout.controlsHint.w,
      11,
      "rgba(225,232,255,0.68)",
      9,
      "800",
    );
  }

  function pointIn(rect) {
    return pointInRect(
      state.pointer.x,
      state.pointer.y,
      rect.x,
      rect.y,
      rect.w,
      rect.h,
    );
  }

  function drawEquipmentIcon(item, x, y, w, h) {
    const icon = equipmentIcons[item.iconAssetKey];
    if (isImageReady(icon)) {
      ctx.save();
      ctx.shadowColor = getEquipmentRarityStyle(item.rarity).color;
      ctx.shadowBlur = 8;
      drawImageContain(icon, x, y, w, h);
      ctx.restore();
      return;
    }
    label(
      EQUIPMENT_RARITY_RUNES[item.rarity],
      x + w * 0.34,
      y + h * 0.68,
      Math.max(16, w * 0.48),
      getEquipmentRarityStyle(item.rarity).color,
    );
  }

  return {
    draw,
  };
}
