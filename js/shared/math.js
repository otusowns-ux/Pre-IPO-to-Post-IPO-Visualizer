export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
