import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ businesses: db.getDiscoveredBusinesses() });
}
