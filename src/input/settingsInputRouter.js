import { pointInRect } from "../render/drawUtils.js";
import { getElasticRiftSliderValueFromPointer } from "../ui/elasticRiftSlider.js";
import { getSettingsFeedbackButtonRect } from "../ui/hudLayout.js";

export function getSettingsSliderTrackX(origin, kind) {
  return kind === "tuning" ? origin.x + 248 : origin.x;
}

export function getSettingsSliderTrackWidth(kind) {
  return kind === "tuning" ? 278 : 270;
}

export function createSettingsInputRouter({
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
}) {
  const {
    applyAudioSettings,
    normalizeControlsMap,
    playSfx,
    previewSfx,
    resetInputRepeat,
    saveGame,
    setLanguage,
    syncControlHints,
    toggleMute,
  } = actions;

  function handleSettingsPointerDown(x, y, source) {
    const backButton = getSettingsBackButtonRect();
    if (pointInRect(x, y, backButton.x, backButton.y, backButton.w, backButton.h)) {
      state.bindingAction = null;
      if (source === "start") state.settingsOpen = false;
      else state.pauseView = "menu";
      playSfx("uiCancel");
      return;
    }
    const tab = hitSettingsTab(x, y);
    if (tab) {
      state.settingsTab = tab;
      state.bindingAction = null;
      playSfx("uiConfirm");
      return;
    }
    const resetAction = hitSettingsResetButton(x, y);
    if (resetAction) {
      if (resetAction === "keybinds") resetKeybindsToDefault();
      else if (resetAction === "handling") resetHandlingToDefault();
      playSfx("uiConfirm");
      return;
    }
    const feedbackUrl = hitSettingsFeedbackLink(x, y);
    if (feedbackUrl) {
      openFeedbackLink(feedbackUrl);
      playSfx("uiConfirm");
      return;
    }
    const slider = hitSlider(x, y);
    if (slider) {
      state.pointer.dragging = slider;
      updateSliderFromPointer(slider, x);
      previewSfx();
      return;
    }
    const origin = getSettingsContentOrigin();
    if (
      state.settingsTab === "audio"
      && pointInRect(x, y, origin.x + 116, origin.y + 250, 64, 30)
    ) {
      toggleMute();
      playSfx("hold");
      return;
    }
    if (state.settingsTab === "language") {
      if (pointInRect(x, y, origin.x, origin.y + 72, 72, 34)) {
        setLanguage("zh");
        playSfx("hold");
        return;
      }
      if (pointInRect(x, y, origin.x + 80, origin.y + 72, 72, 34)) {
        setLanguage("en");
        playSfx("hold");
        return;
      }
    }
    const action = hitControlBind(x, y);
    if (action) {
      state.bindingAction = action;
      playSfx("hold");
    }
  }

  function hitSettingsTab(x, y) {
    const settings = uiLayout.settings;
    for (let i = 0; i < settingsTabs.length; i += 1) {
      if (pointInRect(x, y, settings.tabX, settings.y + 112 + i * 62, 164, 46)) {
        return settingsTabs[i];
      }
    }
    return null;
  }

  function hitSettingsResetButton(x, y) {
    if (state.settingsTab === "controls") {
      const rect = getControlsResetButtonRect();
      if (pointInRect(x, y, rect.x, rect.y, rect.w, rect.h)) return "keybinds";
    }
    if (state.settingsTab === "handling") {
      const rect = getHandlingResetButtonRect();
      if (pointInRect(x, y, rect.x, rect.y, rect.w, rect.h)) return "handling";
    }
    return "";
  }

  function resetKeybindsToDefault() {
    state.controls = normalizeControlsMap(defaultControls);
    state.bindingAction = null;
    syncControlHints();
    saveGame();
  }

  function resetHandlingToDefault() {
    state.tuning = {
      ...state.tuning,
      das: defaultTuning.das,
      arr: defaultTuning.arr,
      softDrop: defaultTuning.softDrop,
      lockDelay: defaultTuning.lockDelay,
    };
    resetInputRepeat();
    saveGame();
  }

  function hitSettingsFeedbackLink(x, y) {
    if (state.settingsTab !== "feedback") return "";
    const card = getSettingsFeedbackCardRect();
    const buttonRect = getSettingsFeedbackButtonRect(card.x, card.y, card.w, card.h);
    if (pointInRect(x, y, buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h)) {
      return githubFeedbackUrl;
    }
    return "";
  }

  function openFeedbackLink(url) {
    const opened = target.open(url, "_blank");
    if (opened) opened.opener = null;
  }

  function hitSlider(x, y) {
    const origin = getSettingsContentOrigin();
    const sliders = [];
    if (state.settingsTab === "audio") {
      sliders.push(
        ["audio:masterVolume", origin.x, origin.y + 64, getSettingsSliderTrackWidth("audio")],
        ["audio:musicVolume", origin.x, origin.y + 128, getSettingsSliderTrackWidth("audio")],
        ["audio:sfxVolume", origin.x, origin.y + 192, getSettingsSliderTrackWidth("audio")],
      );
    } else if (state.settingsTab === "handling") {
      const trackX = getSettingsSliderTrackX(origin, "tuning");
      const trackW = getSettingsSliderTrackWidth("tuning");
      sliders.push(
        ["tuning:das", trackX, origin.y + 66 + 34, trackW],
        ["tuning:arr", trackX, origin.y + 154 + 34, trackW],
        ["tuning:softDrop", trackX, origin.y + 242 + 34, trackW],
        ["tuning:lockDelay", trackX, origin.y + 330 + 34, trackW],
      );
    }
    for (const [key, sliderX, sliderY, sliderW] of sliders) {
      if (pointInRect(x, y, sliderX - 16, sliderY - 18, sliderW + 32, 50)) return key;
    }
    return null;
  }

  function updateSliderFromPointer(key, x) {
    const [kind, name] = key.split(":");
    const origin = getSettingsContentOrigin();
    const sliderX = getSettingsSliderTrackX(origin, kind);
    const trackW = getSettingsSliderTrackWidth(kind);
    if (kind === "audio") {
      const result = getElasticRiftSliderValueFromPointer({
        pointerX: x,
        trackX: sliderX,
        trackWidth: trackW,
        min: 0,
        max: 1,
      });
      audio[name] = result.value;
      state.pointer.elasticSlider = {
        key,
        overflow: result.overflow,
        releaseKey: "",
        releaseOverflow: 0,
        releaseStartedAt: 0,
      };
    } else if (kind === "tuning") {
      const spec = tuningSliders[name];
      const result = getElasticRiftSliderValueFromPointer({
        pointerX: x,
        trackX: sliderX,
        trackWidth: trackW,
        min: spec.min,
        max: spec.max,
        step: 1,
      });
      state.tuning[name] = result.value;
      state.pointer.elasticSlider = {
        key,
        overflow: result.overflow,
        releaseKey: "",
        releaseOverflow: 0,
        releaseStartedAt: 0,
      };
    }
    applyAudioSettings();
    saveGame();
  }

  function hitControlBind(x, y) {
    if (state.settingsTab !== "controls") return null;
    const origin = getSettingsContentOrigin();
    const layout = uiLayout.controlsGrid;
    const baseX = origin.x;
    const baseY = origin.y + 112;
    for (let i = 0; i < controlActions.length; i += 1) {
      const col = i % layout.columns;
      const row = Math.floor(i / layout.columns);
      const rowX = baseX + col * layout.gapX;
      const rowY = baseY + row * layout.rowH;
      const keyX = rowX + layout.rowW - layout.keyW;
      if (pointInRect(x, y, keyX, rowY + 3, layout.keyW, layout.keyH)) {
        return controlActions[i].id;
      }
    }
    return null;
  }

  return {
    getSettingsSliderTrackWidth,
    getSettingsSliderTrackX(kind) {
      return getSettingsSliderTrackX(getSettingsContentOrigin(), kind);
    },
    handleSettingsPointerDown,
    updateSliderFromPointer,
  };
}
