export function stableSort<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const res = compare(a.item, b.item);
      return res !== 0 ? res : a.index - b.index;
    })
    .map((x) => x.item);
}

export function compareNumberAsc(a: number, b: number) {
  return a - b;
}

export function compareStringAsc(a: string, b: string) {
  return a.localeCompare(b);
}
