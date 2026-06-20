import { describe, expect, it, vi } from "vitest";
import {
  createDebugUiController,
  handleDebugUiShortcut,
  isTextEntryTarget,
} from "../src/debug/debugUiController.js";
import {
  createPendingDebugUiController,
  isDebugHudEnabled,
} from "../src/debug/debugBootstrap.js";

describe("debug UI controller", () => {
  it("toggles visibility without changing game state", () => {
    const onVisibilityChange = vi.fn();
    const controller = createDebugUiController({
      initialVisible: true,
      onVisibilityChange,
    });

    expect(controller.isVisible()).toBe(true);
    expect(controller.toggle()).toBe(false);
    expect(controller.isVisible()).toBe(false);
    expect(controller.setVisible(true)).toBe(true);
    expect(onVisibilityChange).toHaveBeenNthCalledWith(1, false);
    expect(onVisibilityChange).toHaveBeenNthCalledWith(2, true);
  });

  it("keeps the controller hidden when debug mode is not allowed", () => {
    const onVisibilityChange = vi.fn();
    const controller = createDebugUiController({
      allowed: false,
      initialVisible: true,
      onVisibilityChange,
    });

    expect(controller.isAllowed()).toBe(false);
    expect(controller.isVisible()).toBe(false);
    expect(controller.toggle()).toBe(false);
    expect(controller.setVisible(true)).toBe(false);
    expect(onVisibilityChange).toHaveBeenCalledTimes(2);
    expect(onVisibilityChange).toHaveBeenNthCalledWith(1, false);
    expect(onVisibilityChange).toHaveBeenNthCalledWith(2, false);
  });

  it("handles F1 only in debug mode and ignores text entry", () => {
    const toggle = vi.fn();
    const preventDefault = vi.fn();

    expect(handleDebugUiShortcut({
      key: "F1",
      code: "F1",
      target: { tagName: "CANVAS" },
      preventDefault,
    }, toggle, { enabled: true })).toBe(true);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(toggle).toHaveBeenCalledOnce();

    expect(handleDebugUiShortcut({
      key: "F1",
      code: "F1",
      target: { tagName: "INPUT" },
      preventDefault,
    }, toggle, { enabled: true })).toBe(false);
    expect(toggle).toHaveBeenCalledOnce();

    expect(handleDebugUiShortcut({
      key: "F1",
      code: "F1",
      target: { tagName: "CANVAS" },
      preventDefault,
    }, toggle, { enabled: false })).toBe(false);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(toggle).toHaveBeenCalledOnce();
    expect(isTextEntryTarget({ isContentEditable: true })).toBe(true);
    expect(isTextEntryTarget({ tagName: "TEXTAREA" })).toBe(true);
    expect(isTextEntryTarget({ tagName: "DIV" })).toBe(false);
  });

  it("keeps pending visibility before the debug UI controller lazy-loads", () => {
    const controller = createPendingDebugUiController({
      allowed: true,
      initialVisible: true,
    });

    expect(controller.isAllowed()).toBe(true);
    expect(controller.isVisible()).toBe(true);
    expect(controller.toggle()).toBe(false);
    expect(controller.setVisible(true)).toBe(true);
  });

  it("detects debug mode from the URL query", () => {
    expect(isDebugHudEnabled("?debug=1")).toBe(true);
    expect(isDebugHudEnabled("?debug=0")).toBe(false);
    expect(isDebugHudEnabled("not a query")).toBe(false);
  });
});
