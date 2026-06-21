import React from "react";

const h = React.createElement;

export function ReactOverlayShell({
  actions = null,
  children,
  className = "",
  kicker = "",
  title = "",
} = {}) {
  return h("section", {
    className: ["tst-react-overlay-card", className].filter(Boolean).join(" "),
    "data-tst-react-ui-overlay": "true",
  },
    h("div", { className: "tst-react-overlay-card-header" },
      h("div", null,
        kicker && h("p", { className: "tst-react-overlay-kicker" }, kicker),
        title && h("h2", { className: "tst-react-overlay-title" }, title),
      ),
      actions && h("div", { className: "tst-react-overlay-header-actions" }, actions),
    ),
    h("div", { className: "tst-react-overlay-rule" }),
    h("div", { className: "tst-react-overlay-card-body" }, children),
  );
}

export function ReactOverlayBackdrop({ children, tone = "default" } = {}) {
  return h("div", {
    className: `tst-react-overlay-backdrop tst-react-overlay-backdrop-${tone}`,
    "data-tst-react-ui-backdrop": "true",
  }, children);
}

export function ReactActionButton({
  children,
  disabled = false,
  onClick,
  tone = "secondary",
} = {}) {
  return h("button", {
    type: "button",
    className: `tst-react-overlay-button tst-react-overlay-button-${tone}`,
    disabled,
    onClick,
  }, children);
}

export function ReactStatGrid({ rows = [] } = {}) {
  return h("div", { className: "tst-react-overlay-stat-grid" },
    rows.map((row) => h("div", {
      className: "tst-react-overlay-stat",
      key: row.id || row.label,
    },
      h("span", null, row.label),
      h("strong", null, row.value),
      row.meta && h("small", null, row.meta),
    )),
  );
}

export function ReactPillList({ items = [] } = {}) {
  return h("div", { className: "tst-react-overlay-pill-list" },
    items.map((item) => h("span", {
      className: "tst-react-overlay-pill",
      key: item.id || item.label,
      style: item.color ? { "--tst-react-pill-color": item.color } : undefined,
    }, item.label)),
  );
}
