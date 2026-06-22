import React from "react";

const h = React.createElement;

const STAR_DUST = Object.freeze([
  [18, 25, 2.4, 18, 3],
  [31, 18, 4.1, 21, 2],
  [43, 29, 1.2, 24, 3],
  [56, 17, 3.8, 20, 2],
  [68, 27, 0.6, 23, 3],
  [79, 19, 5.2, 22, 2],
  [88, 34, 2.8, 25, 3],
  [23, 43, 0.9, 27, 2],
  [37, 51, 4.5, 24, 3],
  [51, 44, 2.2, 28, 2],
  [64, 53, 6.1, 26, 3],
  [76, 47, 3.4, 29, 2],
  [89, 59, 1.7, 24, 3],
  [17, 70, 5.6, 31, 2],
  [33, 76, 3.1, 28, 3],
  [46, 69, 0.4, 32, 2],
  [58, 78, 4.8, 30, 3],
  [71, 71, 2.7, 33, 2],
  [84, 80, 6.6, 29, 3],
  [27, 88, 1.9, 34, 2],
  [41, 86, 5.1, 31, 3],
  [54, 90, 3.7, 35, 2],
  [66, 84, 0.8, 32, 3],
  [92, 88, 4.4, 36, 2],
]);

const FOOT_PARTICLES = Object.freeze([
  [27.2, 84.6, 0.2, 5.8],
  [29.1, 86.7, 1.4, 6.4],
  [31.5, 83.9, 2.2, 5.5],
  [33.8, 87.3, 3.1, 6.9],
  [35.3, 85.1, 4.0, 6.1],
  [29.8, 89.0, 4.8, 7.2],
]);

function particleStyle([x, y, delay, duration, size = 2]) {
  return {
    "--dust-delay": `${delay}s`,
    "--dust-duration": `${duration}s`,
    "--dust-size": `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
  };
}

function footParticleStyle([x, y, delay, duration]) {
  return {
    "--foot-delay": `${delay}s`,
    "--foot-duration": `${duration}s`,
    left: `${x}%`,
    top: `${y}%`,
  };
}

export default function MainMenuAmbientOverlay() {
  return h("div", {
    "aria-hidden": "true",
    className: "tst-main-menu-ambient-overlay",
    "data-tst-main-menu-ambient": "true",
  },
    h("div", { className: "tst-main-menu-ambient-rift" }),
    h("div", { className: "tst-main-menu-ambient-rune" },
      h("span", { className: "tst-main-menu-rune-glint tst-main-menu-rune-glint-a" }),
      h("span", { className: "tst-main-menu-rune-glint tst-main-menu-rune-glint-b" }),
      h("span", { className: "tst-main-menu-rune-glint tst-main-menu-rune-glint-c" }),
    ),
    h("div", { className: "tst-main-menu-noa-mist" },
      FOOT_PARTICLES.map((particle, index) => h("span", {
        className: "tst-main-menu-foot-particle",
        key: `foot-${index}`,
        style: footParticleStyle(particle),
      })),
    ),
    h("div", { className: "tst-main-menu-star-dust" },
      STAR_DUST.map((particle, index) => h("span", {
        className: "tst-main-menu-dust-particle",
        key: `dust-${index}`,
        style: particleStyle(particle),
      })),
    ),
  );
}
