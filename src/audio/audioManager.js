import {
  FILE_SFX_EVENTS,
  FILE_SFX_MIX,
  pickFileSfxAssetKey,
} from "./audioEvents.js";

export function createFileSfxPlayer({
  assets,
  eventMap = FILE_SFX_EVENTS,
  mix = FILE_SFX_MIX,
  getContext,
  getDestination,
  getRecord,
  warn = console.warn,
} = {}) {
  const buffers = new Map();
  const loading = new Map();
  const failed = new Set();
  const rotationState = new Map();

  const getAsset = (key) => assets?.[key] || null;

  async function loadBuffer(key) {
    const element = getAsset(key);
    const ctx = getContext?.();
    if (!element || !ctx || failed.has(key)) return null;
    const record = getRecord?.(element);
    if (record?.status === "error") {
      failed.add(key);
      return null;
    }
    if (buffers.has(key)) return buffers.get(key);
    if (loading.has(key)) return loading.get(key);

    const promise = fetch(element.src)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        buffers.set(key, buffer);
        loading.delete(key);
        return buffer;
      })
      .catch((error) => {
        loading.delete(key);
        failed.add(key);
        warn(`[T-Spin Traveler] SFX file fallback to synth: ${key}`, error);
        return null;
      });
    loading.set(key, promise);
    return promise;
  }

  function preloadEvent(name) {
    for (const key of eventMap[name] || []) {
      if (!buffers.has(key) && !loading.has(key) && !failed.has(key)) loadBuffer(key);
    }
  }

  function preloadAll() {
    for (const keys of Object.values(eventMap)) {
      for (const key of keys) {
        if (!buffers.has(key) && !loading.has(key) && !failed.has(key)) loadBuffer(key);
      }
    }
  }

  function play(name, { when = 0, volume = 1 } = {}) {
    const ctx = getContext?.();
    const destination = getDestination?.();
    if (!ctx || !destination) return false;
    const key = pickFileSfxAssetKey(name, rotationState, eventMap);
    if (!key) return false;
    const buffer = buffers.get(key);
    if (!buffer) {
      preloadEvent(name);
      return false;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = (mix[name] ?? 1) * volume;
    source.connect(gain);
    gain.connect(destination);
    source.start(when || ctx.currentTime);
    return true;
  }

  return {
    play,
    preloadAll,
    preloadEvent,
    getLoadedCount: () => buffers.size,
    getFailedCount: () => failed.size,
  };
}
