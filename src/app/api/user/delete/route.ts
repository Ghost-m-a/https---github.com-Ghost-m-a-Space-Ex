import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import PaymentMethod from "@/models/PaymentMethod";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const uid = session.userId;

      await Promise.all([
         User.findByIdAndDelete(uid),
         Conversation.deleteMany({ participants: uid }),
         Message.deleteMany({ senderId: uid }),
         Notification.deleteMany({ userId: uid }),
         PaymentMethod.deleteMany({ userId: uid }),
      ]);

      const res = NextResponse.json({ success: true });
      res.cookies.set(SESSION_COOKIE_NAME, "", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 0,
         path: "/",
      });
      return res;
   } catch (err) {
      console.error("[Delete Account]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
