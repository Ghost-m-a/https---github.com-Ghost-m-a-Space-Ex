import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PartnerReferral from "@/models/PartnerReferral";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await User.findById(userId).lean<any>();

      const referrals = await PartnerReferral.find({
         partnerUserId: userId,
      }).lean<any[]>();

      const totalEarned = referrals.reduce((s, r) => s + (r.earnings ?? 0), 0);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);
      const last30 = referrals
         .filter((r) => new Date(r.attributedAt) >= thirtyDaysAgo)
         .reduce((s, r) => s + (r.earnings ?? 0), 0);

      // Generate a simple earnings chart (last 30 days)
      const chart: { date: string; earnings: number }[] = [];
      for (let i = 29; i >= 0; i--) {
         const d = new Date();
         d.setDate(d.getDate() - i);
         const dateStr = d.toISOString().slice(0, 10);
         const dayStart = new Date(d);
         dayStart.setHours(0, 0, 0, 0);
         const dayEnd = new Date(dayStart.getTime() + 86400_000);

         const dayEarnings = referrals
            .filter((r) => {
               const t = new Date(r.attributedAt).getTime();
               return t >= dayStart.getTime() && t < dayEnd.getTime();
            })
            .reduce((s, r) => s + (r.earnings ?? 0), 0);

         chart.push({ date: dateStr, earnings: dayEarnings });
      }

      return NextResponse.json({
         user: {
            name: user?.name ?? "Partner",
            username: user?.username ?? "",
            avatarColor: user?.avatarColor ?? "#3b82f6",
            partnerLevel: "Whop Partner",
         },
         totalEarned,
         last30,
         isVerified: false,
         referrals: referrals.map((r) => ({
            id: String(r._id),
            businessName: r.referredBusinessName,
            businessAvatar: r.referredBusinessAvatar,
            volume30d: r.volume30d,
            earnings: r.earnings,
            referredUser: r.referredUserName,
            attributedAt: r.attributedAt,
            status: r.status,
         })),
         chart,
      });
   } catch (err) {
      logError("GET /api/partners/stats", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
