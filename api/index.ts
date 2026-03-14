import mongoose from 'mongoose';
import app from '../src/app';

// ── MongoDB Connection (Vercel-optimized with caching) ─────────
interface CachedConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) global.mongooseCache = cached;

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const dbUrl = process.env.DATABASE_URL || '';
        cached.promise = mongoose.connect(dbUrl, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

// Connect on first request
connectDB().catch(console.error);

// Export the Express app for Vercel
export default app;
