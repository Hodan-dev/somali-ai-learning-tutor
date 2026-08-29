import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Express } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function attachClientCache(app: Express) {
  const clientDist = path.join(__dirname, '..', '..', '..', 'client', 'dist');
  if (!fs.existsSync(clientDist)) return false;

  // Vite hashed assets — cache for 1 year
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      maxAge: '1y',
      immutable: true,
      etag: true,
    })
  );

  // Other static files (favicon, manifest, sw)
  app.use(
    express.static(clientDist, {
      maxAge: '1h',
      etag: true,
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );

  // SPA fallback — never cache HTML shell
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  return true;
}
