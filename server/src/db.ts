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

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
