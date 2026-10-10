import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ user: null });
      }

      await connectDB();

      const user = await User.findById(userId)
         .select("name email username avatar avatarColor bio")
         .lean<any>();

      if (!user) {
         return NextResponse.json({ user: null });
      }

      return NextResponse.json({
         user: {
            id: String(user._id),
            name: user.name ?? "",
            email: user.email ?? "",
            username: user.username ?? "",
            avatar: user.avatar ?? "",
            avatarColor: user.avatarColor ?? "#3b82f6",
            bio: user.bio ?? "",
         },
      });
   } catch (err) {
      console.error("[GET /api/auth/me]", err);
      return NextResponse.json({ user: null }, { status: 500 });
   }
}
