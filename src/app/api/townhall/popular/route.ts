import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const users = await User.find()
         .sort({ createdAt: -1 })
         .limit(12)
         .select("name username avatarColor")
         .lean<any[]>();

      return NextResponse.json({
         users: users.map((u) => ({
            id: String(u._id),
            name: u.name ?? "Anonymous",
            username: u.username ?? "",
            avatarColor: u.avatarColor ?? "#3b82f6",
            subtitle: "Creator on Space-Ex",
         })),
      });
   } catch (err) {
      logError("GET /api/townhall/popular", err);
      return NextResponse.json({ users: [] }, { status: 500 });
   }
}
