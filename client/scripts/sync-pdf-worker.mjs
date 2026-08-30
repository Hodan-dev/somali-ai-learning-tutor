import { copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, '..', 'node_modules', 'react-pdf', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const dest = join(root, '..', 'public', 'pdf.worker.min.mjs');

if (!existsSync(src)) {
  console.warn('pdf.worker.min.mjs source not found — skip sync');
  process.exit(0);
}

copyFileSync(src, dest);
console.log('Synced pdf.worker.min.mjs to public/');
