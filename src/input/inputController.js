import { pointInRect } from "../render/drawUtils.js";
import { normalizeControlKey } from "./controlBindings.js";
import { createMainMenuInputRouter } from "./mainMenuInputRouter.js";
import { createEquipmentInputRouter } from "./equipmentInputRouter.js";
import { createSettingsInputRouter } from "./settingsInputRouter.js";

export function getCanvasPoint(event, canvas, width, height) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * width,
    y: ((event.clientY - rect.top) / rect.height) * height,
  };
}

export function installInputController({
  target = window,
  canvas,
  state,
  audio,
  width,
  height,
  uiLayout,
  settingsTabs,
  controlActions,
  defaultControls,
  defaultTuning,
  tuningSliders,
  githubFeedbackUrl,
  getMainMenuButtonRects,
  getSettingsContentOrigin,
  getSettingsBackButtonRect,
  getSettingsFeedbackCardRect,
  getControlsResetButtonRect,
  getHandlingResetButtonRect,
  getCurrentBuildButtonRect,
  getCurrentBuildCloseRect,
  getUpgradeDetailToggleRect,
  getUpgradeCardRect,
  getResultButtonRects,
  actions,
  now = () => performance.now(),
}) {
  const {
    bindControl,
    chooseUpgrade,
    getAllControlKeys,
    getControlKeys,
    handleAscensionResultPointerDown,
    handleMetaUpgradePointerDown,
    drawEquipmentRoulette,
    equipEquipmentItem,
    hardDrop,
    holdPiece,
    isBattleCountdownActive,
    isPointOverMenuHero,
    loadMetaProgress,
    move,
    moveUpgradeSelection,
    openEquipmentScreen,
    openEquipmentRoulette,
    playSfx,
    pressHorizontal,
    previewUpgradeChoice,
    releaseHorizontal,
    resetGame,
    returnToEquipmentInventory,
    returnToMetaUpgradeFromAscension,
    rotate,
    rotate180,
    saveGame,
    setGameMode,
    startAscensionChallenge,
    syncControlHints,
    toggleMute,
    toggleUpgradeDetail,
    triggerMenuHeroAction,
    unlockAudio,
    updateMenuHeroHoverFromPointer,
    upgradeEquipmentRoulette,
  } = actions;

  const hasPointerEvents = typeof target.PointerEvent !== "undefined";
  const pointerMoveEvent = hasPointerEvents ? "pointermove" : "mousemove";
  const pointerDownEvent = hasPointerEvents ? "pointerdown" : "mousedown";
  const pointerUpEvent = hasPointerEvents ? "pointerup" : "mouseup";
  const settingsInput = createSettingsInputRouter({
    target,
    state,
    audio,
    uiLayout,
    settingsTabs,
    controlActions,
    defaultControls,
    defaultTuning,
    tuningSliders,
    githubFeedbackUrl,
    getSettingsContentOrigin,
    getSettingsBackButtonRect,
    getSettingsFeedbackCardRect,
    getControlsResetButtonRect,
    getHandlingResetButtonRect,
    actions,
  });
  const mainMenuInput = createMainMenuInputRouter({
    state,
    getButtonRects: getMainMenuButtonRects,
    playSfx,
    actions: {
      start: () => resetGame("endless"),
      mainStage: () => resetGame("storyEgypt"),
      equipment: () => openEquipmentScreen?.(),
      metaUpgrade: () => {
        setGameMode("metaUpgrade");
        state.metaProgress = loadMetaProgress();
        state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
        playSfx("uiConfirm");
      },
      guide: () => {
        setGameMode("guide");
        playSfx("uiConfirm");
      },
      settings: () => {
        state.settingsOpen = true;
        state.settingsTab = "controls";
        playSfx("uiConfirm");
      },
    },
  });
  const equipmentInput = createEquipmentInputRouter({
    state,
    actions: {
      backToMain: () => {
        setGameMode("start");
        playSfx("uiCancel");
      },
      backToInventory: returnToEquipmentInventory,
      draw: drawEquipmentRoulette,
      equip: equipEquipmentItem,
      openRoulette: openEquipmentRoulette,
      upgrade: upgradeEquipmentRoulette,
    },
  });

  function isActionKey(action, key) {
    return getControlKeys(action).includes(normalizeControlKey(key));
  }

  function isGameKey(key, code) {
    const normalized = normalizeControlKey(key);
    return getAllControlKeys().includes(normalized)
      || key === "Enter"
      || key === "Escape"
      || (state.mode === "upgrade" && (key === "ArrowLeft" || key === "ArrowRight"))
      || ["1", "2", "3"].includes(key)
      || (state.mode === "paused" && state.pauseView === "menu" && normalized === "r")
      || ((state.mode === "victory" || state.mode === "defeat") && normalized === "r")
      || (state.mode === "ascensionResult" && normalized === "r")
      || code === "Space";
  }

  function onKeyDown(event) {
    const key = event.key;
    const code = event.code;
    const normalized = normalizeControlKey(key);
    if (state.bindingAction) {
      event.preventDefault();
      if (normalized !== "escape") {
        bindControl(state.bindingAction, normalized);
        syncControlHints();
        saveGame();
        playSfx("hold");
      }
      state.bindingAction = null;
      return;
    }
    if (isGameKey(key, code)) {
      event.preventDefault();
    }

    if (state.mode === "upgrade" && state.currentBuildOpen) {
      if (key === "Escape") {
        state.currentBuildOpen = false;
        playSfx("uiCancel");
      }
      return;
    }

    if (state.mode === "upgrade" && state.upgradePickConfirm) return;

    if (
      state.mode === "equipment"
      && equipmentInput.handleKeyDown({
        key,
        code,
        repeat: event.repeat,
      })
    ) {
      return;
    }

    if (state.mode === "upgrade") {
      if (key === "ArrowLeft" || key === "ArrowRight") {
        moveUpgradeSelection(key === "ArrowLeft" ? -1 : 1);
        return;
      }
      if (!event.repeat && isActionKey("hold", key)) {
        toggleUpgradeDetail();
        return;
      }
      if (code === "Space" || key === " ") {
        chooseUpgrade(state.upgradeSelectedIndex);
        return;
      }
      if (["1", "2", "3"].includes(key)) {
        chooseUpgrade(Number(key) - 1);
        return;
      }
    }
    if (
      state.mode === "start"
      && state.assetLoadingDone
      && !state.settingsOpen
      && mainMenuInput.handleKeyDown({
        key,
        code,
        repeat: event.repeat,
      })
    ) {
      return;
    }
    if (key === "Enter" && state.mode !== "playing") {
      if (state.mode === "upgrade") chooseUpgrade(state.upgradeSelectedIndex);
      else if (state.mode === "ascensionResult") {
        if (state.ascensionRun?.status === "failed") startAscensionChallenge();
        else returnToMetaUpgradeFromAscension();
      }
      return;
    }
    if (
      normalized === "r"
      && state.mode === "ascensionResult"
      && state.ascensionRun?.status === "failed"
    ) {
      startAscensionChallenge();
      return;
    }
    if (normalized === "r" && (state.mode === "victory" || state.mode === "defeat")) {
      resetGame(state.runMode);
      return;
    }
    if (normalized === "r" && state.mode === "paused" && state.pauseView === "menu") {
      resetGame(state.runMode);
      return;
    }
    if (normalized !== "escape" && isActionKey("pause", key)) {
      if (state.mode === "playing") {
        setGameMode("paused");
        state.pauseView = "menu";
        state.settingsOpen = false;
      }
      else if (state.mode === "paused") {
        setGameMode("playing");
        state.pauseView = "menu";
      }
      return;
    }
    if (key === "Escape") {
      unlockAudio();
      state.bindingAction = null;
      if (state.mode === "playing") {
        setGameMode("paused");
        state.pauseView = "menu";
        state.settingsOpen = false;
      }
      else if (state.mode === "start" && state.assetLoadingDone) {
        state.settingsOpen = !state.settingsOpen;
        if (state.settingsOpen) state.settingsTab = "controls";
      }
      else if (state.mode === "paused") {
        setGameMode("playing");
        state.pauseView = "menu";
        state.settingsOpen = false;
      } else if (state.mode === "ascensionResult") {
        returnToMetaUpgradeFromAscension();
      } else if (
        state.mode === "metaUpgrade"
        || state.mode === "guide"
        || state.mode === "victory"
        || state.mode === "defeat"
      ) {
        setGameMode("start");
        state.settingsOpen = false;
      } else {
        state.settingsOpen = !state.settingsOpen;
      }
      playSfx("uiCancel");
      return;
    }
    if (isActionKey("mute", key)) {
      toggleMute();
      return;
    }
    if (state.mode !== "playing") return;
    if (isBattleCountdownActive()) return;

    if (isActionKey("left", key) && !event.repeat) pressHorizontal(-1);
    else if (isActionKey("right", key) && !event.repeat) pressHorizontal(1);
    else if (isActionKey("softDrop", key)) {
      state.input.softDrop = true;
      if (!event.repeat) {
        state.input.softDropTimer = 0;
        move(0, 1);
      }
    }
    else if (!event.repeat && isActionKey("rotateCW", key)) rotate(1);
    else if (!event.repeat && isActionKey("rotateCCW", key)) rotate(-1);
    else if (!event.repeat && isActionKey("rotate180", key)) rotate180();
    else if (!event.repeat && isActionKey("hardDrop", key)) hardDrop();
    else if (!event.repeat && isActionKey("hold", key)) holdPiece();
  }

  function onKeyUp(event) {
    if (isActionKey("left", event.key)) releaseHorizontal(-1);
    else if (isActionKey("right", event.key)) releaseHorizontal(1);
    else if (isActionKey("softDrop", event.key)) {
      state.input.softDrop = false;
      state.input.softDropTimer = 0;
    }
  }

  function onPointerMove(event) {
    const point = getCanvasPoint(event, canvas, width, height);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    const heroHovered = updateMenuHeroHoverFromPointer(point.x, point.y);
    const menuHovered = state.mode === "start"
      && state.assetLoadingDone
      && !state.settingsOpen
      && mainMenuInput.updatePointerSelection(point.x, point.y);
    const equipmentHovered = state.mode === "equipment"
      && equipmentInput.isInteractivePoint(point.x, point.y);
    canvas.style.cursor = heroHovered || menuHovered || equipmentHovered ? "pointer" : "";
    if (state.pointer.down && state.pointer.dragging) {
      event.preventDefault();
      settingsInput.updateSliderFromPointer(state.pointer.dragging, point.x);
    }
  }

  function onPointerDown(event) {
    event.preventDefault();
    if (
      hasPointerEvents
      && typeof canvas.setPointerCapture === "function"
      && Number.isFinite(event.pointerId)
    ) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is a drag convenience; losing it should not block input.
      }
    }
    unlockAudio();
    const point = getCanvasPoint(event, canvas, width, height);
    state.pointer = { ...state.pointer, x: point.x, y: point.y, down: true };
    const pauseButton = uiLayout.pauseButton;

    if (
      state.mode === "playing"
      && pointInRect(
        point.x,
        point.y,
        pauseButton.x,
        pauseButton.y,
        pauseButton.w,
        pauseButton.h,
      )
    ) {
      setGameMode("paused");
      state.pauseView = "menu";
      state.settingsOpen = false;
      state.bindingAction = null;
      playSfx("uiConfirm");
      return;
    }

    if (state.mode === "paused") {
      handlePausePointerDown(point.x, point.y);
      return;
    }

    if (state.mode === "start" && state.settingsOpen) {
      settingsInput.handleSettingsPointerDown(point.x, point.y, "start");
      return;
    }

    if (
      state.mode === "start"
      && state.assetLoadingDone
      && !state.settingsOpen
      && isPointOverMenuHero(point.x, point.y)
    ) {
      triggerMenuHeroAction("click");
      return;
    }
    if (
      state.mode === "start"
      && state.assetLoadingDone
      && !state.settingsOpen
      && mainMenuInput.handlePointerDown(point.x, point.y)
    ) {
      return;
    }

    if (!state.settingsOpen && state.mode !== "playing") {
      if (state.mode === "equipment") {
        equipmentInput.handlePointerDown(point.x, point.y);
        return;
      }
      if (state.mode === "ascensionResult") {
        handleAscensionResultPointerDown(point.x, point.y);
        return;
      }
      if (state.mode === "metaUpgrade") {
        handleMetaUpgradePointerDown(point.x, point.y);
        return;
      }
      if (state.mode === "upgrade") {
        if (state.upgradePickConfirm) return;
        if (state.currentBuildOpen) {
          handleCurrentBuildPointerDown(point.x, point.y);
          return;
        }
        const buildButton = getCurrentBuildButtonRect();
        if (
          pointInRect(
            point.x,
            point.y,
            buildButton.x,
            buildButton.y,
            buildButton.w,
            buildButton.h,
          )
        ) {
          state.currentBuildOpen = true;
          playSfx("uiConfirm");
          return;
        }
        const detailToggle = getUpgradeDetailToggleRect();
        if (
          pointInRect(
            point.x,
            point.y,
            detailToggle.x,
            detailToggle.y,
            detailToggle.w,
            detailToggle.h,
          )
        ) {
          toggleUpgradeDetail();
          return;
        }
        for (let i = 0; i < 3; i += 1) {
          const card = getUpgradeCardRect(i);
          if (pointInRect(point.x, point.y, card.x, card.y, card.w, card.h)) {
            previewUpgradeChoice(i);
            return;
          }
        }
      }
      if (state.mode === "guide" && pointInRect(point.x, point.y, 232, 606, 180, 40)) {
        setGameMode("start");
        playSfx("uiCancel");
        return;
      }
      if (state.mode === "victory" || state.mode === "defeat") {
        const buttons = getResultButtonRects();
        if (
          pointInRect(
            point.x,
            point.y,
            buttons.retry.x,
            buttons.retry.y,
            buttons.retry.w,
            buttons.retry.h,
          )
        ) {
          resetGame(state.runMode);
          return;
        }
        if (
          pointInRect(
            point.x,
            point.y,
            buttons.upgrade.x,
            buttons.upgrade.y,
            buttons.upgrade.w,
            buttons.upgrade.h,
          )
        ) {
          setGameMode("metaUpgrade");
          state.metaProgress = loadMetaProgress();
          state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
          playSfx("uiConfirm");
          return;
        }
        if (
          pointInRect(
            point.x,
            point.y,
            buttons.menu.x,
            buttons.menu.y,
            buttons.menu.w,
            buttons.menu.h,
          )
        ) {
          setGameMode("start");
          playSfx("uiCancel");
        }
      }
    }
  }

  function handleCurrentBuildPointerDown(x, y) {
    const closeRect = getCurrentBuildCloseRect();
    if (pointInRect(x, y, closeRect.x, closeRect.y, closeRect.w, closeRect.h)) {
      state.currentBuildOpen = false;
      playSfx("uiCancel");
    }
  }

  function handlePausePointerDown(x, y) {
    if (state.pauseView === "settings") {
      settingsInput.handleSettingsPointerDown(x, y, "pause");
      return;
    }
    const menu = uiLayout.pauseMenu;
    if (pointInRect(x, y, menu.x + 56, menu.y + 156, menu.w - 112, 48)) {
      setGameMode("playing");
      state.pauseView = "menu";
      playSfx("uiConfirm");
      return;
    }
    if (pointInRect(x, y, menu.x + 56, menu.y + 216, menu.w - 112, 44)) {
      resetGame(state.runMode);
      return;
    }
    if (pointInRect(x, y, menu.x + 56, menu.y + 270, menu.w - 112, 44)) {
      state.pauseView = "settings";
      state.settingsTab = "controls";
      playSfx("uiConfirm");
      return;
    }
    if (pointInRect(x, y, menu.x + 56, menu.y + 324, menu.w - 112, 44)) {
      setGameMode("start");
      state.pauseView = "menu";
      state.settingsOpen = false;
      playSfx("uiCancel");
    }
  }

  function onPointerUp() {
    const dragging = state.pointer.dragging;
    if (dragging?.startsWith("audio:") || dragging?.startsWith("tuning:")) {
      const slider = state.pointer.elasticSlider || {};
      state.pointer.elasticSlider = {
        key: "",
        overflow: 0,
        releaseKey: dragging,
        releaseOverflow: slider.key === dragging ? slider.overflow || 0 : 0,
        releaseStartedAt: now(),
      };
    }
    state.pointer.down = false;
    state.pointer.dragging = null;
  }

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  canvas.addEventListener(pointerMoveEvent, onPointerMove);
  canvas.addEventListener(pointerDownEvent, onPointerDown);
  target.addEventListener(pointerUpEvent, onPointerUp);

  return {
    destroy() {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener(pointerMoveEvent, onPointerMove);
      canvas.removeEventListener(pointerDownEvent, onPointerDown);
      target.removeEventListener(pointerUpEvent, onPointerUp);
    },
    getSettingsSliderTrackX: settingsInput.getSettingsSliderTrackX,
    getSettingsSliderTrackWidth: settingsInput.getSettingsSliderTrackWidth,
  };
}
