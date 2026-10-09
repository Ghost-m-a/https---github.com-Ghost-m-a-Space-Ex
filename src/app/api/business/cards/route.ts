import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/lib/db";

export async function GET() {
   return NextResponse.json({ cards: businessDb.getCards() });
}

export async function POST(req: NextRequest) {
   const { id } = await req.json();
   return NextResponse.json(businessDb.toggleCardStatus(id));
}
