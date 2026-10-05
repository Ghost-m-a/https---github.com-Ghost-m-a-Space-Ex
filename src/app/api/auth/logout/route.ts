import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function POST() {
   try {
      const res = NextResponse.json({ success: true });
      res.cookies.set(SESSION_COOKIE_NAME, "", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 0,
         path: "/",
      });
      return res;
   } catch (err) {
      console.error("[Logout API Error]", err);
      return NextResponse.json({ error: "Logout failed" }, { status: 500 });
   }
}
