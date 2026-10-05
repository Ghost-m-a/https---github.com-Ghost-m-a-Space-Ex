import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/lib/models/User";
import {
   createSessionToken,
   hashPassword,
   getCookieOptions,
   SESSION_COOKIE_NAME,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const { name, email, password, acceptedTerms } = await req.json();

      if (!name || !email || !password) {
         return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 },
         );
      }
      if (!acceptedTerms) {
         return NextResponse.json(
            { error: "You must accept the Terms and Conditions" },
            { status: 400 },
         );
      }
      if (password.length < 8) {
         return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 },
         );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         return NextResponse.json(
            { error: "Invalid email address" },
            { status: 400 },
         );
      }

      await connectDB();

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
         return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 },
         );
      }

      const user = await User.create({
         name: name.trim(),
         email: email.toLowerCase(),
         passwordHash: hashPassword(password),
      });

      const token = await createSessionToken(
         {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            rememberMe: true,
         },
         true,
      );

      const res = NextResponse.json({
         user: { id: user._id.toString(), name: user.name, email: user.email },
      });

      res.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(true));
      return res;
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Signup API Error]", message);
      return NextResponse.json(
         { error: `Server error: ${message}` },
         { status: 500 },
      );
   }
}
