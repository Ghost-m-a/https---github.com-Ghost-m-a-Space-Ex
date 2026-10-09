import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/lib/db";

export async function GET() {
   return NextResponse.json({ members: businessDb.getWorkforce() });
}

export async function POST(req: NextRequest) {
   const { email, role } = await req.json();
   if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });
   return NextResponse.json(businessDb.inviteMember(email, role || "Member"), {
      status: 201,
   });
}
