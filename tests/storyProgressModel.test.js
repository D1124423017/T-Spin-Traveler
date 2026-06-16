import { describe, expect, it } from "vitest";
import {
  advanceStoryProgress,
  createStoryProgressState,
  getCurrentStoryPanel,
  getStoryPanelProgress,
  skipStoryProgress,
} from "../src/ui/storyProgressModel.js";

describe("story progress model", () => {
  const panels = [{ id: "one" }, { id: "two" }, { id: "three" }];

  it("starts at the first panel and reports one-based progress", () => {
    const progress = createStoryProgressState({
      sceneId: "prologue",
      totalPanels: panels.length,
      startedAt: 42,
    });

    expect(progress).toMatchObject({
      sceneId: "prologue",
      panelIndex: 0,
      totalPanels: 3,
      completed: false,
      skipped: false,
      startedAt: 42,
    });
    expect(getCurrentStoryPanel(progress, panels)).toEqual({ id: "one" });
    expect(getStoryPanelProgress(progress, panels)).toEqual({
      current: 1,
      total: 3,
      panelIndex: 0,
    });
  });

  it("advances through panels and completes after the final panel", () => {
    const progress = createStoryProgressState({ totalPanels: panels.length });
    const second = advanceStoryProgress(progress, panels);
    const third = advanceStoryProgress(second.progress, panels);
    const complete = advanceStoryProgress(third.progress, panels);

    expect(second).toMatchObject({ completed: false, progress: { panelIndex: 1 } });
    expect(third).toMatchObject({ completed: false, progress: { panelIndex: 2 } });
    expect(complete).toMatchObject({ completed: true, progress: { panelIndex: 2, completed: true } });
  });

  it("marks skipped progress without changing run mode", () => {
    const progress = createStoryProgressState({
      sceneId: "prologue",
      runMode: "storyEgypt",
      totalPanels: panels.length,
    });

    expect(skipStoryProgress(progress)).toMatchObject({
      sceneId: "prologue",
      runMode: "storyEgypt",
      completed: true,
      skipped: true,
    });
  });
});
