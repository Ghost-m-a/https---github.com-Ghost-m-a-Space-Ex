import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
   const checks: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      mongoUriPrefix: process.env.MONGODB_URI
         ? process.env.MONGODB_URI.substring(0, 30) + "..."
         : null,
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
   };

   try {
      const start = Date.now();
      await connectDB();
      checks.mongoConnected = true;
      checks.mongoLatencyMs = Date.now() - start;
      checks.mongoState = mongoose.connection.readyState;
      checks.mongoDatabase = mongoose.connection.name;

      if (mongoose.connection.db) {
         await mongoose.connection.db.admin().ping();
         checks.mongoPing = "ok";
      }
   } catch (e: unknown) {
      checks.mongoConnected = false;
      checks.mongoError = e instanceof Error ? e.message : String(e);
   }

   return NextResponse.json(checks, { status: 200 });
}
