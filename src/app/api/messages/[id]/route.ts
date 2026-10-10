import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
   _req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;
      if (!mongoose.isValidObjectId(id)) {
         return NextResponse.json(
            { error: "Invalid conversation" },
            { status: 400 },
         );
      }

      const convo = await Conversation.findById(id).lean<any>();
      if (!convo) {
         return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const isParticipant = (convo.participants ?? []).some(
         (p: any) => String(p) === String(userId),
      );
      if (!isParticipant) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Mark as read
      const unreadCounts = { ...(convo.unreadCounts ?? {}) };
      if (unreadCounts[String(userId)]) {
         unreadCounts[String(userId)] = 0;
         await Conversation.findByIdAndUpdate(id, { unreadCounts });
      }

      const messages = await Message.find({ conversationId: id })
         .sort({ createdAt: 1 })
         .lean<any[]>();

      const senderIds = new Set<string>();
      messages.forEach((m) => senderIds.add(String(m.senderId)));

      const users = await User.find({
         _id: { $in: Array.from(senderIds) },
      })
         .select("name avatarColor")
         .lean<any[]>();
      const userMap = new Map(users.map((u) => [String(u._id), u]));

      return NextResponse.json({
         conversation: {
            id: String(convo._id),
            participants: convo.participants,
         },
         messages: messages.map((m) => {
            const u = userMap.get(String(m.senderId));
            return {
               id: String(m._id),
               senderId: String(m.senderId),
               senderName: u?.name ?? "Unknown",
               senderAvatar: (u?.name?.[0] ?? "?").toUpperCase(),
               senderColor: u?.avatarColor ?? "#3b82f6",
               text: m.text ?? "",
               isMine: String(m.senderId) === String(userId),
               createdAt: m.createdAt,
            };
         }),
      });
   } catch (err) {
      logError("GET /api/messages/[id]", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}

export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;
      if (!mongoose.isValidObjectId(id)) {
         return NextResponse.json(
            { error: "Invalid conversation" },
            { status: 400 },
         );
      }

      const body = await req.json();
      const text = (body?.text ?? "").trim();
      if (!text) {
         return NextResponse.json(
            { error: "Message cannot be empty" },
            { status: 400 },
         );
      }

      const convo = await Conversation.findById(id);
      if (!convo) {
         return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const isParticipant = (convo.participants ?? []).some(
         (p: any) => String(p) === String(userId),
      );
      if (!isParticipant) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const message = await Message.create({
         conversationId: id,
         senderId: userId,
         text,
      });

      convo.lastMessage = text;
      convo.lastMessageAt = new Date();

      // Increment unread for every other participant
      const unreadCounts = { ...(convo.unreadCounts ?? {}) };
      for (const p of convo.participants ?? []) {
         const pid = String(p);
         if (pid !== String(userId)) {
            unreadCounts[pid] = (unreadCounts[pid] ?? 0) + 1;
         }
      }
      convo.unreadCounts = unreadCounts;
      await convo.save();

      return NextResponse.json(
         { message: { ...message.toObject(), id: String(message._id) } },
         { status: 201 },
      );
   } catch (err) {
      logError("POST /api/messages/[id]", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
