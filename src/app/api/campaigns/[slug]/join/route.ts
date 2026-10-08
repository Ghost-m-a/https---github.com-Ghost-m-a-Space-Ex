import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Campaign from "@/app/lib/models/Campaign";
import CampaignContribution from "@/app/lib/models/CampaignContribution";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

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
      if (campaign.budgetSpent >= campaign.budget) {
         return NextResponse.json(
            { error: "Campaign budget is fully spent" },
            { status: 400 },
         );
      }

      const existing = await CampaignContribution.findOne({
         campaignId: campaign._id,
         userId: session.userId,
      });

      if (existing) {
         return NextResponse.json({
            contribution: { id: existing._id.toString() },
            alreadyJoined: true,
         });
      }

      const user = await User.findById(session.userId).lean();
      if (!user)
         return NextResponse.json({ error: "User not found" }, { status: 404 });

      const contribution = await CampaignContribution.create({
         campaignId: campaign._id,
         userId: user._id,
         userName: user.name,
         userAvatar: user.name.charAt(0).toUpperCase(),
         status: "active",
      });

      campaign.joinedUsers += 1;
      await campaign.save();

      return NextResponse.json({
         contribution: {
            id: contribution._id.toString(),
            totalViews: 0,
            totalEarned: 0,
         },
         alreadyJoined: false,
      });
   } catch (err) {
      console.error("[Join POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
