import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({
      posts: db.getPosts(),
      popularUsers: db.getPopularUsers(),
   });
}

export async function POST(req: NextRequest) {
   const body = await req.json();
   if (!body.content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
   }
   const post = db.addPost(body.content);
   return NextResponse.json(post, { status: 201 });
}
