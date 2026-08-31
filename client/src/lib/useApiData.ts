import { useEffect, useState } from 'react';
import { api } from './api';

type CacheEntry = { data: unknown; ts: number };

const cache = new Map<string, CacheEntry>();
const TTL_MS = 2 * 60 * 1000;

function readCache<T>(path: string): T | null {
  const hit = cache.get(path);
  if (!hit || Date.now() - hit.ts > TTL_MS) return null;
  return hit.data as T;
}

export function useApiData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(() => (path ? readCache<T>(path) : null));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => (path ? !readCache<T>(path) : false));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) return;

    const cached = readCache<T>(path);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;

    api<T>(path)
      .then((result) => {
        if (cancelled) return;
        cache.set(path, { data: result, ts: Date.now() });
        setData(result);
        setError('');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  const refetch = () => {
    if (path) cache.delete(path);
    setReloadKey((k) => k + 1);
  };

  return { data, loading, error, refetch };
}

export function clearApiCache(path?: string) {
  if (path) cache.delete(path);
  else cache.clear();
}

export async function prefetchApi<T>(path: string) {
  if (readCache<T>(path)) return;
  try {
    const result = await api<T>(path);
    cache.set(path, { data: result, ts: Date.now() });
  } catch {
    /* prefetch is best-effort */
  }
}

export function prefetchStudentData() {
  void prefetchApi('/api/progress');
  void prefetchApi('/api/courses');
  void prefetchApi('/api/profile');
}
