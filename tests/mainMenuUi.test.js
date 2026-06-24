import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { translations } from "../src/data/i18n.js";
import { createMainMenuInputRouter } from "../src/input/mainMenuInputRouter.js";
import {
  MAIN_MENU_AMBIENT_PARTICLE_COUNT,
  MAIN_MENU_AMBIENT_PARTICLE_LIMIT,
} from "../src/react/components/MainMenuAmbientOverlay.js";
import { MAIN_MENU_BUTTON_STYLE } from "../src/ui/menuButtonRenderer.js";
import {
  MAIN_MENU_DIALOGUE_STYLE,
  MAIN_MENU_HERO_DIALOGUE_KEYS,
  getMainMenuDialogueAlpha,
  getMainMenuDialogueLayout,
  wrapMainMenuDialogueText,
} from "../src/ui/mainMenuDialogueRenderer.js";
import {
  createMainMenuLayout,
  getMainMenuButtonRectList,
  getMainMenuButtonRects,
  getMainMenuVisualButtonRect,
} from "../src/ui/mainMenuLayout.js";
import {
  getMainMenuActions,
  getSelectedMainMenuAction,
  normalizeMainMenuSelectedIndex,
} from "../src/ui/mainMenuModel.js";

describe("main menu model and layout", () => {
  it("keeps all six public menu actions in the intended order", () => {
    expect(getMainMenuActions().map(({ id }) => id)).toEqual([
      "start",
      "mainStage",
      "equipment",
      "metaUpgrade",
      "guide",
      "settings",
    ]);
    expect(getSelectedMainMenuAction(2).labelKey).toBe("mainMenuEquipment");
    expect(getMainMenuActions().every(({ enabled }) => enabled)).toBe(true);
    expect(normalizeMainMenuSelectedIndex(-1)).toBe(5);
    expect(normalizeMainMenuSelectedIndex(6)).toBe(0);
  });

  it("provides every menu label and description in Chinese and English", () => {
    for (const language of ["zh", "en"]) {
      for (const action of getMainMenuActions()) {
        expect(translations[language][action.labelKey]).toBeTruthy();
        expect(translations[language][action.descriptionKey]).toBeTruthy();
        if (action.hintKey) expect(translations[language][action.hintKey]).toBeTruthy();
      }
      expect(translations[language].menuControlHint).toBeTruthy();
      expect(translations[language].menuWorldLocation).toBeTruthy();
    }
  });

  it("creates stable 1280 x 720 anchors and hit areas", () => {
    const layout = createMainMenuLayout();

    expect(layout.hero).toEqual({ x: 310, y: 590, scale: 0.82 });
    expect(getMainMenuButtonRects(layout).start).toEqual({
      x: 748,
      y: 104,
      w: 492,
      h: 80,
    });
    expect(getMainMenuButtonRectList(layout).at(-1)).toEqual({
      id: "settings",
      rect: { x: 748, y: 529, w: 492, h: 80 },
    });
    expect(getMainMenuButtonRects(layout, {
      groupOffsetX: -60,
    }).equipment).toEqual({
      x: 688,
      y: 274,
      w: 492,
      h: 80,
    });
  });

  it("keeps interaction lanes fixed while visual plaques change focus size", () => {
    const layout = createMainMenuLayout();
    const lane = getMainMenuButtonRects(layout).equipment;
    const idle = getMainMenuVisualButtonRect(layout, "equipment", 0);
    const focus = getMainMenuVisualButtonRect(layout, "equipment", 1);

    expect(idle).toMatchObject({ w: 326, h: 54 });
    expect(focus).toMatchObject({ w: 400, h: 92, rotation: 0 });
    expect(idle.rotation).not.toBe(0);
    expect(getMainMenuButtonRects(layout).equipment).toEqual(lane);
    expect(focus.w).toBeGreaterThan(idle.w);
    expect(focus.h).toBeGreaterThan(idle.h);
  });

  it("keeps larger readable typography for focused and idle plaques", () => {
    const layout = createMainMenuLayout();

    expect(MAIN_MENU_BUTTON_STYLE).toMatchObject({
      focusFontSize: 33,
      idleFontSize: 19,
      idleAlpha: 0.72,
    });
    expect(layout.textSizes).toEqual({
      descriptionTitle: 14,
      description: 12,
      footer: 11,
    });
  });

  it("uses a fixed descending plaque composition without moving hit lanes", () => {
    const layout = createMainMenuLayout();
    const start = getMainMenuVisualButtonRect(layout, "start", 0);
    const settings = getMainMenuVisualButtonRect(layout, "settings", 0);

    expect(start.x + start.w / 2).toBeGreaterThan(settings.x + settings.w / 2);
    expect(start.y + start.h / 2).toBeLessThan(settings.y + settings.h / 2);
    expect(getMainMenuButtonRects(layout).start.x).toBe(
      getMainMenuButtonRects(layout).settings.x,
    );
  });

  it("keeps formal menu presentation free of Canvas box primitives", () => {
    const root = process.cwd();
    const menuSource = fs.readFileSync(path.join(root, "src/ui/menuScreen.js"), "utf8");
    const buttonSource = fs.readFileSync(path.join(root, "src/ui/menuButtonRenderer.js"), "utf8");
    const mainMenuButtonBlock = buttonSource.slice(buttonSource.indexOf("function drawMainMenuButton"));

    expect(menuSource).not.toContain("strokeRect(");
    expect(menuSource).not.toContain("drawCard(");
    expect(mainMenuButtonBlock).not.toContain("roundedRect(");
    expect(mainMenuButtonBlock).not.toContain("fillRect(");
    expect(mainMenuButtonBlock).not.toContain("hovered || selected");
    expect(mainMenuButtonBlock).toContain("active = !disabled && selected");
  });

  it("keeps Canvas scene and NOA while letting React own the menu controls", () => {
    const root = process.cwd();
    const menuSource = fs.readFileSync(path.join(root, "src/ui/menuScreen.js"), "utf8");
    const startOverlayBlock = menuSource.slice(
      menuSource.indexOf("function drawStartMenuOverlay"),
      menuSource.indexOf("function drawTitle"),
    );

    expect(menuSource).toContain("isReactMainMenuActive = () => false");
    expect(startOverlayBlock).toContain("drawMainMenuScene(menuMotion);");
    expect(startOverlayBlock).toContain("drawMenuHeroShowcase();");
    expect(startOverlayBlock).toContain("const reactMainMenuActive = Boolean(isReactMainMenuActive());");
    expect(startOverlayBlock).toContain("if (!reactMainMenuActive)");
    expect(startOverlayBlock).toContain("drawMenuButton(");
    expect(startOverlayBlock).toContain("drawMenuHeroDialogueBubble();");
  });

  it("shows only the game title in the top-left brand area", () => {
    const root = process.cwd();
    const overlaySource = fs.readFileSync(
      path.join(root, "src/react/components/MainMenuOverlay.js"),
      "utf8",
    );
    const menuCss = fs.readFileSync(path.join(root, "src/react/styles/mainMenuOverlay.css"), "utf8");
    const menuSource = fs.readFileSync(path.join(root, "src/ui/menuScreen.js"), "utf8");
    const titleBlock = menuSource.slice(
      menuSource.indexOf("function drawTitle"),
      menuSource.indexOf("function drawSelectedActionDescription"),
    );

    expect(overlaySource).toContain("tst-main-menu-title");
    expect(overlaySource).not.toContain("tst-main-menu-tagline");
    expect(overlaySource).not.toContain("tst-main-menu-world-hint");
    expect(overlaySource).not.toContain("tst-main-menu-location");
    expect(menuCss).not.toContain("tst-main-menu-tagline");
    expect(menuCss).not.toContain("tst-main-menu-world-hint");
    expect(menuCss).not.toContain("tst-main-menu-location");
    expect(titleBlock).not.toContain("startTagline");
    expect(titleBlock).not.toContain("startWorldHint");
    expect(titleBlock).not.toContain("menuWorldLocation");
    expect(menuSource).toContain("function drawSelectedActionDescription");
    expect(menuSource).toContain("function drawFooter");
  });

  it("keeps React menu plaques free of moving sweep bars while preserving glow states", () => {
    const root = process.cwd();
    const menuCss = fs.readFileSync(path.join(root, "src/react/styles/mainMenuOverlay.css"), "utf8");

    expect(menuCss).not.toContain("tst-main-menu-title-shimmer");
    expect(menuCss).not.toContain("tst-main-menu-button-sweep");
    expect(menuCss).not.toContain(".tst-main-menu-title::after");
    expect(menuCss).not.toContain(".tst-main-menu-button-inner::after");
    expect(menuCss).not.toContain("radial-gradient(ellipse at 16% 50%, rgba(126, 247, 255, 0.32)");
    expect(menuCss).toContain(".tst-main-menu-button-core");
    expect(menuCss).toContain("rgba(3, 5, 12, 0.78)");
    expect(menuCss).toContain(".tst-main-menu-button.is-selected .tst-main-menu-button-glow {\n  opacity: 0.58;");
    expect(menuCss).toContain(".tst-main-menu-button-frame-glow");
    expect(menuCss).toContain(".tst-main-menu-button.is-selected .tst-main-menu-button-frame-glow");
    expect(menuCss).toContain(".tst-main-menu-button:hover .tst-main-menu-button-glow");
    expect(menuCss).toContain(".tst-main-menu-button.is-selected::before");
    expect(menuCss).toContain("@keyframes tst-main-menu-button-edge-pulse");
    expect(menuCss).toContain("@keyframes tst-main-menu-button-gem-pulse");
  });

  it("uses global rift click sparks without wrapping React menu buttons", () => {
    const root = process.cwd();
    const buttonSource = fs.readFileSync(
      path.join(root, "src/react/components/MainMenuButton.js"),
      "utf8",
    );
    const bootstrapSource = fs.readFileSync(
      path.join(root, "src/react/reactOverlayBootstrap.js"),
      "utf8",
    );
    const hostSource = fs.readFileSync(
      path.join(root, "src/react/domOverlayHost.js"),
      "utf8",
    );

    expect(buttonSource).not.toContain("RiftClickSpark");
    expect(buttonSource).not.toContain("tst-main-menu-button-spark");
    expect(buttonSource).toContain('onClick: () => dispatch("activateMenuAction")');
    expect(buttonSource).toContain('onKeyDown: handleKeyDown');
    expect(bootstrapSource).toContain("import RiftClickSpark");
    expect(bootstrapSource).toContain("mountGlobalRiftClickSpark");
    expect(bootstrapSource).toContain("React.createElement(RiftClickSpark)");
    expect(bootstrapSource).toContain('./styles/riftClickSpark.css');
    expect(hostSource).toContain("getReactGlobalClickSparkHost");
    expect(hostSource).toContain("tst-react-global-rift-click-spark-layer");
  });

  it("adds a non-interactive React ambient layer with reduced-motion support", () => {
    const root = process.cwd();
    const overlaySource = fs.readFileSync(path.join(root, "src/react/components/MainMenuOverlay.js"), "utf8");
    const ambientSource = fs.readFileSync(
      path.join(root, "src/react/components/MainMenuAmbientOverlay.js"),
      "utf8",
    );
    const ambientCss = fs.readFileSync(
      path.join(root, "src/react/styles/mainMenuAmbientOverlay.css"),
      "utf8",
    );

    expect(overlaySource).toContain("MainMenuAmbientOverlay");
    expect(ambientSource).toContain("data-tst-main-menu-ambient");
    expect(ambientSource).toContain("data-tst-ambient-particle-count");
    expect(ambientSource).toContain("tst-main-menu-aurora-rift");
    expect(ambientSource).toContain("tst-main-menu-ambient-rift");
    expect(ambientSource).toContain("tst-main-menu-noa-mist");
    expect(ambientSource).toContain("tst-main-menu-dust-particle");
    expect(ambientCss).toContain("pointer-events: none");
    expect(ambientCss).toContain("@keyframes tst-main-menu-aurora-breathe");
    expect(ambientCss).toContain(".tst-main-menu-aurora-rift-stream");
    expect(ambientCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(MAIN_MENU_AMBIENT_PARTICLE_COUNT).toBeGreaterThanOrEqual(24);
    expect(MAIN_MENU_AMBIENT_PARTICLE_COUNT).toBeLessThanOrEqual(
      MAIN_MENU_AMBIENT_PARTICLE_LIMIT,
    );
  });
});

describe("main menu input router", () => {
  it("moves keyboard focus with wrapping and activates the selected callback", () => {
    const state = { mainMenuSelectedIndex: 0 };
    const callbacks = {
      start: vi.fn(),
      settings: vi.fn(),
    };
    const playSfx = vi.fn();
    const router = createMainMenuInputRouter({
      state,
      getButtonRects: () => createMainMenuLayout().buttonRects,
      actions: callbacks,
      playSfx,
    });

    expect(router.handleKeyDown({ key: "ArrowUp" })).toBe(true);
    expect(state.mainMenuSelectedIndex).toBe(5);
    expect(router.handleKeyDown({ key: "Enter" })).toBe(true);
    expect(callbacks.settings).toHaveBeenCalledOnce();
    expect(playSfx).toHaveBeenCalledWith("uiHover");
  });

  it("selects and activates menu entries through pointer hit areas", () => {
    const state = { mainMenuSelectedIndex: 0 };
    const equipment = vi.fn();
    const layout = createMainMenuLayout();
    const router = createMainMenuInputRouter({
      state,
      getButtonRects: () => layout.buttonRects,
      actions: { equipment },
    });
    const rect = layout.buttonRects.equipment;

    expect(router.updatePointerSelection(rect.x + 10, rect.y + 10)).toBe(true);
    expect(state.mainMenuSelectedIndex).toBe(2);
    expect(router.handlePointerDown(rect.x + 10, rect.y + 10)).toBe(true);
    expect(equipment).toHaveBeenCalledOnce();
  });
});

describe("main menu NOA dialogue presentation", () => {
  it("replaces the old dialogue pool with fourteen bilingual lines", () => {
    expect(MAIN_MENU_HERO_DIALOGUE_KEYS).toHaveLength(14);
    for (const key of MAIN_MENU_HERO_DIALOGUE_KEYS) {
      expect(translations.zh[key]).toBeTruthy();
      expect(translations.en[key]).toBeTruthy();
    }
    expect(translations.zh.menuHeroHover1).toBeUndefined();
    expect(translations.en.menuHeroClick3).toBeUndefined();
  });

  it("wraps Chinese and English dialogue into at most two readable lines", () => {
    const measureText = (value) => value.length * 7;
    const zhLines = wrapMainMenuDialogueText({
      text: translations.zh.menuHeroDialogue6,
      language: "zh",
      maxWidth: 210,
      measureText,
    });
    const enLines = wrapMainMenuDialogueText({
      text: translations.en.menuHeroDialogue13,
      language: "en",
      maxWidth: 280,
      measureText,
    });

    expect(zhLines.length).toBeLessThanOrEqual(MAIN_MENU_DIALOGUE_STYLE.maxLines);
    expect(enLines.length).toBeLessThanOrEqual(MAIN_MENU_DIALOGUE_STYLE.maxLines);
  });

  it("positions the dialogue between NOA and the menu without covering either", () => {
    const mainMenuLayout = createMainMenuLayout();
    const layout = getMainMenuDialogueLayout({
      hero: mainMenuLayout.hero,
      menuX: mainMenuLayout.menu.x,
      language: "en",
      uiScale: mainMenuLayout.scale,
    });

    expect(layout.x + layout.w).toBeLessThanOrEqual(mainMenuLayout.menu.x);
    expect(layout.y).toBeLessThan(mainMenuLayout.hero.y - 200 * mainMenuLayout.hero.scale);
    expect(layout.textWidth).toBeGreaterThan(280);
  });

  it("keeps the existing fade timing presentation-only", () => {
    const interaction = {
      lineKey: "menuHeroDialogue1",
      lineStartedAt: 1000,
      lineUntil: 4000,
    };

    expect(getMainMenuDialogueAlpha(interaction, 1000)).toBe(0);
    expect(getMainMenuDialogueAlpha(interaction, 1400)).toBe(1);
    expect(getMainMenuDialogueAlpha(interaction, 3900)).toBeCloseTo(0.3125);
    expect(getMainMenuDialogueAlpha(interaction, 4000)).toBe(0);
  });
});

describe("main menu NOA idle variants", () => {
  it("wires all four special idles through one rotating configuration table", () => {
    const gameSource = fs.readFileSync(path.join(process.cwd(), "game.js"), "utf8");
    const configBlock = gameSource.slice(
      gameSource.indexOf("const MENU_HERO_SPECIAL_ANIMATIONS"),
      gameSource.indexOf("let mainMenuHitMotion"),
    );

    for (const id of [
      "menu-idle-cube",
      "menu-idle-meditate",
      "menu-idle-rift-wayfinder",
      "menu-idle-star-map-listener",
    ]) {
      expect(configBlock).toContain(`id: "${id}"`);
    }
    expect(configBlock.match(/columns: 4/g)).toHaveLength(4);
    expect(configBlock.match(/rows: 4/g)).toHaveLength(4);
    expect(gameSource).toContain("Object.keys(MENU_HERO_SPECIAL_ANIMATIONS)");
    expect(gameSource).toContain(
      "MENU_HERO_SPECIAL_ANIMATIONS[kind] || MENU_HERO_SPECIAL_ANIMATIONS.cube",
    );
    expect(gameSource).toContain(
      "getMenuHeroIdlePlayback(now).active ? null : getMenuSpecialIdle(now)",
    );
    expect(gameSource).toContain(
      "if (specialIdle) drawMenuSpecialIdleFrame(specialIdle)",
    );
    expect(gameSource).not.toContain(
      'interaction.idleTriggerCount % 2 === 0 ? "cube" : "meditate"',
    );
  });

  it("keeps the new portrait cells proportional and baseline aligned", () => {
    const gameSource = fs.readFileSync(path.join(process.cwd(), "game.js"), "utf8");
    const configBlock = gameSource.slice(
      gameSource.indexOf("const MENU_HERO_SPECIAL_ANIMATIONS"),
      gameSource.indexOf("let mainMenuHitMotion"),
    );

    expect(configBlock.match(/draw: \{ x: -166, y: -382, w: 332, h: 498 \}/g))
      .toHaveLength(2);
    expect(gameSource).toContain(
      "alignDrawBoxToBaseline(config.draw, CHARACTER_BASELINES.menu.localY)",
    );
  });

  it("does not let the main menu hero fall through to the prototype fallback", () => {
    const gameSource = fs.readFileSync(path.join(process.cwd(), "game.js"), "utf8");
    const heroBaseBlock = gameSource.slice(
      gameSource.indexOf("function drawHeroIdleBase"),
      gameSource.indexOf("function isMenuHeroInteractive"),
    );

    expect(heroBaseBlock).toMatch(/if \(context === "menu"\)[\s\S]*?return;\s*}\s*if \(isImageReady\(noaBattleIdleArt\)\)/);
    expect(heroBaseBlock).toMatch(/else \{\s*drawNoaFallback\(false\);\s*}/);
  });
});
