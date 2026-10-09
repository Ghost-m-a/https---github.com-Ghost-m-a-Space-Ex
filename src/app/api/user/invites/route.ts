import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TeamInvite from "@/models/TeamInvite";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const invites = await TeamInvite.find({
         userId: session.userId,
         status: "pending",
      })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         invites: invites.map((i) => ({
            id: i._id.toString(),
            companyName: i.companyName,
            companyAvatar: i.companyAvatar,
            invitedBy: i.invitedBy,
            role: i.role,
            createdAt: i.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Invites GET]", err);
      return NextResponse.json({ invites: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { id, action } = await req.json();
      if (!id || !["accept", "decline"].includes(action)) {
         return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 },
         );
      }

      await connectDB();
      await TeamInvite.findOneAndUpdate(
         { _id: id, userId: session.userId },
         { $set: { status: action === "accept" ? "accepted" : "declined" } },
      );

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error("[Invites POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
