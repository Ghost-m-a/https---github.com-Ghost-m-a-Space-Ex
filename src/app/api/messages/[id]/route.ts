import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Conversation from "@/app/lib/models/Conversation";
import Message from "@/app/lib/models/Message";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   const { id } = await params;
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   const session = await verifySessionToken(token);
   if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   await connectDB();

   const conversation = await Conversation.findById(id).populate(
      "participants",
      "name email",
   );
   if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
   }
   if (
      !conversation.participants.some(
         (p: any) => p._id.toString() === session.userId,
      )
   ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
   }

   const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

   // Mark as read
   const unreadCounts = conversation.unreadCounts as Map<string, number>;
   unreadCounts.set(session.userId, 0);
   await conversation.save();

   const other: any = conversation.participants.find(
      (p: any) => p._id.toString() !== session.userId,
   );

   return NextResponse.json({
      conversation: {
         id: conversation._id.toString(),
         name: other?.name || "Unknown",
         email: other?.email || "",
         avatar: other?.name?.charAt(0).toUpperCase() || "?",
      },
      messages: messages.map((m) => ({
         id: m._id.toString(),
         sender: m.senderId.toString() === session.userId ? "me" : "them",
         text: m.text,
         timestamp: m.createdAt,
      })),
   });
}
