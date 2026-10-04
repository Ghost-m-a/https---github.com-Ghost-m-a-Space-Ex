import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const { id } = await params;
   const conversation = db.getConversation(id);
   if (!conversation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
   return NextResponse.json(conversation);
}
