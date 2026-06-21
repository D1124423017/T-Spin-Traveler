import React from "react";
import {
  ReactActionButton,
  ReactOverlayBackdrop,
  ReactOverlayShell,
  ReactStatGrid,
} from "./OverlayPrimitives.js";
import { REACT_DEBUG_INTENTS } from "../bridge/uiIntentBridge.js";

const h = React.createElement;

export default function PauseOverlay({ dispatchIntent, snapshot }) {
  const labels = snapshot?.labels || {};
  const pause = snapshot?.pause || {};
  const stats = [
    { id: "wave", label: labels.waveLabel, value: pause.wave || "-" },
    { id: "runMode", label: labels.mode, value: pause.runMode || "-" },
    { id: "hp", label: labels.hp, value: pause.playerHp || "-" },
    { id: "enemy", label: labels.enemy, value: pause.enemyHp || "-" },
  ];
  const dispatch = (type) => dispatchIntent?.({ type });

  return h(ReactOverlayBackdrop, { tone: "pause" },
    h(ReactOverlayShell, {
      className: "tst-react-overlay-pause",
      kicker: labels.reactSandboxOverlay,
      title: labels.pauseMenu,
      actions: h(ReactActionButton, {
        onClick: () => dispatch(REACT_DEBUG_INTENTS.resumeGame),
        tone: "primary",
      }, labels.resume),
    },
      h("p", { className: "tst-react-overlay-copy" }, labels.pauseMenuHint),
      h(ReactStatGrid, { rows: stats }),
      h("div", { className: "tst-react-overlay-actions" },
        h(ReactActionButton, {
          onClick: () => dispatch(REACT_DEBUG_INTENTS.resumeGame),
          tone: "primary",
        }, labels.resume),
        h(ReactActionButton, {
          onClick: () => dispatch(REACT_DEBUG_INTENTS.openPauseSettings),
        }, labels.settings),
        h(ReactActionButton, {
          onClick: () => dispatch(REACT_DEBUG_INTENTS.restartRun),
        }, labels.restart),
        h(ReactActionButton, {
          onClick: () => dispatch(REACT_DEBUG_INTENTS.returnToMainMenu),
        }, labels.menu),
      ),
    ),
  );
}
