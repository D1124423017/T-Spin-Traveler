import React from "react";
import { createRoot } from "react-dom/client";
import GameplayHudOverlay from "./components/GameplayHudOverlay.js";
import MainMenuOverlay from "./components/MainMenuOverlay.js";
import {
  getReactDebugOverlayHost,
  getReactGameplayHudOverlayHost,
  getReactMainMenuOverlayHost,
  registerReactDebugOverlayCleanup,
  registerReactGameplayHudOverlayCleanup,
  registerReactMainMenuOverlayCleanup,
} from "./domOverlayHost.js";
import "./styles/gameplayHudOverlay.css";
import "./styles/mainMenuOverlay.css";
import "./styles/mainMenuAmbientOverlay.css";

const ReactUiSandbox = React.lazy(() => import("./components/ReactUiSandbox.js"));

function createMountSlot({
  getHost,
  registerCleanup,
}) {
  let reactRoot = null;
  let cleanupRegistration = null;
  let mounted = false;
  let latestOnUnmount = null;

  function unmount() {
    if (!mounted) return;
    mounted = false;
    if (cleanupRegistration) {
      cleanupRegistration();
      cleanupRegistration = null;
    }
    reactRoot?.unmount();
    reactRoot = null;
    latestOnUnmount?.();
    latestOnUnmount = null;
  }

  function mount(element, onUnmount) {
    const host = getHost();
    if (!host) return null;
    latestOnUnmount = onUnmount;
    if (!reactRoot) reactRoot = createRoot(host);
    if (!cleanupRegistration) cleanupRegistration = registerCleanup(unmount);
    reactRoot.render(element);
    mounted = true;
    return {
      isMounted: () => mounted,
      unmount,
    };
  }

  return {
    mount,
    unmount,
  };
}

const debugSlot = createMountSlot({
  getHost: getReactDebugOverlayHost,
  registerCleanup: registerReactDebugOverlayCleanup,
});

const mainMenuSlot = createMountSlot({
  getHost: getReactMainMenuOverlayHost,
  registerCleanup: registerReactMainMenuOverlayCleanup,
});

const gameplayHudSlot = createMountSlot({
  getHost: getReactGameplayHudOverlayHost,
  registerCleanup: registerReactGameplayHudOverlayCleanup,
});

export function mountReactDebugPanel({
  dispatchIntent,
  onUnmount,
  readSnapshot,
} = {}) {
  return debugSlot.mount(
    React.createElement(React.Suspense, { fallback: null },
      React.createElement(ReactUiSandbox, {
        dispatchIntent,
        readSnapshot,
      }),
    ),
    onUnmount,
  );
}

export function mountReactGameplayHudOverlay({
  onUnmount,
  readSnapshot,
} = {}) {
  return gameplayHudSlot.mount(
    React.createElement(GameplayHudOverlay, {
      readSnapshot,
    }),
    onUnmount,
  );
}

export function mountReactMainMenuOverlay({
  dispatchIntent,
  onUnmount,
  readSnapshot,
} = {}) {
  return mainMenuSlot.mount(
    React.createElement(MainMenuOverlay, {
      dispatchIntent,
      readSnapshot,
    }),
    onUnmount,
  );
}
