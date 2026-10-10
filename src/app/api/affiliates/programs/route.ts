import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Affiliate from "@/models/Affiliate";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ programs: [] }, { status: 401 });
      }

      const rows = await Affiliate.find({ userId }).lean<any[]>();

      return NextResponse.json({
         programs: rows.map((r) => ({
            id: String(r._id),
            company: r.name,
            avatar: r.avatar,
            clicks: r.referrals ?? 0,
            conversions: 0,
            earnings: r.rewardsEarned ?? 0,
            status: r.status,
         })),
      });
   } catch (err) {
      logError("GET /api/affiliates/programs", err);
      return NextResponse.json({ programs: [] }, { status: 500 });
   }
}
