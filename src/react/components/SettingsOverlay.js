import React from "react";
import {
  ReactActionButton,
  ReactOverlayBackdrop,
  ReactOverlayShell,
} from "./OverlayPrimitives.js";
import { REACT_DEBUG_INTENTS } from "../bridge/uiIntentBridge.js";

const h = React.createElement;

function rowsForTab(settings, tab) {
  if (tab === "controls") return settings.controls || [];
  if (tab === "handling") return settings.handling || [];
  if (tab === "audio") return settings.audio || [];
  if (tab === "language") return settings.languages || [];
  if (tab === "feedback") return settings.feedback ? [settings.feedback] : [];
  return [];
}

export default function SettingsOverlay({ dispatchIntent, snapshot }) {
  const labels = snapshot?.labels || {};
  const settings = snapshot?.settings || {};
  const currentTab = settings.currentTab || "controls";
  const rows = rowsForTab(settings, currentTab);

  const dispatch = (intent) => dispatchIntent?.(intent);
  return h(ReactOverlayBackdrop, { tone: "settings" },
    h(ReactOverlayShell, {
      className: "tst-react-overlay-settings",
      kicker: labels.reactSandboxOverlay,
      title: labels.settings,
      actions: h(ReactActionButton, {
        onClick: () => dispatch({ type: REACT_DEBUG_INTENTS.closeSettings }),
      }, labels.back),
    },
      h("p", { className: "tst-react-overlay-copy" }, labels.reactSandboxSettingsHint),
      h("div", { className: "tst-react-settings-tabs" },
        (settings.tabs || []).map((tab) => h("button", {
          type: "button",
          className: [
            "tst-react-settings-tab",
            tab.id === currentTab ? "is-active" : "",
          ].filter(Boolean).join(" "),
          key: tab.id,
          onClick: () => dispatch({
            type: REACT_DEBUG_INTENTS.setSettingsTab,
            tab: tab.id,
          }),
        }, tab.label)),
      ),
      h("div", { className: "tst-react-settings-list" },
        rows.map((row) => h("article", {
          className: "tst-react-settings-row",
          key: row.id || row.label,
        },
          h("div", null,
            h("strong", null, row.label),
            row.help && h("small", null, row.help),
          ),
          h("span", null, row.value),
        )),
      ),
    ),
  );
}
