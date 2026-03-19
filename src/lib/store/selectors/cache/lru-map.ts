export type LRUMap<K, V> = {
  get: (k: K) => V | undefined;
  set: (k: K, v: V) => void;
};

export function createLRUMap<K, V>(maxSize: number): LRUMap<K, V> {
  const map = new Map<K, V>();

  return {
    get: (k) => map.get(k),
    set: (k, v) => {
      if (map.has(k)) map.delete(k);
      else if (map.size >= maxSize) map.delete(map.keys().next().value!);
      map.set(k, v);
    },
  };
}
