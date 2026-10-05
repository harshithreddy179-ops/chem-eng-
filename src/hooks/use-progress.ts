"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, setCompleted, subscribe } from "@/lib/progress/store";
import { percent } from "@/lib/utils";

const subscribeNoop = () => () => {};

/** True after the first client render — avoids hydration mismatches. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useCompletedSet() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether one item is complete, plus a setter. */
export function useItemProgress(key: string) {
  const set = useCompletedSet();
  const done = set.has(key);
  return [done, (value: boolean) => setCompleted(key, value)] as const;
}

/**
 * Aggregate progress across a list of trackable keys.
 * Only real, existing items are counted — stale keys for deleted
 * content are ignored because they aren't in `keys`.
 */
export function useProgress(keys: readonly string[]) {
  const set = useCompletedSet();
  const hydrated = useHydrated();
  return useMemo(() => {
    const total = keys.length;
    const done = hydrated ? keys.reduce((n, k) => n + (set.has(k) ? 1 : 0), 0) : 0;
    return { done, total, percent: percent(done, total), hydrated };
  }, [keys, set, hydrated]);
}
