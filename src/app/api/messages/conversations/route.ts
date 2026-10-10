import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ conversations: [] }, { status: 401 });
      }

      const convos = await Conversation.find({
         participants: userId,
      })
         .sort({ lastMessageAt: -1 })
         .limit(50)
         .lean<any[]>();

      // Resolve participants' display info
      const otherIds = new Set<string>();
      convos.forEach((c) =>
         (c.participants ?? []).forEach((p: any) => {
            if (String(p) !== String(userId)) otherIds.add(String(p));
         }),
      );

      const users = await User.find({ _id: { $in: Array.from(otherIds) } })
         .select("name username avatarColor")
         .lean<any[]>();
      const userMap = new Map(users.map((u) => [String(u._id), u]));

      const conversations = convos.map((c) => {
         const others = (c.participants ?? [])
            .filter((p: any) => String(p) !== String(userId))
            .map((p: any) => {
               const u = userMap.get(String(p));
               return {
                  id: String(p),
                  name: u?.name ?? "Unknown",
                  username: u?.username ?? "",
                  avatarColor: u?.avatarColor ?? "#3b82f6",
               };
            });

         const primary = others[0];
         const unread = c.unreadCounts?.[String(userId)] ?? 0;

         return {
            id: String(c._id),
            participants: others,
            displayName:
               others.length > 1
                  ? `${primary?.name ?? "Group"} + ${others.length - 1}`
                  : (primary?.name ?? "Unknown"),
            displayAvatar: (primary?.name?.[0] ?? "?").toUpperCase(),
            avatarColor: primary?.avatarColor ?? "#3b82f6",
            lastMessage: c.lastMessage ?? "",
            lastMessageAt: c.lastMessageAt ?? c.createdAt,
            unread,
         };
      });

      return NextResponse.json({ conversations });
   } catch (err) {
      logError("GET /api/messages/conversations", err);
      return NextResponse.json({ conversations: [] }, { status: 500 });
   }
}
