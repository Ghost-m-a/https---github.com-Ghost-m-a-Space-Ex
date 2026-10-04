import { NextResponse, NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/lib/models/User";

export async function GET(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return NextResponse.json({ user: null });

   const session = await verifySessionToken(token);
   if (!session) return NextResponse.json({ user: null });

   await connectDB();
   const user = await User.findById(session.userId).select("name email");
   if (!user) return NextResponse.json({ user: null });

   return NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
   });
}
