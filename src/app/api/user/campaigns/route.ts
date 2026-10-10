import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AffiliateSignup from "@/models/AffiliateSignup";
import Campaign from "@/models/Campaign";
import CampaignSubmission from "@/models/CampaignSubmission";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

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
      void Campaign;
      void CampaignSubmission;

      // Exclude withdrawn/left — the user no longer has a relationship
      const signups = await AffiliateSignup.find({
         userId,
         status: { $nin: ["withdrawn", "left"] },
      })
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

            const normalized =
               s.status === "active"
                  ? "approved"
                  : s.status === "signed_up"
                    ? "pending"
                    : s.status;

            return {
               contributionId: String(s._id),
               joinedAt: s.signedUpAt ?? s.createdAt,
               totalViews: s.totalViews ?? 0,
               totalEarned: s.rewardsEarned ?? 0,
               status: normalized,
               reviewNote: s.reviewNote ?? "",
               reviewedAt: s.reviewedAt ?? null,
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

      // Stats only count approved campaigns
      const approved = joined.filter((j) => j.status === "approved");
      const totalEarned = approved.reduce(
         (sum, j) => sum + (j.totalEarned || 0),
         0,
      );
      const totalViews = approved.reduce(
         (sum, j) => sum + (j.totalViews || 0),
         0,
      );
      const activeCampaigns = approved.filter(
         (j) => j.campaign.status === "active",
      ).length;

      // Recent submissions
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
         submissions = [];
      }

      return NextResponse.json({
         joined,
         submissions,
         stats: {
            totalEarned,
            totalViews,
            activeCampaigns,
            joinedCount: joined.length,
            pendingCount: joined.filter((j) => j.status === "pending").length,
         },
      });
   } catch (err) {
      logError("GET /api/user/campaigns", err);
      return NextResponse.json(
         { joined: [], submissions: [], stats: null },
         { status: 500 },
      );
   }
}
