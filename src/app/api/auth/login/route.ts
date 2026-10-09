import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import {
   createSessionToken,
   verifyPassword,
   getCookieOptions,
   SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const { email, password, rememberMe } = await req.json();

      if (!email || !password) {
         return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 },
         );
      }

      await connectDB();

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !verifyPassword(password, user.passwordHash)) {
         return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 },
         );
      }

      // ✅ Create welcome-back notification on login
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentWelcome = await Notification.findOne({
         userId: user._id,
         kind: "system",
         title: /Welcome/i,
         createdAt: { $gte: oneDayAgo },
      });

      // Only add a new one if user hasn't logged in the last 24h
      if (!recentWelcome) {
         await Notification.create({
            userId: user._id,
            kind: "system",
            title: `Welcome back, ${user.name.split(" ")[0]}! 👋`,
            body: "You have new activity waiting for you. Check your dashboard.",
            href: "/",
            read: false,
         });
      }

      const remember = Boolean(rememberMe);
      const token = await createSessionToken(
         {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            rememberMe: remember,
         },
         remember,
      );

      const res = NextResponse.json({
         user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
         },
      });

      res.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(remember));
      return res;
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Login API Error]", message);
      return NextResponse.json(
         { error: `Server error: ${message}` },
         { status: 500 },
      );
   }
}
