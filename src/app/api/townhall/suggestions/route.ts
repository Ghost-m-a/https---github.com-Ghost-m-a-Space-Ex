import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/lib/models/User";
import Follow from "@/app/lib/models/Follow";
import Business from "@/app/lib/models/Business";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = token ? await verifySessionToken(token) : null;

      await connectDB();

      // Popular users (all users except self)
      const usersQuery = session ? { _id: { $ne: session.userId } } : {};
      const users = await User.find(usersQuery)
         .select("name username bio")
         .limit(12)
         .lean();

      // Who we follow
      let followingSet = new Set<string>();
      if (session) {
         const myFollows = await Follow.find({
            followerId: session.userId,
         }).lean();
         followingSet = new Set(myFollows.map((f) => f.followingId.toString()));
      }

      // Popular businesses
      const businesses = await Business.find({})
         .sort({ createdAt: -1 })
         .limit(10)
         .lean();

      return NextResponse.json({
         people: users.map((u) => ({
            id: u._id.toString(),
            name: u.name,
            username: u.username || u.name.toLowerCase().replace(/\s+/g, ""),
            avatar: u.name.charAt(0).toUpperCase(),
            bio: u.bio || "Creator on Space-Ex",
            isFollowing: followingSet.has(u._id.toString()),
         })),
         trending: businesses.map((b) => ({
            id: b._id.toString(),
            name: b.name,
            initial: b.initial,
            rating: 4.5 + Math.random() * 0.5,
            members: Math.floor(Math.random() * 900000) + 100000,
         })),
      });
   } catch (err) {
      console.error("[Suggestions GET]", err);
      return NextResponse.json({ people: [], trending: [] });
   }
}
