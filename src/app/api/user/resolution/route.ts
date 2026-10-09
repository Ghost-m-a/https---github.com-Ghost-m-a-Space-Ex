import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ResolutionCase from "@/models/ResolutionCase";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const cases = await ResolutionCase.find({ userId: session.userId })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         cases: cases.map((c) => ({
            id: c._id.toString(),
            product: c.product,
            amount: c.amount,
            dueDate: c.dueDate,
            status: c.status,
            description: c.description,
            createdAt: c.createdAt,
         })),
      });
   } catch (err) {
      return NextResponse.json({ cases: [] });
   }
}
