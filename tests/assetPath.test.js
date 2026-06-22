import { afterEach, describe, expect, it } from "vitest";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const {
  ASSET_VERSION,
  assetPath,
  getRuntimeAssetBasePath,
} = await import("../src/data/assets.js");

const originalLocation = globalThis.location;

function setLocation(value) {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  if (originalLocation) {
    setLocation(originalLocation);
  } else {
    delete globalThis.location;
  }
});

describe("asset path resolution", () => {
  it("uses the project directory as base when GitHub Pages URL has no trailing slash", () => {
    setLocation({ protocol: "https:", pathname: "/T-Spin-Traveler" });

    expect(getRuntimeAssetBasePath()).toBe("/T-Spin-Traveler/");
    expect(assetPath("assets/images/ui/menu/main-menu-home-kingdom-bg.png")).toBe(
      `/T-Spin-Traveler/assets/images/ui/menu/main-menu-home-kingdom-bg.png?v=${ASSET_VERSION}`,
    );
  });

  it("keeps the same project base when GitHub Pages URL already has a trailing slash", () => {
    setLocation({ protocol: "https:", pathname: "/T-Spin-Traveler/" });

    expect(getRuntimeAssetBasePath()).toBe("/T-Spin-Traveler/");
    expect(assetPath("assets/images/ui/menu/main-menu-home-kingdom-bg.png")).toBe(
      `/T-Spin-Traveler/assets/images/ui/menu/main-menu-home-kingdom-bg.png?v=${ASSET_VERSION}`,
    );
  });

  it("resolves dev-server root assets from slash root", () => {
    setLocation({ protocol: "http:", pathname: "/" });

    expect(getRuntimeAssetBasePath()).toBe("/");
    expect(assetPath("assets/images/ui/loading/loading-screen-royal-rift-bg.png")).toBe(
      `/assets/images/ui/loading/loading-screen-royal-rift-bg.png?v=${ASSET_VERSION}`,
    );
  });

  it("does not rewrite file previews or external URLs", () => {
    setLocation({ protocol: "file:", pathname: "/C:/preview/index.html" });

    expect(assetPath("assets/images/ui/menu/main-menu-home-kingdom-bg.png")).toBe(
      "assets/images/ui/menu/main-menu-home-kingdom-bg.png",
    );
    expect(assetPath("https://example.test/asset.png")).toBe("https://example.test/asset.png");
  });
});
