import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAssetLoadingController,
  createStartupAssetScheduler,
} from "../src/core/assetLoadingController.js";
import { isAssetLoadingComplete } from "../src/core/assetReadiness.js";

afterEach(() => vi.useRealTimers());

describe("startup asset scheduling", () => {
  it("loads menu images before optional images and audio", () => {
    vi.useFakeTimers();
    const scheduler = createStartupAssetScheduler({ criticalIds: ["menu", "hero"], maxWaitMs: 2600 });
    const started = [];
    for (const id of ["battle", "menu", "music", "hero"]) {
      scheduler.enqueue(id, () => started.push(id));
    }
    expect(started).toEqual(["menu", "hero"]);
    scheduler.settled("menu");
    expect(started).toEqual(["menu", "hero"]);
    scheduler.settled("hero");
    expect(started).toEqual(["menu", "hero", "battle", "music"]);
    vi.advanceTimersByTime(3000);
    scheduler.settled("hero");
    scheduler.enqueue("next", () => started.push("next"));
    expect(started).toEqual(["menu", "hero", "battle", "music", "next"]);
  });

  it("starts deferred assets at the deadline even if a menu image never settles", () => {
    vi.useFakeTimers();
    const scheduler = createStartupAssetScheduler({ criticalIds: ["menu"], maxWaitMs: 2600 });
    const loadBattle = vi.fn();
    scheduler.enqueue("battle", loadBattle);
    vi.advanceTimersByTime(2599);
    expect(loadBattle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(loadBattle).toHaveBeenCalledOnce();
    scheduler.settled("menu");
    expect(loadBattle).toHaveBeenCalledOnce();
  });

  it("starts assets immediately when there are no critical images", () => {
    const scheduler = createStartupAssetScheduler();
    const start = vi.fn();
    scheduler.enqueue("image", start);
    expect(start).toHaveBeenCalledOnce();
  });
});

describe("loading recovery", () => {
  it("finishes the shimmer once after a stalled critical image times out", () => {
    const state = { assetLoadingDone: false, assetLoadingStartedAt: 100 };
    const onCompleted = vi.fn();
    const update = createAssetLoadingController({
      state,
      getSummary: () => ({ loading: 1 }),
      getCriticalReadiness: () => ({ ready: false }),
      minMs: 450,
      maxMs: 2600,
      completionDelayMs: 320,
      isComplete: isAssetLoadingComplete,
      onCompleted,
    });
    expect(update(2699)).toBe(false);
    expect(update(2700)).toBe(false);
    expect(state.assetLoadingCompletingAt).toBe(2700);
    expect(update(3019)).toBe(false);
    expect(update(3020)).toBe(true);
    expect(state.assetLoadingDone).toBe(true);
    expect(update(4000)).toBe(false);
    expect(onCompleted).toHaveBeenCalledOnce();
  });
});
