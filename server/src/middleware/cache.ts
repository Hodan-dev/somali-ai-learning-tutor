type CacheEntry = { body: string; status: number; expires: number };

const store = new Map<string, CacheEntry>();

export function getCachedJson(key: string): { status: number; body: string } | null {
  const hit = store.get(key);
  if (!hit || hit.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return { status: hit.status, body: hit.body };
}

export function setCachedJson(key: string, status: number, body: string, ttlMs: number) {
  store.set(key, { status, body, expires: Date.now() + ttlMs });
}

export function cacheKey(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(':');
}

/** Express middleware: cache GET JSON responses for authenticated users. */
export function cacheJson(ttlMs: number) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = cacheKey([req.path, req.user?.id, req.originalUrl.split('?')[1]]);
    const hit = getCachedJson(key);
    if (hit) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/json');
      return res.status(hit.status).send(hit.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serialized = JSON.stringify(body);
        setCachedJson(key, res.statusCode, serialized, ttlMs);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(body);
    };

    next();
  };
}
