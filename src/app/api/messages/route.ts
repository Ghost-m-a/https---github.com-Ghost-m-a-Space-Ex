import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
   const conversations = db
      .getConversations()
      .map(({ messages, ...rest }) => rest);
   return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
   const body = await req.json();
   const { conversationId, text } = body;
   if (!conversationId || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
   }
   const message = db.addMessage(conversationId, text);
   return NextResponse.json(message);
}
