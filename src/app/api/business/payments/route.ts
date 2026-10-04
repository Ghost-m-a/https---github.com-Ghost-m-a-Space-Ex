import { NextResponse } from "next/server";
import { businessDb } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ payments: businessDb.getPayments() });
}
