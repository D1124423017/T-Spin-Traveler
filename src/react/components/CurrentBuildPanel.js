import React from "react";
import {
  ReactActionButton,
  ReactOverlayBackdrop,
  ReactOverlayShell,
  ReactPillList,
} from "./OverlayPrimitives.js";
import { REACT_DEBUG_INTENTS } from "../bridge/uiIntentBridge.js";

const h = React.createElement;

export default function CurrentBuildPanel({ dispatchIntent, snapshot }) {
  const labels = snapshot?.labels || {};
  const build = snapshot?.currentBuild || {};
  const hasUpgrades = (build.upgrades || []).length > 0;

  return h(ReactOverlayBackdrop, { tone: "current-build" },
    h(ReactOverlayShell, {
      className: "tst-react-overlay-current-build",
      kicker: labels.reactSandboxCurrentBuildHint,
      title: labels.currentBuildTitle,
      actions: h(ReactActionButton, {
        onClick: () => dispatchIntent?.({ type: REACT_DEBUG_INTENTS.closeCurrentBuild }),
      }, labels.currentBuildClose),
    },
      h("p", { className: "tst-react-overlay-copy" }, build.direction || labels.currentBuildNoDirection),
      h("div", { className: "tst-react-current-build-section" },
        h("h3", null, labels.currentBuildStats),
        h(ReactPillList, { items: build.stats || [] }),
      ),
      h("div", { className: "tst-react-current-build-section" },
        h("h3", null, labels.currentBuildTraits),
        h("div", { className: "tst-react-current-build-traits" },
          (build.traits || []).map((trait) => h("article", {
            className: "tst-react-current-build-trait",
            key: trait.id || trait.label,
            style: trait.color ? { "--tst-react-pill-color": trait.color } : undefined,
          },
            h("strong", null, trait.label),
            h("span", null, trait.effect),
          )),
        ),
      ),
      h("div", { className: "tst-react-current-build-section" },
        h("h3", null, labels.currentBuildList),
        !hasUpgrades && h("p", { className: "tst-react-overlay-note" }, labels.currentBuildEmpty),
        hasUpgrades && h("div", { className: "tst-react-current-build-upgrades" },
          build.upgrades.map((upgrade) => h("article", {
            className: "tst-react-current-build-upgrade",
            key: upgrade.id,
            style: upgrade.color ? { "--tst-react-pill-color": upgrade.color } : undefined,
          },
            h("small", null, upgrade.rarity),
            h("strong", null, upgrade.name),
            h("span", null, upgrade.tags),
          )),
        ),
      ),
    ),
  );
}
