export function clampIndex(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function removeFromArray<T>(arr: T[], item: T): T[] {
  const idx = arr.indexOf(item);
  if (idx === -1) return arr;
  const next = [...arr];
  next.splice(idx, 1);
  return next;
}

export function insertIntoArray<T>(arr: T[], item: T, index: number): T[] {
  const next = [...arr];
  const i = clampIndex(index, 0, next.length);
  next.splice(i, 0, item);
  return next;
}
