import mongoose from 'mongoose';
import net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

const LOCAL_URI = 'mongodb://localhost:27017/somali-tutor';

function redactUri(uri: string) {
  try {
    const u = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    return u.hostname || 'MongoDB';
  } catch {
    return 'MongoDB';
  }
}

function localMongoAvailable() {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: 27017 }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(2000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function tryConnect(uri: string, timeoutMs: number) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
}

export async function connectDb() {
  let uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('somali-tutor');
    console.log('No MONGODB_URI set — using in-memory MongoDB (data resets on restart).');
    await tryConnect(uri, 15000);
    console.log('Connected to MongoDB');
    return;
  }

  console.log(`Connecting to MongoDB at ${redactUri(uri)}…`);

  try {
    await tryConnect(uri, 15000);
    console.log('Connected to MongoDB');
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (uri !== LOCAL_URI && (await localMongoAvailable())) {
      console.warn(`Primary MongoDB failed (${msg.slice(0, 80)}…)`);
      console.warn('Falling back to local MongoDB at mongodb://localhost:27017/somali-tutor');
      try {
        await mongoose.disconnect().catch(() => undefined);
        await tryConnect(LOCAL_URI, 8000);
        console.log('Connected to local MongoDB');
        return;
      } catch (localErr) {
        console.error('Local MongoDB fallback also failed.');
        throw localErr;
      }
    }

    if (msg.includes('bad auth') || uri.includes('<db_password>')) {
      console.error('\n❌ MongoDB Atlas: password is missing or wrong.');
      console.error('   Edit server/.env — replace <db_password> with your Atlas user password.');
      console.error('   Atlas → Database Access → your user → Edit password\n');
    }
    throw err;
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
