function loadReactOverlayBootstrap() {
  return import("./reactOverlayBootstrap.js");
}

function loadGameStateSnapshotBridge() {
  return import("./bridge/gameStateSnapshot.js");
}

export function createReactGameplayHudController({
  format = null,
  loaders = {},
  logger = console,
  now = () => performance.now(),
  state,
  translate = (key) => key,
  ultimateRequiredLines = 40,
  upgradeGrowthPerTier = 4,
} = {}) {
  let reactGameplayHudController = null;
  let reactGameplayHudPromise = null;
  let reactGameplayHudLoadFailed = false;
  let readReactGameplayHudSnapshot = null;

  const loadReactOverlay = loaders.reactOverlay || loadReactOverlayBootstrap;
  const loadSnapshotBridge = loaders.snapshotBridge || loadGameStateSnapshotBridge;

  function canShow() {
    return state?.mode === "playing"
      && state.assetLoadingDone !== false
      && !state.settingsOpen;
  }

  function isActive() {
    return canShow()
      && !reactGameplayHudLoadFailed
      && Boolean(reactGameplayHudController?.isMounted?.());
  }

  function clear() {
    reactGameplayHudController = null;
    reactGameplayHudPromise = null;
    readReactGameplayHudSnapshot = null;
  }

  function unmount() {
    if (reactGameplayHudController?.isMounted?.()) {
      reactGameplayHudController.unmount();
    } else {
      clear();
    }
  }

  function load() {
    if (!canShow()) return Promise.resolve(null);
    if (reactGameplayHudController?.isMounted?.()) return Promise.resolve(reactGameplayHudController);
    if (reactGameplayHudLoadFailed) return Promise.resolve(null);
    if (!reactGameplayHudPromise) {
      reactGameplayHudPromise = Promise.all([
        loadReactOverlay(),
        loadSnapshotBridge(),
      ])
        .then(([reactOverlay, snapshotBridge]) => {
          readReactGameplayHudSnapshot = snapshotBridge.createReactGameplayHudSnapshotReader({
            format,
            now,
            state,
            translate,
            ultimateRequiredLines,
            upgradeGrowthPerTier,
          });
          reactGameplayHudController = reactOverlay.mountReactGameplayHudOverlay({
            onUnmount: clear,
            readSnapshot: readReactGameplayHudSnapshot,
          });
          return reactGameplayHudController;
        })
        .catch((error) => {
          reactGameplayHudLoadFailed = true;
          logger?.error?.("[T-Spin Traveler] Failed to load React gameplay HUD:", error);
          return null;
        });
    }
    return reactGameplayHudPromise;
  }

  function update() {
    if (!canShow()) {
      unmount();
      return;
    }
    if (!reactGameplayHudController?.isMounted?.()) {
      void load();
    }
  }

  return Object.freeze({
    canShow,
    clear,
    isActive,
    load,
    unmount,
    update,
  });
}
