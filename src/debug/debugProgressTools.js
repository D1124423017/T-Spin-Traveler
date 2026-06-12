export const DEBUG_RIFT_ENERGY_GRANT = 10000;

export function createDebugProgressTools({
  state,
  loadMetaProgress,
  saveMetaProgress,
  grantRiftEnergy,
  amount = DEBUG_RIFT_ENERGY_GRANT,
} = {}) {
  function addRiftEnergy() {
    const next = grantRiftEnergy(loadMetaProgress(), amount);
    state.metaProgress = next;
    saveMetaProgress(next);
    return next.riftEnergy;
  }

  return {
    addRiftEnergy,
  };
}
