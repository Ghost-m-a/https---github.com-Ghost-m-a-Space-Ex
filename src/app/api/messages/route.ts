import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Conversation from "@/app/lib/models/Conversation";
import Message from "@/app/lib/models/Message";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// GET — list conversations
export async function GET(req: NextRequest) {
   const session = await requireUser(req);
   if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   await connectDB();

   const conversations = await Conversation.find({
      participants: session.userId,
   })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .populate("participants", "name email")
      .lean();

   const enriched = conversations.map((c: any) => {
      const other = c.participants.find(
         (p: any) => p._id.toString() !== session.userId,
      );
      const unreadMap = c.unreadCounts || {};
      const unread = unreadMap[session.userId] || 0;
      return {
         id: c._id.toString(),
         name: other?.name || "Unknown",
         email: other?.email || "",
         avatar: other?.name?.charAt(0).toUpperCase() || "?",
         lastMessage: c.lastMessage,
         timestamp: c.lastMessageAt,
         unread,
         isRequest: c.isRequest,
      };
   });

   return NextResponse.json({ conversations: enriched });
}

// POST — send message
export async function POST(req: NextRequest) {
   const session = await requireUser(req);
   if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   const { conversationId, text } = await req.json();
   if (!conversationId || !text?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
   }

   await connectDB();

   const conversation = await Conversation.findById(conversationId);
   if (!conversation) {
      return NextResponse.json(
         { error: "Conversation not found" },
         { status: 404 },
      );
   }
   if (
      !conversation.participants.some((p) => p.toString() === session.userId)
   ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
   }

   const message = await Message.create({
      conversationId,
      senderId: session.userId,
      text: text.trim(),
   });

   conversation.lastMessage = text.trim();
   conversation.lastMessageAt = new Date();
   await conversation.save();

   return NextResponse.json({
      message: {
         id: message._id.toString(),
         senderId: session.userId,
         text: message.text,
         createdAt: message.createdAt,
      },
   });
}
