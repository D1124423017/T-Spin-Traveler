import React from "react";
import { createRoot } from "react-dom/client";
import ReactUiSandbox from "./components/ReactUiSandbox.js";
import {
  getReactDebugOverlayHost,
  registerReactDebugOverlayCleanup,
} from "./domOverlayHost.js";
import "./styles/reactOverlay.css";

let reactRoot = null;
let cleanupRegistration = null;
let mounted = false;
let latestOnUnmount = null;

function unmountReactDebugPanel() {
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

export function mountReactDebugPanel({
  dispatchIntent,
  onUnmount,
  readSnapshot,
} = {}) {
  const host = getReactDebugOverlayHost();
  if (!host) return null;
  latestOnUnmount = onUnmount;
  if (!reactRoot) reactRoot = createRoot(host);
  if (!cleanupRegistration) {
    cleanupRegistration = registerReactDebugOverlayCleanup(unmountReactDebugPanel);
  }
  reactRoot.render(React.createElement(ReactUiSandbox, {
    dispatchIntent,
    readSnapshot,
  }));
  mounted = true;
  return {
    isMounted: () => mounted,
    unmount: unmountReactDebugPanel,
  };
}
