import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Notification from "@/app/lib/models/Notification";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   const session = await requireUser(req);
   if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   const url = new URL(req.url);
   const filter = url.searchParams.get("filter") || "all";

   await connectDB();

   const query: any = { userId: session.userId };
   if (filter === "mentions") query.kind = "mention";

   const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

   const unreadCount = await Notification.countDocuments({
      userId: session.userId,
      read: false,
   });

   return NextResponse.json({
      notifications: notifications.map((n) => ({
         id: n._id.toString(),
         kind: n.kind,
         title: n.title,
         body: n.body,
         href: n.href,
         read: n.read,
         createdAt: n.createdAt,
      })),
      unreadCount,
   });
}

export async function POST(req: NextRequest) {
   const session = await requireUser(req);
   if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   const { action, id } = await req.json();
   await connectDB();

   if (action === "mark-all-read") {
      await Notification.updateMany(
         { userId: session.userId, read: false },
         { $set: { read: true } },
      );
      return NextResponse.json({ success: true });
   }

   if (action === "mark-read" && id) {
      await Notification.updateOne(
         { _id: id, userId: session.userId },
         { $set: { read: true } },
      );
      return NextResponse.json({ success: true });
   }

   return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
