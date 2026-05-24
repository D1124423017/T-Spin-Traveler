export function getTraitStageFromCount(count, breakpoints = [2, 4, 6]) {
  let stage = 0;
  for (const breakpoint of breakpoints) {
    if (count >= breakpoint) stage += 1;
  }
  return stage;
}
