import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// 🔍 DEBUG: Log what we actually loaded
console.log("[MongoDB] URI loaded:", {
   exists: Boolean(MONGODB_URI),
   length: MONGODB_URI?.length,
   firstChars: MONGODB_URI?.substring(0, 30),
   lastChars: MONGODB_URI?.slice(-10),
   hasQuotes: MONGODB_URI?.startsWith('"') || MONGODB_URI?.startsWith("'"),
   hasWhitespace: MONGODB_URI !== MONGODB_URI?.trim(),
});

interface MongooseCache {
   conn: typeof mongoose | null;
   promise: Promise<typeof mongoose> | null;
}

declare global {
   // eslint-disable-next-line no-var
   var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
   conn: null,
   promise: null,
};
global.mongooseCache = cached;

export async function connectDB() {
   if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables.");
   }

   // ✅ Clean the URI — remove quotes and trim whitespace
   const cleanUri = MONGODB_URI.trim().replace(/^["']|["']$/g, "");

   if (
      !cleanUri.startsWith("mongodb://") &&
      !cleanUri.startsWith("mongodb+srv://")
   ) {
      throw new Error(
         `Invalid MONGODB_URI — must start with "mongodb://" or "mongodb+srv://". Got: "${cleanUri.substring(0, 40)}..."`,
      );
   }

   if (cached.conn) return cached.conn;

   if (!cached.promise) {
      console.log("[MongoDB] Connecting...");
      const start = Date.now();

      cached.promise = mongoose
         .connect(cleanUri, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
         })
         .then((m) => {
            console.log(`[MongoDB] Connected in ${Date.now() - start}ms`);
            return m;
         })
         .catch((err) => {
            console.error("[MongoDB] Connection failed:", err.message);
            cached.promise = null;
            throw err;
         });
   }

   try {
      cached.conn = await cached.promise;
   } catch (e) {
      cached.promise = null;
      throw e;
   }

   return cached.conn;
}
