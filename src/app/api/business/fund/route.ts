import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const business = await Business.findOne({ userId: session.userId });
      if (!business)
         return NextResponse.json({ error: "No business" }, { status: 404 });

      business.balance = 100000;
      await business.save();

      return NextResponse.json({ success: true, balance: business.balance });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
