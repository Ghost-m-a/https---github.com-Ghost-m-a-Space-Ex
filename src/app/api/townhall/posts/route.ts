import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import Follow from "@/models/Follow";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      const { searchParams } = new URL(req.url);
      const tab = (searchParams.get("tab") ?? "all") as
         | "all"
         | "following"
         | "joined";
      const limit = Math.min(50, Number(searchParams.get("limit") ?? 30));

      let filter: Record<string, any> = {};

      if (tab === "following" && userId) {
         const follows = await Follow.find({ followerId: userId })
            .select("followingId")
            .lean<any[]>();
         const ids = follows.map((f) => f.followingId);
         filter = { "author.id": { $in: ids } };
      }

      const posts = await Post.find(filter)
         .sort({ createdAt: -1 })
         .limit(limit)
         .lean<any[]>();

      return NextResponse.json({
         posts: posts.map((p) => ({
            id: String(p._id),
            author: p.author ?? {},
            forum: p.forum ?? "Public forum",
            content: p.content ?? "",
            media: p.media ?? null,
            stats: p.stats ?? {
               comments: 0,
               likes: 0,
               views: 0,
               shares: 0,
            },
            likedBy: (p.likedBy ?? []).map((x: any) => String(x)),
            createdAt: p.createdAt,
         })),
      });
   } catch (err) {
      logError("GET /api/townhall/posts", err);
      return NextResponse.json({ posts: [] }, { status: 500 });
   }
}

export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { content, forum } = body ?? {};

      if (!content || typeof content !== "string" || !content.trim()) {
         return NextResponse.json(
            { error: "Post content is required" },
            { status: 400 },
         );
      }

      const User = (await import("@/models/User")).default;
      const user = await User.findById(userId).lean<any>();
      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const post = await Post.create({
         author: {
            id: userId,
            name: user.name ?? "Anonymous",
            username: user.username ?? "",
            avatar: (user.name?.charAt(0) ?? "?").toUpperCase(),
            verified: false,
         },
         forum: forum ?? "Public forum",
         content: content.trim(),
         stats: { comments: 0, likes: 0, views: 0, shares: 0 },
         likedBy: [],
      });

      return NextResponse.json(
         { post: { ...post.toObject(), id: String(post._id) } },
         { status: 201 },
      );
   } catch (err) {
      logError("POST /api/townhall/posts", err);
      return NextResponse.json(
         { error: "Failed to create post" },
         { status: 500 },
      );
   }
}
