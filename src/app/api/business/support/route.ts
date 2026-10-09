import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import SupportChat from "@/models/SupportChat";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ chats: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";

      await connectDB();
      let business;
      if (businessId)
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      else
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      if (!business) return NextResponse.json({ chats: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (q) query.memberName = { $regex: q, $options: "i" };

      const chats = await SupportChat.find(query)
         .sort({ lastMessageAt: -1 })
         .limit(50)
         .lean();

      return NextResponse.json({
         chats: chats.map((c) => ({
            id: c._id.toString(),
            memberName: c.memberName,
            memberEmail: c.memberEmail,
            memberAvatar: c.memberAvatar,
            lastMessage: c.lastMessage,
            lastMessageAt: c.lastMessageAt,
            unread: c.unreadForAdmin,
            status: c.status,
         })),
      });
   } catch {
      return NextResponse.json({ chats: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, memberEmail, initialMessage } = await req.json();
      if (!businessId || !memberEmail)
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      await connectDB();
      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );

      const chat = await SupportChat.create({
         businessId: business._id,
         memberId: session.userId,
         memberName: memberEmail.split("@")[0],
         memberEmail,
         memberAvatar: memberEmail.charAt(0).toUpperCase(),
         lastMessage: initialMessage || "",
         messages: initialMessage
            ? [
                 {
                    senderId: session.userId,
                    senderName: "Admin",
                    senderRole: "admin",
                    text: initialMessage,
                 },
              ]
            : [],
      });

      return NextResponse.json({ chat: { id: chat._id.toString() } });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
