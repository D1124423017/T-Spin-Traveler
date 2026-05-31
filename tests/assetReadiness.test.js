import { describe, expect, it } from "vitest";
import {
  getAssetLoadingSummary,
  isAssetLoadingComplete,
} from "../src/core/assetReadiness.js";

describe("asset readiness helpers", () => {
  it("normalizes the asset loading summary", () => {
    const assetApi = {
      getSummary: () => ({
        counts: { loading: 2, loaded: 5, error: 1 },
        images: Array.from({ length: 8 }),
      }),
    };

    expect(getAssetLoadingSummary(assetApi)).toEqual({
      loading: 2,
      loaded: 5,
      error: 1,
      total: 8,
    });
  });

  it("handles missing asset api", () => {
    expect(getAssetLoadingSummary(null)).toEqual({
      loading: 0,
      loaded: 0,
      error: 0,
      total: 0,
    });
  });

  it("respects minimum and maximum loading windows", () => {
    expect(isAssetLoadingComplete({ loading: 0 }, 400, { minMs: 450, maxMs: 2600 })).toBe(false);
    expect(isAssetLoadingComplete({ loading: 0 }, 450, { minMs: 450, maxMs: 2600 })).toBe(true);
    expect(isAssetLoadingComplete({ loading: 1 }, 2600, { minMs: 450, maxMs: 2600 })).toBe(true);
  });
});
