import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Post from "@/app/lib/models/Post";
import Follow from "@/app/lib/models/Follow";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// =========================================
// GET — list posts (with tab filter)
// =========================================
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      const url = new URL(req.url);
      const tab = url.searchParams.get("tab") || "all";

      await connectDB();

      let query: Record<string, unknown> = { visibility: "public" };

      if (session && tab === "following") {
         const follows = await Follow.find({
            followerId: session.userId,
         }).lean();
         const followingIds = follows.map((f) => f.followingId);
         query["author.id"] = { $in: followingIds };
      }

      if (session && tab === "joined") {
         // For now, "joined" = posts from people we follow OR our own
         const follows = await Follow.find({
            followerId: session.userId,
         }).lean();
         const ids = follows.map((f) => f.followingId);
         ids.push(session.userId as any);
         query["author.id"] = { $in: ids };
      }

      const posts = await Post.find(query)
         .sort({ createdAt: -1 })
         .limit(30)
         .lean();

      // Enrich with "isFollowing" info for each author
      let followingSet = new Set<string>();
      if (session) {
         const myFollows = await Follow.find({
            followerId: session.userId,
         }).lean();
         followingSet = new Set(myFollows.map((f) => f.followingId.toString()));
      }

      return NextResponse.json({
         posts: posts.map((p) => ({
            id: p._id.toString(),
            author: {
               id: p.author.id.toString(),
               name: p.author.name,
               username: p.author.username,
               avatar: p.author.avatar,
               verified: p.author.verified,
               businessName: p.author.businessName || "",
            },
            forum: p.forum,
            content: p.content,
            media: p.media?.url ? p.media : undefined,
            stats: p.stats,
            createdAt: p.createdAt,
            isFollowing: followingSet.has(p.author.id.toString()),
            liked: session
               ? p.likedBy?.some((id) => id.toString() === session.userId)
               : false,
         })),
      });
   } catch (err) {
      console.error("[Townhall GET]", err);
      return NextResponse.json({ posts: [] });
   }
}

// =========================================
// POST — create a post
// =========================================
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { content, businessId, businessName } = await req.json();

      if (!content?.trim()) {
         return NextResponse.json(
            { error: "Content is required" },
            { status: 400 },
         );
      }

      await connectDB();

      const user = await User.findById(session.userId)
         .select("name username")
         .lean();
      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const post = await Post.create({
         author: {
            id: user._id,
            name: user.name,
            username:
               user.username || user.name.toLowerCase().replace(/\s+/g, ""),
            avatar: user.name.charAt(0).toUpperCase(),
            verified: false,
            businessId: businessId || undefined,
            businessName: businessName || "",
         },
         forum: businessName || "Public forum",
         content: content.trim(),
         stats: { comments: 0, likes: 0, views: 0, shares: 0 },
         likedBy: [],
         visibility: "public",
      });

      return NextResponse.json({
         post: {
            id: post._id.toString(),
            content: post.content,
            createdAt: post.createdAt,
         },
      });
   } catch (err) {
      console.error("[Townhall POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
