export function getScreenNoteViewState({
  mode,
  settingsOpen,
  battleCountdownActive,
  tutorialActive,
  controlHintsFullUntil,
  now,
} = {}) {
  const showPlayHints = mode === "playing";
  const showReferenceHints = mode === "paused" || settingsOpen || mode === "guide";
  const showHints = showPlayHints || showReferenceHints;
  return {
    menu: !showHints,
    compact: showHints,
    countdown: showPlayHints && battleCountdownActive,
    faded: showPlayHints
      && !battleCountdownActive
      && !tutorialActive
      && now > (controlHintsFullUntil || 0),
  };
}

export function createScreenNoteController({
  state,
  uiLayout,
  translate,
  isBattleCountdownActive,
  documentTarget = document,
  now = () => performance.now(),
} = {}) {
  function updateScreenNoteMode() {
    const note = documentTarget.querySelector(".screen-note");
    if (!note) return;
    const view = getScreenNoteViewState({
      mode: state.mode,
      settingsOpen: state.settingsOpen,
      battleCountdownActive: isBattleCountdownActive(),
      tutorialActive: Boolean(state.tutorial),
      controlHintsFullUntil: state.controlHintsFullUntil,
      now: now(),
    });
    note.classList.toggle("menu", view.menu);
    note.classList.toggle("compact", view.compact);
    note.classList.toggle("countdown", view.countdown);
    note.classList.toggle("faded", view.faded);
  }

  function syncControlHints() {
    documentTarget.documentElement.lang = state.language === "zh" ? "zh-Hant" : "en";
    documentTarget.title = translate("startTitle");
    const shell = documentTarget.querySelector(".shell");
    if (shell) shell.setAttribute("aria-label", translate("ariaPrototype"));
    const note = documentTarget.querySelector(".screen-note");
    if (!note) return;
    const hints = uiLayout.compactHints.map((key) => translate(key));
    note.replaceChildren(
      ...hints.map((hint, index) => {
        const span = documentTarget.createElement("span");
        span.id = `hint-${index}`;
        span.className = index >= hints.length - 2 ? "utility-hint" : "play-hint";
        span.textContent = hint;
        return span;
      }),
    );
    updateScreenNoteMode();
  }

  return {
    syncControlHints,
    updateScreenNoteMode,
  };
}
