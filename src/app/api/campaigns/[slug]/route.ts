import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Campaign from "@/app/lib/models/Campaign";
import CampaignContribution from "@/app/lib/models/CampaignContribution";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ slug: string }> },
) {
   try {
      const { slug } = await params;
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = token ? await verifySessionToken(token) : null;

      await connectDB();

      const campaign = await Campaign.findOne({ slug }).lean();
      if (!campaign)
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );

      let myContribution = null;
      if (session) {
         const contrib = await CampaignContribution.findOne({
            campaignId: campaign._id,
            userId: session.userId,
         }).lean();
         if (contrib) {
            myContribution = {
               id: contrib._id.toString(),
               totalViews: contrib.totalViews,
               totalEarned: contrib.totalEarned,
               status: contrib.status,
            };
         }
      }

      const topContribs = await CampaignContribution.find({
         campaignId: campaign._id,
      })
         .sort({ totalEarned: -1 })
         .limit(3)
         .lean();

      return NextResponse.json({
         campaign: {
            id: campaign._id.toString(),
            slug: campaign.slug,
            title: campaign.title,
            subtitle: campaign.subtitle,
            category: campaign.category,
            coverImage: campaign.coverImage,
            previewImage: campaign.previewImage,
            brandName: campaign.brandName,
            brandAvatar: campaign.brandAvatar,
            brandVerified: campaign.brandVerified,
            socials: campaign.socials,
            platformRates: campaign.platformRates,
            budget: campaign.budget,
            budgetSpent: campaign.budgetSpent,
            budgetRemaining: Math.max(
               0,
               campaign.budget - campaign.budgetSpent,
            ),
            cpm: campaign.cpm,
            joinedUsers: campaign.joinedUsers,
            totalViews: campaign.totalViews,
            duration: campaign.duration,
            requirements: campaign.requirements,
            instructions: campaign.instructions,
            assets: campaign.assets,
            summary: campaign.summary,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
         },
         myContribution,
         topContributors: topContribs.map((c) => ({
            id: c._id.toString(),
            name: c.userName,
            avatar: c.userAvatar,
            earned: c.totalEarned,
            views: c.totalViews,
         })),
      });
   } catch (err) {
      console.error("[Campaign GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
