import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Follow from "@/app/lib/models/Follow";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { userId } = await req.json();
      if (!userId)
         return NextResponse.json(
            { error: "userId required" },
            { status: 400 },
         );
      if (userId === session.userId) {
         return NextResponse.json(
            { error: "Cannot follow yourself" },
            { status: 400 },
         );
      }

      await connectDB();

      const existing = await Follow.findOne({
         followerId: session.userId,
         followingId: userId,
      });

      if (existing) {
         await existing.deleteOne();
         return NextResponse.json({ following: false });
      }

      await Follow.create({
         followerId: session.userId,
         followingId: userId,
      });

      return NextResponse.json({ following: true });
   } catch (err) {
      console.error("[Follow POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
