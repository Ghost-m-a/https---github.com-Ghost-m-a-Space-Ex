import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ ads: businessDb.getAds() });
}

export async function POST(req: NextRequest) {
   const { id } = await req.json();
   return NextResponse.json(businessDb.toggleAdStatus(id));
}
