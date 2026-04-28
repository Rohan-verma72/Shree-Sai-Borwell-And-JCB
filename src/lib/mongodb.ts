import 'server-only';
import { MongoClient, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

// ── Connection cache for development (avoids exhausting connections on hot-reload) ──
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    throw new Error(
      'MONGODB_URI is not set. Add it to Vercel Environment Variables.',
    );
  }
  const client = await clientPromise;
  return client.db('shree-sai-db');
}
