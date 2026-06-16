function normalizePanelCount(panelsOrCount) {
  if (Array.isArray(panelsOrCount)) return panelsOrCount.length;
  return Math.max(0, Math.floor(Number(panelsOrCount) || 0));
}

function clampPanelIndex(index, totalPanels) {
  if (totalPanels <= 0) return 0;
  const parsed = Math.floor(Number(index) || 0);
  return Math.max(0, Math.min(totalPanels - 1, parsed));
}

export function createStoryProgressState({
  sceneId = "",
  runMode = "endless",
  totalPanels = 0,
  panelIndex = 0,
  completed = false,
  skipped = false,
  startedAt = 0,
} = {}) {
  const normalizedTotal = normalizePanelCount(totalPanels);
  return {
    sceneId,
    runMode,
    panelIndex: clampPanelIndex(panelIndex, normalizedTotal),
    totalPanels: normalizedTotal,
    completed: Boolean(completed),
    skipped: Boolean(skipped),
    startedAt,
  };
}

export function getCurrentStoryPanel(progress, panels = []) {
  if (!progress || panels.length === 0) return null;
  return panels[clampPanelIndex(progress.panelIndex, panels.length)] || null;
}

export function getStoryPanelProgress(progress, panelsOrCount = progress?.totalPanels || 0) {
  const totalPanels = normalizePanelCount(panelsOrCount);
  const panelIndex = clampPanelIndex(progress?.panelIndex || 0, totalPanels);
  return {
    current: totalPanels > 0 ? panelIndex + 1 : 0,
    total: totalPanels,
    panelIndex,
  };
}

export function advanceStoryProgress(progress, panelsOrCount = progress?.totalPanels || 0) {
  const totalPanels = normalizePanelCount(panelsOrCount);
  if (!progress || totalPanels <= 0) {
    return {
      progress: createStoryProgressState({ ...progress, totalPanels, completed: true }),
      completed: true,
    };
  }

  const currentIndex = clampPanelIndex(progress.panelIndex, totalPanels);
  if (currentIndex >= totalPanels - 1) {
    return {
      progress: {
        ...progress,
        panelIndex: currentIndex,
        totalPanels,
        completed: true,
      },
      completed: true,
    };
  }

  return {
    progress: {
      ...progress,
      panelIndex: currentIndex + 1,
      totalPanels,
      completed: false,
    },
    completed: false,
  };
}

export function skipStoryProgress(progress) {
  return {
    ...(progress || createStoryProgressState()),
    completed: true,
    skipped: true,
  };
}
