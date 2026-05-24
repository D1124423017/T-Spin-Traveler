export function holdPieceState(state, createPiece) {
  if (!state.active || !state.canHold) return { ...state, held: false };

  const current = state.active.type;
  if (!state.hold) {
    const [nextType, ...queue] = state.queue;
    return {
      ...state,
      hold: current,
      active: createPiece(nextType),
      queue,
      canHold: false,
      held: true,
    };
  }

  return {
    ...state,
    hold: current,
    active: createPiece(state.hold),
    canHold: false,
    held: true,
  };
}

export function resetHoldAfterPlacement(state) {
  return { ...state, canHold: true };
}
