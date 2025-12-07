import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectToDatabase(uri) {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Disconnected from MongoDB');
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return db;
}
