import mongoose, { Connection } from '@digitaldefiance/mongoose-types';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | undefined;
let connection: Connection | undefined;

/**
 * Connect to in-memory MongoDB for testing
 * @returns Object with both the connection and URI
 */
export async function connectMemoryDB(): Promise<{
  connection: Connection;
  uri: string;
}> {
  // If mongoose is connected but we don't have our server, disconnect first
  if (mongoose.connection.readyState !== 0 && !mongoServer) {
    await mongoose.disconnect();
    connection = undefined;
  }

  // Create new server if needed
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  const uri = mongoServer.getUri();

  // Connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  connection = mongoose.connection;

  return { connection, uri };
}

/**
 * Drop all collections and disconnect
 */
export async function disconnectMemoryDB(): Promise<void> {
  if (connection) {
    await connection.dropDatabase();
    await mongoose.disconnect();
    connection = undefined;
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = undefined;
  }
}

/**
 * Clear all collections without disconnecting
 */
export async function clearMemoryDB(): Promise<void> {
  if (connection) {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
