import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ tickets: businessDb.getTickets() });
}

export async function POST(req: NextRequest) {
   const { id, status } = await req.json();
   return NextResponse.json(businessDb.updateTicketStatus(id, status));
}
