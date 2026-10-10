import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AffiliateSignup from "@/models/AffiliateSignup";
import Campaign from "@/models/Campaign";
import CampaignSubmission from "@/models/CampaignSubmission";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json(
            { joined: [], submissions: [], stats: null },
            { status: 401 },
         );
      }

      await connectDB();

      // Ensure schemas are registered before populate()
      void Campaign;
      void CampaignSubmission;

      // ---- Joined campaigns ----
      const signups = await AffiliateSignup.find({ userId })
         .sort({ signedUpAt: -1 })
         .populate(
            "campaignId",
            "slug title coverImage brandName budget budgetSpent cpm status",
         )
         .lean<any[]>();

      const joined = signups
         .filter((s) => s.campaignId)
         .map((s) => {
            const c = s.campaignId as any;
            const budget = c.budget ?? 0;
            const budgetSpent = c.budgetSpent ?? 0;
            return {
               contributionId: String(s._id),
               joinedAt: s.signedUpAt ?? s.createdAt,
               totalViews: s.totalViews ?? 0,
               totalEarned: s.rewardsEarned ?? 0,
               status: s.status ?? "active",
               campaign: {
                  id: String(c._id),
                  slug: c.slug ?? String(c._id),
                  title: c.title ?? "Untitled campaign",
                  coverImage: c.coverImage ?? "",
                  brandName: c.brandName ?? "Unknown",
                  budget,
                  budgetSpent,
                  budgetRemaining: Math.max(0, budget - budgetSpent),
                  cpm: c.cpm ?? 0,
                  status: c.status ?? "active",
               },
            };
         });

      // ---- Recent submissions (best-effort; empty if the model isn't set up) ----
      let submissions: any[] = [];
      try {
         const docs = await CampaignSubmission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("campaignId", "title slug coverImage")
            .lean<any[]>();

         submissions = docs.map((d) => ({
            id: String(d._id),
            platform: d.platform ?? "unknown",
            videoUrl: d.videoUrl ?? "",
            views: d.views ?? 0,
            credit: d.credit ?? d.rewardsEarned ?? 0,
            createdAt: d.createdAt,
            campaign: d.campaignId
               ? {
                    title: d.campaignId.title,
                    slug: d.campaignId.slug,
                    coverImage: d.campaignId.coverImage ?? "",
                 }
               : null,
         }));
      } catch {
         // Model might not have the fields we expect — return empty
         submissions = [];
      }

      // ---- Aggregate stats ----
      const totalEarned = joined.reduce(
         (sum, j) => sum + (j.totalEarned || 0),
         0,
      );
      const totalViews = joined.reduce(
         (sum, j) => sum + (j.totalViews || 0),
         0,
      );
      const activeCampaigns = joined.filter(
         (j) => j.campaign.status === "active",
      ).length;

      return NextResponse.json({
         joined,
         submissions,
         stats: {
            totalEarned,
            totalViews,
            activeCampaigns,
            joinedCount: joined.length,
         },
      });
   } catch (err) {
      console.error("[GET /api/user/campaigns]", err);
      return NextResponse.json(
         { joined: [], submissions: [], stats: null },
         { status: 500 },
      );
   }
}
