import mongoose from 'mongoose';

const MONGODB_USERNAME = process.env.MONGODB_USERNAME?.trim();
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD?.trim();

if (!MONGODB_USERNAME || !MONGODB_PASSWORD) {
  throw new Error('Please define the MONGODB_USERNAME and MONGODB_PASSWORD environment variables inside .env');
}

const MONGODB_URI = `mongodb+srv://${encodeURIComponent(MONGODB_USERNAME)}:${encodeURIComponent(MONGODB_PASSWORD)}@cluster0.lhpykjw.mongodb.net/prompt-studio?retryWrites=true&w=majority`;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI || '', opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
