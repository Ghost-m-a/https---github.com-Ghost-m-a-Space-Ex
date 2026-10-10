import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ count: 0 });
      }

      const conversations = await Conversation.find({
         participants: userId,
      })
         .select("unreadCounts")
         .lean<any[]>();

      const count = conversations.reduce((sum, c) => {
         const n = c.unreadCounts?.[String(userId)];
         return sum + (typeof n === "number" ? n : 0);
      }, 0);

      return NextResponse.json({ count });
   } catch (err) {
      logError("GET /api/messages/unread-count", err);
      return NextResponse.json({ count: 0 }, { status: 500 });
   }
}
