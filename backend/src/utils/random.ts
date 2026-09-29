export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 1): number {
  const value = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Nudges a value by a small random delta and clamps it into range,
 *  producing gradual, plausible drift instead of jumpy random noise. */
export function drift(current: number, maxDelta: number, min: number, max: number): number {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  return clamp(Math.round((current + delta) * 10) / 10, min, max);
}

/** Returns true with the given probability (0-1). */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}

export function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}
