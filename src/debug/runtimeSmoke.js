import { createSmokeDebugReaders } from "./smokeHelpers.js";

export function createRuntimeSmokeReaderFactory(deps) {
  return (now = performance.now()) => createSmokeDebugReaders({
    ...deps,
    now,
  });
}
