import React from "react";
import {
  ReactActionButton,
  ReactOverlayBackdrop,
  ReactOverlayShell,
} from "./OverlayPrimitives.js";
import { REACT_DEBUG_INTENTS } from "../bridge/uiIntentBridge.js";

const h = React.createElement;

export default function GuideOverlay({ dispatchIntent, snapshot }) {
  const labels = snapshot?.labels || {};
  const guide = snapshot?.guide || {};

  return h(ReactOverlayBackdrop, { tone: "guide" },
    h(ReactOverlayShell, {
      className: "tst-react-overlay-guide",
      kicker: labels.reactSandboxOverlay,
      title: labels.moveGuide,
      actions: h(ReactActionButton, {
        onClick: () => dispatchIntent?.({ type: REACT_DEBUG_INTENTS.closeGuide }),
      }, labels.back),
    },
      h("p", { className: "tst-react-overlay-copy" }, guide.subtitle),
      h("div", { className: "tst-react-guide-list" },
        (guide.rows || []).map((row) => h("article", {
          className: "tst-react-guide-row",
          key: row.id || row.title,
          style: row.color ? { "--tst-react-row-color": row.color } : undefined,
        },
          h("strong", null, row.title),
          h("span", null, row.text),
        )),
      ),
      h("div", { className: "tst-react-guide-rule-box" },
        h("strong", null, guide.damageFormula),
        h("span", null, guide.damageRuleLine),
        h("small", null, guide.effectTier),
      ),
    ),
  );
}
