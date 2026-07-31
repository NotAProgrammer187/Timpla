/**
 * useAsyncQuery.ts — runs a promise-returning function and tracks its result.
 *
 * Most read paths use drizzle's `useLiveQuery`, but the stats helpers compose several
 * queries into one aggregate and so return plain promises. Rather than have every
 * screen hand-roll the same `useEffect` + cancellation dance, feature folders wrap
 * those helpers with this.
 *
 * Deliberately framework-free in the sense STRUCTURE.md rule 1 cares about: it imports
 * React and nothing else — no React Native, no db client, no network.
 */
import { useCallback, useEffect, useState } from 'react';

export interface AsyncQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  /** Re-runs the query — for callers that write and then need fresh aggregates. */
  refetch: () => void;
}

interface Settled<T> {
  data: T | undefined;
  error: Error | undefined;
  /** Which `key` produced this result; compared against the current key to derive `loading`. */
  key: string;
}

export function useAsyncQuery<T>(query: () => Promise<T>, deps: readonly unknown[] = []): AsyncQueryResult<T> {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ data: undefined, error: undefined, key: '' });

  // Deps are always primitives here (ids, counts, change tokens), so this is a stable
  // identity for "which run are we on".
  const key = JSON.stringify([nonce, ...deps]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    query()
      .then((data) => {
        if (!cancelled) setSettled({ data, error: undefined, key });
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setSettled({
            data: undefined,
            error: cause instanceof Error ? cause : new Error(String(cause)),
            key,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // `query` is intentionally excluded — callers pass inline closures that change
    // identity every render. `key` encodes the caller's explicit dependency list,
    // which is what actually decides when a re-fetch is warranted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: settled.data,
    error: settled.error,
    // Derived rather than stored, so the effect never has to setState synchronously.
    loading: settled.key !== key,
    refetch,
  };
}
