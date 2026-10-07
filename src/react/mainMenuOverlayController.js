import * as gameStateSnapshot from "./bridge/gameStateSnapshot.js";
import * as uiIntentBridge from "./bridge/uiIntentBridge.js";
import * as mainMenuIntentHandlers from "./bridge/mainMenuIntentHandlers.js";

function loadReactOverlayBootstrap() {
  return import("./reactOverlayBootstrap.js");
}

function loadGameStateSnapshotBridge() {
  return Promise.resolve(gameStateSnapshot);
}

function loadUiIntentBridge() {
  return Promise.resolve(uiIntentBridge);
}

function loadMainMenuIntentHandlers() {
  return Promise.resolve(mainMenuIntentHandlers);
}

export function createReactMainMenuOverlayController({
  formatActionLabel = null,
  getButtonFrames = () => ({}),
  loadMetaProgress = () => ({}),
  loaders = {},
  logger = console,
  now = () => performance.now(),
  openEquipmentScreen = () => false,
  playSfx = () => {},
  resetGame = () => false,
  setGameMode = () => false,
  startStoryScene = () => false,
  state,
  translate = (key) => key,
  unlockAudio = () => {},
} = {}) {
  let reactMainMenuController = null;
  let reactMainMenuPromise = null;
  let reactMainMenuLoadFailed = false;
  let readReactMainMenuSnapshot = null;
  let reactMainMenuIntentBridge = null;

  const loadReactOverlay = loaders.reactOverlay || loadReactOverlayBootstrap;
  const loadSnapshotBridge = loaders.snapshotBridge || loadGameStateSnapshotBridge;
  const loadIntentBridge = loaders.intentBridge || loadUiIntentBridge;
  const loadMainMenuHandlers = loaders.mainMenuHandlers || loadMainMenuIntentHandlers;

  function canShow() {
    return state?.mode === "start"
      && state.assetLoadingDone !== false
      && !state.settingsOpen;
  }

  function isActive() {
    return canShow()
      && !reactMainMenuLoadFailed
      && Boolean(reactMainMenuController?.isMounted?.());
  }

  function clear() {
    reactMainMenuController = null;
    reactMainMenuPromise = null;
    readReactMainMenuSnapshot = null;
    reactMainMenuIntentBridge = null;
  }

  function load() {
    if (!canShow()) return Promise.resolve(null);
    if (reactMainMenuController?.isMounted?.()) return Promise.resolve(reactMainMenuController);
    if (reactMainMenuLoadFailed) return Promise.resolve(null);
    if (!reactMainMenuPromise) {
      reactMainMenuPromise = Promise.all([
        loadReactOverlay(),
        loadSnapshotBridge(),
        loadIntentBridge(),
        loadMainMenuHandlers(),
      ])
        .then(([reactOverlay, snapshotBridge, intentBridge, mainMenuHandlersBridge]) => {
          const reactMainMenuHandlers = mainMenuHandlersBridge.createReactMainMenuIntentHandlers({
            loadMetaProgress,
            openEquipmentScreen,
            playSfx,
            resetGame,
            setGameMode,
            startStoryScene,
            state,
            unlockAudio,
          });
          readReactMainMenuSnapshot = snapshotBridge.createReactMainMenuSnapshotReader({
            buttonFrames: getButtonFrames(),
            formatActionLabel,
            now,
            state,
            translate,
          });
          reactMainMenuIntentBridge = intentBridge.createReactMainMenuIntentBridge({
            activateMenuAction: reactMainMenuHandlers.activateMenuAction,
            hoverMenuAction: reactMainMenuHandlers.hoverMenuAction,
            refreshSnapshot: () => readReactMainMenuSnapshot?.(),
          });
          reactMainMenuController = reactOverlay.mountReactMainMenuOverlay({
            dispatchIntent: reactMainMenuIntentBridge.dispatch,
            onUnmount: clear,
            readSnapshot: readReactMainMenuSnapshot,
          });
          return reactMainMenuController;
        })
        .catch((error) => {
          reactMainMenuLoadFailed = true;
          logger?.error?.("[T-Spin Traveler] Failed to load React main menu overlay:", error);
          return null;
        });
    }
    return reactMainMenuPromise;
  }

  function update() {
    if (!canShow()) return;
    if (!reactMainMenuController?.isMounted?.()) {
      void load();
    }
  }

  return Object.freeze({
    canShow,
    clear,
    isActive,
    load,
    update,
  });
}
