import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

function redactUri(uri: string) {
  try {
    const u = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    return u.hostname || 'MongoDB';
  } catch {
    return 'MongoDB';
  }
}

export async function connectDb() {
  let uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('somali-tutor');
    console.log('No MONGODB_URI set — using in-memory MongoDB (data resets on restart).');
  } else {
    console.log(`Connecting to MongoDB at ${redactUri(uri)}…`);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('bad auth') || uri.includes('<db_password>')) {
      console.error('\n❌ MongoDB Atlas: password is missing or wrong.');
      console.error('   Edit server/.env — replace <db_password> with your Atlas user password.');
      console.error('   Atlas → Database Access → mareibra92_db_user → Edit password\n');
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
