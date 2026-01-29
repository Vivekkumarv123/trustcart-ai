import mongoose, { ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * 1️⃣ Define the interface for our cached object
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * 2️⃣ Properly type the global scope
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/**
 * 3️⃣ Initialize or retrieve the cache
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      connectTimeoutMS: 10_000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30_000,
      retryWrites: true,
      retryReads: true,
      heartbeatFrequencyMS: 10_000,
      readPreference: 'primary',
    };

    // We use MONGODB_URI! to tell TS we know it's a string here
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected');
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null; // Reset promise on failure so next attempt tries again
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;