import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import CampaignContribution from "@/models/CampaignContribution";
import CampaignSubmission from "@/models/CampaignSubmission";
import Business from "@/models/Business";
import Transaction from "@/models/Transaction";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ slug: string }> },
) {
   try {
      const { slug } = await params;
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { platform, videoUrl, views } = await req.json();

      if (!platform || !videoUrl || !views || views <= 0) {
         return NextResponse.json(
            { error: "platform, videoUrl, and positive views are required" },
            { status: 400 },
         );
      }

      await connectDB();

      const campaign = await Campaign.findOne({ slug });
      if (!campaign)
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      if (campaign.status !== "active") {
         return NextResponse.json(
            { error: "Campaign is not active" },
            { status: 400 },
         );
      }

      const contribution = await CampaignContribution.findOne({
         campaignId: campaign._id,
         userId: session.userId,
      });
      if (!contribution) {
         return NextResponse.json(
            { error: "You haven't joined this campaign yet" },
            { status: 403 },
         );
      }

      const platformRate = campaign.platformRates.find(
         (r) => r.platform === platform,
      );
      const cpm = platformRate?.cpm || campaign.cpm;
      const credit = (views / 1000) * cpm;
      const budgetRemaining = campaign.budget - campaign.budgetSpent;

      if (budgetRemaining <= 0) {
         return NextResponse.json(
            { error: "Campaign budget is fully spent" },
            { status: 400 },
         );
      }

      const finalCredit = Math.min(credit, budgetRemaining);

      await CampaignSubmission.create({
         campaignId: campaign._id,
         contributionId: contribution._id,
         userId: session.userId,
         platform,
         videoUrl,
         views: Number(views),
         credit: finalCredit,
         status: "approved",
      });

      contribution.totalViews += Number(views);
      contribution.totalEarned += finalCredit;
      await contribution.save();

      campaign.budgetSpent += finalCredit;
      campaign.totalViews += Number(views);
      if (campaign.budgetSpent >= campaign.budget) campaign.status = "ended";
      await campaign.save();

      await Transaction.create({
         businessId: campaign.businessId,
         kind: "ad_spend",
         amount: finalCredit,
         status: "completed",
         description: `Campaign payout: ${campaign.title} (${views} views)`,
         counterparty: {
            id: session.userId as any,
            name: contribution.userName,
            email: "",
            avatar: contribution.userAvatar,
         },
         metadata: {
            campaignId: campaign._id.toString(),
            platform,
            videoUrl,
            views: Number(views),
            cpm,
         },
      });

      const business = await Business.findById(campaign.businessId);
      if (business) {
         business.balance = Math.max(0, (business.balance || 0) - finalCredit);
         await business.save();
      }

      return NextResponse.json({
         success: true,
         credit: finalCredit,
         remaining: Math.max(0, campaign.budget - campaign.budgetSpent),
         message: `Earned $${finalCredit.toFixed(2)} for ${views.toLocaleString()} views`,
      });
   } catch (err) {
      console.error("[Submit POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
