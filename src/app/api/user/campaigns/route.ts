import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import CampaignContribution from "@/models/CampaignContribution";
import CampaignSubmission from "@/models/CampaignSubmission";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token) return NextResponse.json({ joined: [], stats: null });
      const session = await verifySessionToken(token);
      if (!session) return NextResponse.json({ joined: [], stats: null });

      await connectDB();

      const contributions = await CampaignContribution.find({
         userId: session.userId,
      })
         .sort({ joinedAt: -1 })
         .lean();

      const campaignIds = contributions.map((c) => c.campaignId);
      const campaigns = await Campaign.find({
         _id: { $in: campaignIds },
      }).lean();

      const campaignMap = new Map(campaigns.map((c) => [c._id.toString(), c]));

      // Recent submissions
      const submissions = await CampaignSubmission.find({
         userId: session.userId,
      })
         .sort({ createdAt: -1 })
         .limit(10)
         .lean();

      const submissionCampaignIds = [
         ...new Set(submissions.map((s) => s.campaignId.toString())),
      ];
      const submissionCampaigns = await Campaign.find({
         _id: { $in: submissionCampaignIds },
      })
         .select("title slug coverImage")
         .lean();
      const submissionCampaignMap = new Map(
         submissionCampaigns.map((c) => [c._id.toString(), c]),
      );

      // Aggregate stats
      const totalEarned = contributions.reduce((s, c) => s + c.totalEarned, 0);
      const totalViews = contributions.reduce((s, c) => s + c.totalViews, 0);
      const activeCampaigns = contributions.filter((c) => {
         const camp = campaignMap.get(c.campaignId.toString());
         return camp && camp.status === "active";
      }).length;

      return NextResponse.json({
         joined: contributions
            .map((contrib) => {
               const camp = campaignMap.get(contrib.campaignId.toString());
               return {
                  contributionId: contrib._id.toString(),
                  joinedAt: contrib.joinedAt,
                  totalViews: contrib.totalViews,
                  totalEarned: contrib.totalEarned,
                  status: contrib.status,
                  campaign: camp
                     ? {
                          id: camp._id.toString(),
                          slug: camp.slug,
                          title: camp.title,
                          coverImage: camp.coverImage,
                          brandName: camp.brandName,
                          budget: camp.budget,
                          budgetSpent: camp.budgetSpent,
                          budgetRemaining: Math.max(
                             0,
                             camp.budget - camp.budgetSpent,
                          ),
                          cpm: camp.cpm,
                          status: camp.status,
                       }
                     : null,
               };
            })
            .filter((c) => c.campaign !== null),
         submissions: submissions.map((s) => ({
            id: s._id.toString(),
            platform: s.platform,
            videoUrl: s.videoUrl,
            views: s.views,
            credit: s.credit,
            createdAt: s.createdAt,
            campaign:
               submissionCampaignMap.get(s.campaignId.toString()) || null,
         })),
         stats: {
            totalEarned,
            totalViews,
            activeCampaigns,
            joinedCount: contributions.length,
         },
      });
   } catch (err) {
      console.error("[User campaigns GET]", err);
      return NextResponse.json({ joined: [], stats: null });
   }
}
