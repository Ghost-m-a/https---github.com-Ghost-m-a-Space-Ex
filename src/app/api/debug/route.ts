import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
   const uri = process.env.MONGODB_URI || "";

   // Show every character code of the URI to reveal hidden characters
   const uriBytes = Array.from(uri)
      .slice(0, 200)
      .map((c, i) => `${i}:${c.charCodeAt(0)}`)
      .join(" ");

   const checks: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,

      // Raw URI info
      hasMongoUri: Boolean(uri),
      uriLength: uri.length,
      uriFull: uri, // ⚠️ temporary — remove after debugging

      // Character analysis
      first20Chars: uri.substring(0, 20),
      last20Chars: uri.substring(Math.max(0, uri.length - 20)),
      hasLeadingSpace: uri !== uri.trimStart(),
      hasTrailingSpace: uri !== uri.trimEnd(),
      hasQuotes: uri.startsWith('"') || uri.startsWith("'"),
      hasNewline: /[\r\n]/.test(uri),
      hasTab: /\t/.test(uri),
      byteCodes: uriBytes,

      // Env sanity
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
   };

   // Try to actually connect
   try {
      const start = Date.now();

      // ⚠️ Pass the FULL URI — no parsing, no dbName option
      await mongoose.connect(uri, {
         bufferCommands: false,
         serverSelectionTimeoutMS: 10000,
      });

      checks.mongoConnected = true;
      checks.mongoLatencyMs = Date.now() - start;
      checks.mongoState = mongoose.connection.readyState;
      checks.mongoDatabase = mongoose.connection.name;
      checks.mongoHost = mongoose.connection.host;

      if (mongoose.connection.db) {
         await mongoose.connection.db.admin().ping();
         checks.mongoPing = "ok";
      }

      await mongoose.disconnect();
   } catch (e: unknown) {
      checks.mongoConnected = false;
      checks.mongoError = e instanceof Error ? e.message : String(e);
   }

   return NextResponse.json(checks, { status: 200 });
}
