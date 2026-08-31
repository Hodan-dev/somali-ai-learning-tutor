import { execSync } from 'child_process';
import net from 'net';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/somali-tutor';
const host = '127.0.0.1';
const port = 27017;

function portOpen() {
  return new Promise((resolve) => {
    const s = net.createConnection({ host, port }, () => {
      s.end();
      resolve(true);
    });
    s.on('error', () => resolve(false));
    s.setTimeout(1500, () => {
      s.destroy();
      resolve(false);
    });
  });
}

function hasDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await portOpen()) {
    console.log('MongoDB is running on localhost:27017');
    return;
  }

  console.log('MongoDB not detected on localhost:27017 — starting…');

  if (hasDocker()) {
    execSync('docker compose up -d mongo', { stdio: 'inherit', cwd: new URL('../..', import.meta.url) });
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await portOpen()) {
        console.log('MongoDB started via Docker. Compass: mongodb://localhost:27017/');
        return;
      }
    }
  }

  try {
    execSync('pgrep mongod', { stdio: 'ignore' });
  } catch {
    try {
      execSync('sudo mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db', { stdio: 'ignore' });
      await new Promise((r) => setTimeout(r, 2000));
      if (await portOpen()) {
        console.log('MongoDB started. Compass: mongodb://localhost:27017/');
        return;
      }
    } catch {
      /* ignore */
    }
  }

  console.warn(`
⚠️  MongoDB is not running on localhost:27017

Compass connection string: mongodb://localhost:27017/

Windows fix:
  1. Install MongoDB Community Server (mongodb.com/try/download/community)
  2. Start "MongoDB Server" in services.msc
  OR run: npm run db   (requires Docker Desktop)

Then open Compass and connect to: mongodb://localhost:27017/
`);
}

main().catch(console.error);
