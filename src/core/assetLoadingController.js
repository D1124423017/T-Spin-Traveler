export function getAssetLoadingTransition({
  loadingDone,
  completingAt = 0,
  startedAt,
  now,
  summary,
  criticalReadiness,
  minMs,
  maxMs,
  completionDelayMs = 0,
  isComplete,
} = {}) {
  const elapsed = Math.max(0, now - startedAt);
  const criticalReady = criticalReadiness?.ready ?? (summary?.loading || 0) === 0;
  const loadingComplete = isComplete(summary, elapsed, { minMs, maxMs, criticalReady });
  const completionStartedAt = completingAt || (loadingComplete ? now : 0);
  const completionElapsed = completionStartedAt ? Math.max(0, now - completionStartedAt) : 0;
  return {
    completed: !loadingDone && loadingComplete && completionElapsed >= completionDelayMs,
    loadingComplete,
    completionStartedAt,
    completionElapsed,
    criticalReadiness,
    elapsed,
    summary,
  };
}

export function createStartupAssetScheduler({
  criticalIds = [],
  maxWaitMs,
  maxConcurrent = Infinity,
  scheduleTimeout = setTimeout,
  cancelTimeout = clearTimeout,
} = {}) {
  const pending = new Set(criticalIds);
  const deferred = [];
  const deferredMedia = [];
  const active = new Set();
  let released = pending.size === 0;
  let timeout = null;

  function drain() {
    if (!released) return;
    while (deferred.length && active.size < maxConcurrent) {
      const { id, start } = deferred.shift();
      active.add(id);
      start();
    }
  }

  function release() {
    if (released) return;
    released = true;
    if (timeout !== null) cancelTimeout(timeout);
    timeout = null;
    drain();
    for (const start of deferredMedia.splice(0)) start();
  }

  function enqueue(id, start, { unbounded = false, priority = 0 } = {}) {
    if (!released && timeout === null && Number.isFinite(maxWaitMs)) {
      timeout = scheduleTimeout(release, maxWaitMs);
      timeout?.unref?.();
    }
    if (pending.has(id)) {
      start();
    } else if (unbounded) {
      // Media manages its own range requests; don't occupy image queue slots.
      if (released) start();
      else deferredMedia.push(start);
    } else {
      deferred.push({ id, start, priority });
      deferred.sort((left, right) => right.priority - left.priority);
      drain();
    }
  }

  function settled(id) {
    pending.delete(id);
    active.delete(id);
    if (pending.size === 0) release();
    drain();
  }

  return { enqueue, settled };
}

export function createAssetLoadingController({
  state,
  getSummary,
  getCriticalReadiness,
  minMs,
  maxMs,
  completionDelayMs = 0,
  isComplete,
  onCompleted,
  now = () => performance.now(),
} = {}) {
  return function updateAssetLoading(currentTime = now()) {
    if (state.assetLoadingDone) return false;
    const summary = getSummary();
    const criticalReadiness = getCriticalReadiness?.();
    const transition = getAssetLoadingTransition({
      loadingDone: state.assetLoadingDone,
      completingAt: state.assetLoadingCompletingAt || 0,
      startedAt: state.assetLoadingStartedAt,
      now: currentTime,
      summary,
      criticalReadiness,
      minMs,
      maxMs,
      completionDelayMs,
      isComplete,
    });
    if (completionDelayMs > 0 && transition.loadingComplete && !state.assetLoadingCompletingAt) {
      state.assetLoadingCompletingAt = transition.completionStartedAt;
      return false;
    }
    if (!transition.completed) return false;
    state.assetLoadingDone = true;
    state.assetLoadingCompletedAt = currentTime;
    state.menuRevealStartedAt = currentTime;
    onCompleted?.(transition);
    return true;
  };
}
