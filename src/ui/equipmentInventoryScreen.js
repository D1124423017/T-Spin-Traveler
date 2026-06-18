import {
  EQUIPMENT_FILTER_ORDER,
  EQUIPMENT_ITEMS,
  EQUIPMENT_SLOT_ORDER,
  getEquipmentRarityStyle,
} from "../data/equipment.js";
import {
  getOwnedEquipmentForFilter,
} from "../core/equipmentProgress.js";
import { pointInRect } from "../render/drawUtils.js";
import {
  EQUIPMENT_INVENTORY_LAYOUT,
  getEquipmentInventoryPage,
  getEquipmentFilterRects,
  getEquipmentInventoryRects,
  getEquipmentPaginationRects,
  getEquipmentSlotRects,
} from "./equipmentLayout.js";
import {
  EQUIPMENT_RARITY_RUNES,
  clampEquipmentSelection,
  hexAlpha,
} from "./equipmentUiPrimitives.js";
import { buildEquipmentDetailsModel } from "./equipmentDetailsModel.js";
import { createEquipmentHeroPreviewRenderer } from "./equipmentHeroPreview.js";

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
  noaIdleSheet,
  noaIdleAnimations = [],
  isImageReady,
  layout = EQUIPMENT_INVENTORY_LAYOUT,
  now = () => performance.now(),
} = {}) {
  const heroPreviewRenderer = createEquipmentHeroPreviewRenderer({
    ctx,
    idleSheet: noaIdleSheet,
    idleAnimations: noaIdleAnimations,
    fallbackArt: noaPreviewArt,
    isImageReady,
    drawImageContain,
    now,
  });

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
    const inventoryPage = getEquipmentInventoryPage(selectedIndex, owned.length);
    const detailsModel = buildEquipmentDetailsModel(state.metaProgress, selectedItem);

    drawHeader();
    drawNoaPreview(detailsModel.stats);
    drawEquippedSlots(detailsModel.equipped);
    drawFilters(filter);
    drawInventory(equipment, owned, selectedIndex, inventoryPage);
    drawDetails(detailsModel.selected);
    drawMessage();
  }

  function drawHeader() {
    label(t("equipmentInventoryTitle"), layout.title.x, layout.title.y + 34, 34, "#f7f0ff");
    label(t("equipmentInventorySubtitle"), layout.title.x, layout.title.y + 57, 13, "#cbb5ff");
    ctx.save();
    const line = ctx.createLinearGradient(
      layout.title.x,
      layout.title.y + 68,
      layout.title.x + 560,
      layout.title.y + 68,
    );
    line.addColorStop(0, "rgba(205, 170, 255, 0.8)");
    line.addColorStop(0.48, "rgba(97, 176, 255, 0.34)");
    line.addColorStop(1, "rgba(97, 176, 255, 0)");
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(layout.title.x, layout.title.y + 68);
    ctx.lineTo(layout.title.x + 560, layout.title.y + 68);
    ctx.stroke();
    ctx.restore();
    const back = layout.backButton;
    drawMenuButton(back.x, back.y, back.w, back.h, t("backToMenu"), "Esc");
  }

  function drawNoaPreview(stats) {
    const rect = layout.heroStage;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    ctx.save();
    const stageGradient = ctx.createLinearGradient(
      rect.x,
      rect.y,
      rect.x,
      rect.y + rect.h,
    );
    stageGradient.addColorStop(0, "rgba(11, 15, 31, 0.3)");
    stageGradient.addColorStop(0.62, "rgba(11, 8, 28, 0.08)");
    stageGradient.addColorStop(1, "rgba(3, 6, 15, 0.7)");
    ctx.fillStyle = stageGradient;
    roundedRect(rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14, 14, true, false);
    ctx.strokeStyle = "rgba(201, 161, 255, 0.22)";
    ctx.lineWidth = 1;
    roundedRect(rect.x + 12, rect.y + 12, rect.w - 24, rect.h - 24, 12, false, true);
    ctx.restore();

    drawSectionHeading(
      t("equipmentNoaPreview"),
      rect.x + 18,
      rect.y + 28,
      rect.w - 36,
      "#9edff8",
    );
    heroPreviewRenderer.draw({
      stageRect: layout.heroVisual,
      imageRect: layout.heroImage,
    });
    drawCurrentStats(stats);
  }

  function drawCurrentStats(stats) {
    const rect = layout.currentStats;
    ctx.save();
    const panelGradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    panelGradient.addColorStop(0, "rgba(11, 13, 30, 0.94)");
    panelGradient.addColorStop(1, "rgba(3, 7, 18, 0.9)");
    ctx.fillStyle = panelGradient;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 12, true, false);
    ctx.strokeStyle = "rgba(157, 113, 255, 0.44)";
    ctx.lineWidth = 1.3;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 12, false, true);
    label(t("equipmentCurrentStats"), rect.x + 14, rect.y + 22, 12, "#f1e9ff");
    drawStatCard(
      t("equipmentStatMaxHp"),
      stats.baseStats.maxHp,
      stats.equipmentBonuses.maxHpBonus,
      stats.finalStats.maxHp,
      rect.x + 12,
      rect.y + 34,
      96,
      "#ff9ba5",
    );
    drawStatCard(
      t("equipmentStatAttack"),
      stats.baseStats.attack,
      stats.equipmentBonuses.attackBonus,
      stats.finalStats.attack,
      rect.x + 116,
      rect.y + 34,
      96,
      "#fff0a6",
    );
    drawStatCard(
      t("equipmentStatGuard"),
      stats.baseStats.guard,
      stats.equipmentBonuses.guardBonus,
      stats.finalStats.guard,
      rect.x + 220,
      rect.y + 34,
      96,
      "#9df7da",
    );
    ctx.restore();
  }

  function drawStatCard(title, base, bonus, final, x, y, width, color) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(12, 18, 35, 0.76)";
    roundedRect(x, y, width, 72, 8, true, false);
    ctx.strokeStyle = hexAlpha(color, 0.32);
    ctx.lineWidth = 1;
    roundedRect(x, y, width, 72, 8, false, true);
    fitLabel(
      title,
      x + width / 2,
      y + 17,
      width - 12,
      9,
      color,
      7,
      "900",
      true,
    );
    label(String(final), x + width / 2, y + 45, 21, "#f8f5ff");
    fitLabel(
      fmt("equipmentStatEquation", { base, bonus, final }),
      x + width / 2,
      y + 64,
      width - 10,
      8,
      "rgba(210, 202, 232, 0.68)",
      7,
      "800",
      true,
    );
    ctx.restore();
  }

  function drawEquippedSlots(equipped) {
    const rect = layout.equipped;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    drawSectionHeading(
      t("equipmentEquippedTitle"),
      rect.x + 16,
      rect.y + 27,
      rect.w - 32,
      "#f1e9ff",
    );
    const slotRects = getEquipmentSlotRects(layout);
    for (const slot of EQUIPMENT_SLOT_ORDER) {
      drawEquipmentSlot(slotRects[slot], slot, equipped[slot]);
    }
  }

  function drawEquipmentSlot(rect, slot, item) {
    const style = getEquipmentRarityStyle(item?.rarity || "common");
    ctx.save();
    const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y);
    gradient.addColorStop(0, item ? hexAlpha(style.color, 0.2) : "rgba(7, 10, 19, 0.62)");
    gradient.addColorStop(0.62, "rgba(8, 10, 23, 0.52)");
    gradient.addColorStop(1, "rgba(4, 7, 16, 0.74)");
    ctx.fillStyle = gradient;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 8, true, false);
    ctx.strokeStyle = item ? hexAlpha(style.color, 0.68) : "rgba(160, 180, 220, 0.2)";
    ctx.lineWidth = item ? 1.8 : 1.2;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 8, false, true);
    if (item) drawEquipmentIcon(item, rect.x + 9, rect.y + 15, 52, 52);
    const textX = item ? rect.x + 70 : rect.x + 12;
    label(t(`equipmentSlot.${slot}`), textX, rect.y + 18, 9, style.color);
    fitLabel(
      item ? t(item.nameKey) : t("equipmentEmptySlot"),
      textX,
      rect.y + 44,
      rect.w - (item ? 78 : 24),
      15,
      item ? "#f4f2ff" : "rgba(224,230,245,0.45)",
      9,
      "900",
      true,
    );
    if (item) {
      label(t("equipmentEquipped"), rect.x + rect.w - 72, rect.y + 18, 8, "#fff0a6");
      label(
        t(`equipmentRarity.${item.rarity}`),
        textX,
        rect.y + 66,
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

  function drawInventory(equipment, owned, selectedIndex, inventoryPage) {
    const rect = layout.inventory;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    drawSectionHeading(
      fmt("equipmentOwnedTitle", {
        count: equipment.ownedEquipment?.length || 0,
        total: EQUIPMENT_ITEMS.length,
      }),
      rect.x + 16,
      rect.y + 28,
      rect.w - 32,
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
    const itemRects = getEquipmentInventoryRects(
      owned.length,
      layout,
      inventoryPage.pageIndex,
    );
    itemRects.forEach((itemRect) => {
      const item = owned[itemRect.index];
      drawInventoryItem(
        itemRect,
        item,
        equippedIds.has(item.id),
        itemRect.index === selectedIndex,
      );
    });
    drawInventoryPagination(inventoryPage);
  }

  function drawInventoryPagination({ pageIndex, pageCount }) {
    if (pageCount <= 1) return;
    const buttons = getEquipmentPaginationRects(layout);
    drawMenuButton(
      buttons.previous.x,
      buttons.previous.y,
      buttons.previous.w,
      buttons.previous.h,
      t("equipmentPreviousPage"),
      "PgUp",
      "secondary",
    );
    drawMenuButton(
      buttons.next.x,
      buttons.next.y,
      buttons.next.w,
      buttons.next.h,
      t("equipmentNextPage"),
      "PgDn",
      "secondary",
    );
    ctx.save();
    ctx.textAlign = "center";
    fitLabel(
      fmt("equipmentInventoryPage", {
        page: pageIndex + 1,
        pages: pageCount,
      }),
      layout.inventory.x + layout.inventory.w / 2,
      buttons.previous.y + 16,
      210,
      10,
      "#cdb8ff",
      8,
      "900",
      true,
    );
    ctx.restore();
  }

  function drawInventoryItem(rect, item, equipped, selected) {
    const style = getEquipmentRarityStyle(item.rarity);
    const hovered = pointIn(rect);
    ctx.save();
    ctx.fillStyle = equipped
      ? hexAlpha(style.color, 0.2)
      : selected
        ? hexAlpha(style.color, 0.22)
        : hovered
          ? hexAlpha(style.color, 0.12)
          : "rgba(6, 9, 18, 0.52)";
    roundedRect(rect.x, rect.y, rect.w, rect.h, 6, true, false);
    ctx.strokeStyle = selected
      ? style.titleColor
      : hexAlpha(style.color, equipped ? 0.72 : hovered ? 0.5 : 0.28);
    ctx.lineWidth = selected ? 2.2 : equipped ? 1.8 : 1;
    roundedRect(rect.x, rect.y, rect.w, rect.h, 6, false, true);
    if (selected || equipped) {
      ctx.fillStyle = selected ? style.titleColor : style.color;
      roundedRect(rect.x, rect.y + 5, 3, rect.h - 10, 2, true, false);
    }
    drawEquipmentIcon(item, rect.x + 7, rect.y + 6, 40, 40);
    fitLabel(
      t(item.nameKey),
      rect.x + 52,
      rect.y + 20,
      rect.w - 70,
      11,
      "#f3f0fb",
      8,
      "800",
      true,
    );
    label(
      equipped ? t("equipmentEquipped") : t(`equipmentSlot.${item.slot}`),
      rect.x + 52,
      rect.y + 41,
      8,
      equipped ? "#fff0a6" : hexAlpha(style.color, 0.84),
    );
    ctx.textAlign = "center";
    label(
      EQUIPMENT_RARITY_RUNES[item.rarity],
      rect.x + rect.w - 18,
      rect.y + 20,
      12,
      style.color,
    );
    ctx.restore();
  }

  function drawDetails(selected) {
    const rect = layout.details;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    drawSectionHeading(
      t("equipmentDetailsTitle"),
      rect.x + 18,
      rect.y + 28,
      rect.w - 36,
      "#9edff8",
    );
    if (!selected) {
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

    const { item, stats, equipped } = selected;
    const style = getEquipmentRarityStyle(item.rarity);
    drawEquipmentIcon(item, rect.x + 18, rect.y + 46, 68, 68);
    fitLabel(
      t(item.nameKey),
      rect.x + 98,
      rect.y + 65,
      rect.w - 116,
      16,
      style.titleColor,
      10,
      "900",
      true,
    );
    label(t(`equipmentSlot.${item.slot}`), rect.x + 98, rect.y + 89, 9, "#d9ccff");
    label(t(`equipmentRarity.${item.rarity}`), rect.x + 98, rect.y + 109, 9, style.color);
    ctx.save();
    ctx.fillStyle = equipped ? "rgba(255, 221, 126, 0.12)" : "rgba(91, 109, 145, 0.12)";
    roundedRect(rect.x + 18, rect.y + 126, rect.w - 36, 25, 7, true, false);
    ctx.strokeStyle = equipped ? "rgba(255, 230, 148, 0.42)" : "rgba(151, 174, 216, 0.22)";
    roundedRect(rect.x + 18, rect.y + 126, rect.w - 36, 25, 7, false, true);
    ctx.textAlign = "center";
    label(
      equipped ? t("equipmentEquipped") : t("equipmentNotEquipped"),
      rect.x + rect.w / 2,
      rect.y + 143,
      9,
      equipped ? "#fff0a6" : "rgba(224,230,245,0.54)",
    );
    ctx.restore();
    label(t("equipmentStatBonuses"), rect.x + 18, rect.y + 172, 9, "#9edff8");
    drawDetailStat(t("equipmentStatMaxHp"), stats.maxHpBonus, rect.x + 18, rect.y + 184, "#ff9ba5");
    drawDetailStat(t("equipmentStatAttack"), stats.attackBonus, rect.x + 104, rect.y + 184, "#fff0a6");
    drawDetailStat(t("equipmentStatGuard"), stats.guardBonus, rect.x + 190, rect.y + 184, "#9df7da");
    label(t("equipmentSpecialEffectLabel"), rect.x + 18, rect.y + 256, 9, style.color);
    wrapText(
      t(item.effectKey),
      rect.x + 18,
      rect.y + 279,
      rect.w - 36,
      15,
      "rgba(249,244,255,0.9)",
      10,
    );

    const button = layout.equipButton;
    drawMenuButton(
      button.x,
      button.y,
      button.w,
      button.h,
      equipped ? t("equipmentUnequipAction") : t("equipmentEquipAction"),
      "Enter / E",
      equipped ? "secondary" : "primary",
    );
  }

  function drawDetailStat(title, bonus, x, y, color) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(7, 11, 24, 0.72)";
    roundedRect(x, y, 78, 54, 7, true, false);
    ctx.strokeStyle = hexAlpha(color, 0.28);
    roundedRect(x, y, 78, 54, 7, false, true);
    fitLabel(title, x + 39, y + 18, 68, 8, color, 7, "900", true);
    label(`+${bonus}`, x + 39, y + 43, 16, "#f5f1ff");
    ctx.restore();
  }

  function drawSectionHeading(text, x, y, width, color) {
    fitLabel(text, x, y, width * 0.62, 13, color, 9, "900");
    ctx.save();
    const startX = x + width * 0.68;
    const line = ctx.createLinearGradient(startX, y, x + width, y);
    line.addColorStop(0, hexAlpha(color, 0.5));
    line.addColorStop(1, hexAlpha(color, 0));
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, y - 4);
    ctx.lineTo(x + width, y - 4);
    ctx.stroke();
    ctx.restore();
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
