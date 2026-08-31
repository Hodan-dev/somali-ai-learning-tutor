import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDb() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('somali-tutor');
    console.log('No MONGODB_URI set — using in-memory MongoDB for this session.');
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
