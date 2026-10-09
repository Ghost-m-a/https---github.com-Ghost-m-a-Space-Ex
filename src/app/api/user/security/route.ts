import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { action, method } = await req.json();
      await connectDB();

      if (action === "enable-2fa") {
         await User.findByIdAndUpdate(session.userId, {
            $set: {
               "twoFactor.enabled": true,
               "twoFactor.method": method || "authenticator",
            },
         });
         return NextResponse.json({ success: true, enabled: true });
      }

      if (action === "disable-2fa") {
         await User.findByIdAndUpdate(session.userId, {
            $set: { "twoFactor.enabled": false, "twoFactor.method": null },
         });
         return NextResponse.json({ success: true, enabled: false });
      }

      if (action === "signout-all") {
         // Clear cookie — client will also redirect
         const res = NextResponse.json({ success: true });
         res.cookies.set(SESSION_COOKIE_NAME, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
         });
         return res;
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
   } catch (err) {
      console.error("[Security POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
