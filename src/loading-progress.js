// Resource readiness gates completion; cached loads still get a readable entrance.
export function loadingProgress(elapsed, assets, ready, reducedMotion = false) {
  const target = ready ? 100 : Math.min(94, Math.max(0, assets) * 100);
  const timeLimit = reducedMotion ? 100 : Math.max(0, elapsed) / 1200 * 100;
  return Math.min(target, timeLimit, 100);
}
