import React from "react";
import {
  ReactActionButton,
  ReactOverlayBackdrop,
  ReactOverlayShell,
  ReactStatGrid,
} from "./OverlayPrimitives.js";
import { REACT_DEBUG_INTENTS } from "../bridge/uiIntentBridge.js";

const h = React.createElement;

export default function ResultOverlay({ dispatchIntent, snapshot }) {
  const labels = snapshot?.labels || {};
  const result = snapshot?.result || {};
  const title = result.victory ? labels.victory : labels.defeat;
  const tone = result.victory ? "victory" : "defeat";

  return h(ReactOverlayBackdrop, { tone },
    h(ReactOverlayShell, {
      className: `tst-react-overlay-result tst-react-overlay-result-${tone}`,
      kicker: labels.reactSandboxOverlay,
      title,
    },
      h("p", { className: "tst-react-overlay-copy tst-react-result-message" }, result.message || ""),
      h("div", { className: "tst-react-result-rating" }, result.rating || ""),
      h(ReactStatGrid, { rows: result.rows || [] }),
      h("div", { className: "tst-react-result-energy" },
        h("span", null, labels.riftEnergy),
        h("strong", null, result.riftEnergyEarned || ""),
        h("small", null, result.riftEnergyTotal || ""),
      ),
      h("div", { className: "tst-react-result-sources" },
        h("span", null, labels.summaryDamageSources),
        h("p", null, result.damageSources || "-"),
      ),
      h("p", { className: "tst-react-overlay-note" }, result.nextRunGoal || ""),
      h("div", { className: "tst-react-overlay-actions" },
        h(ReactActionButton, {
          onClick: () => dispatchIntent?.({ type: REACT_DEBUG_INTENTS.retryRun }),
          tone: "primary",
        }, labels.retry),
        h(ReactActionButton, {
          onClick: () => dispatchIntent?.({ type: REACT_DEBUG_INTENTS.openMetaUpgrade }),
        }, labels.upgradeMenu),
        h(ReactActionButton, {
          onClick: () => dispatchIntent?.({ type: REACT_DEBUG_INTENTS.returnToMainMenu }),
        }, labels.menu),
      ),
    ),
  );
}
