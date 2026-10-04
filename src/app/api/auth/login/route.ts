import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/lib/models/User";
import {
   createSessionToken,
   verifyPassword,
   getCookieOptions,
   SESSION_COOKIE_NAME,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
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
      user: { id: user._id.toString(), name: user.name, email: user.email },
   });

   res.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(remember));
   return res;
}
