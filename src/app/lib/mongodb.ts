import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

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

/**
 * Parse a MongoDB connection string robustly:
 *   mongodb+srv://user:pass@host/dbname?opt1=val1&opt2=val2
 * into:
 *   { base: "mongodb+srv://user:pass@host", dbName: "dbname", options: {...} }
 */
function parseMongoUri(rawUri: string) {
   // 1. Clean quotes and whitespace
   let uri = rawUri.trim().replace(/^["']|["']$/g, "");

   // 2. Ensure scheme is valid
   if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      throw new Error(
         `Invalid MongoDB URI scheme. Must start with "mongodb://" or "mongodb+srv://". Got: "${uri.substring(
            0,
            30,
         )}..."`,
      );
   }

   // 3. Split query string off
   const [beforeQuery, queryString] = uri.split("?");
   const query = queryString || "";

   // 4. Split database name off the path
   //    Base looks like: mongodb+srv://user:pass@host
   //    Path looks like: /dbname
   const match = beforeQuery.match(
      /^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/([^/]*))?$/,
   );
   if (!match) {
      throw new Error(`Failed to parse MongoDB URI. Got: "${beforeQuery}"`);
   }

   const base = match[1];
   const dbName = match[2] || undefined;

   // 5. Parse options into an object
   const options: Record<string, string | number | boolean> = {};
   if (query) {
      for (const pair of query.split("&")) {
         const [key, value = ""] = pair.split("=");
         if (!key) continue;

         // Handle special option types
         if (key === "retryWrites" || key === "retryReads") {
            options[key] = value === "true";
         } else if (key === "w" && value === "majority") {
            options[key] = "majority";
         } else if (key === "appName") {
            // App name is informational; mongoose doesn't need it
            continue;
         } else if (key === "authSource") {
            options[key] = value;
         } else {
            // Keep other options as strings
            options[key] = value;
         }
      }
   }

   return { base, dbName, options };
}

export async function connectDB() {
   if (!MONGODB_URI) {
      throw new Error(
         "MONGODB_URI is not set. Add it to Vercel → Settings → Environment Variables.",
      );
   }

   if (cached.conn) return cached.conn;

   if (!cached.promise) {
      console.log("[MongoDB] Parsing URI...");
      const { base, dbName, options } = parseMongoUri(MONGODB_URI);

      console.log("[MongoDB] Connecting...", {
         host: base.split("@")[1] || base,
         dbName: dbName || "(default)",
         options,
      });

      const start = Date.now();

      // ✅ Pass base URI + dbName as separate option
      cached.promise = mongoose
         .connect(base, {
            dbName: dbName || "space-ex",
            ...options,
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
