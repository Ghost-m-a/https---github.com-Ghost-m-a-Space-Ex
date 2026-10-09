import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();

      const post = await Post.findById(id);
      if (!post)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const userId = session.userId;
      const alreadyLiked = post.likedBy.some((x) => x.toString() === userId);

      if (alreadyLiked) {
         post.likedBy = post.likedBy.filter((x) => x.toString() !== userId);
         post.stats.likes = Math.max(0, post.stats.likes - 1);
      } else {
         post.likedBy.push(userId as any);
         post.stats.likes += 1;
      }

      await post.save();

      return NextResponse.json({
         liked: !alreadyLiked,
         likes: post.stats.likes,
      });
   } catch (err) {
      console.error("[Like POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
