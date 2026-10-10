import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();
      void Campaign;

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json({
            totalSignups: 0,
            signups7d: 0,
            signups30d: 0,
            campaigns: [],
            recentSignups: [],
         });
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);

      const [totalSignups, signups7d, signups30d] = await Promise.all([
         AffiliateSignup.countDocuments({ businessId: business._id }),
         AffiliateSignup.countDocuments({
            businessId: business._id,
            signedUpAt: { $gte: sevenDaysAgo },
         }),
         AffiliateSignup.countDocuments({
            businessId: business._id,
            signedUpAt: { $gte: thirtyDaysAgo },
         }),
      ]);

      const perCampaign = await AffiliateSignup.aggregate([
         { $match: { businessId: business._id } },
         {
            $group: {
               _id: "$campaignId",
               signups: { $sum: 1 },
               lastSignedUpAt: { $max: "$signedUpAt" },
            },
         },
         {
            $lookup: {
               from: "campaigns",
               localField: "_id",
               foreignField: "_id",
               as: "campaign",
            },
         },
         { $unwind: { path: "$campaign", preserveNullAndEmptyArrays: true } },
         {
            $project: {
               _id: 0,
               campaignId: "$_id",
               title: { $ifNull: ["$campaign.title", "Untitled"] },
               slug: "$campaign.slug",
               coverImage: "$campaign.coverImage",
               cpm: { $ifNull: ["$campaign.cpm", 0] },
               budget: { $ifNull: ["$campaign.budget", 0] },
               budgetSpent: { $ifNull: ["$campaign.budgetSpent", 0] },
               signups: 1,
               lastSignedUpAt: 1,
            },
         },
         { $sort: { signups: -1 } },
      ]);

      const recentSignups = await AffiliateSignup.find({
         businessId: business._id,
      })
         .sort({ signedUpAt: -1 })
         .limit(20)
         .populate("campaignId", "title slug")
         .lean<any[]>();

      return NextResponse.json({
         totalSignups,
         signups7d,
         signups30d,
         campaigns: perCampaign.map((p) => ({
            campaignId: String(p.campaignId),
            title: p.title,
            slug: p.slug ?? String(p.campaignId),
            coverImage: p.coverImage ?? "",
            cpm: p.cpm,
            budget: p.budget,
            budgetSpent: p.budgetSpent,
            signups: p.signups,
            lastSignedUpAt: p.lastSignedUpAt,
         })),
         recentSignups: recentSignups.map((s) => ({
            id: String(s._id),
            name: s.name,
            email: s.email,
            avatar: s.avatar,
            signedUpAt: s.signedUpAt,
            status: s.status,
            campaign: s.campaignId
               ? {
                    id: String(s.campaignId._id),
                    title: s.campaignId.title,
                    slug: s.campaignId.slug,
                 }
               : null,
         })),
      });
   } catch (err) {
      console.error("[GET /api/business/campaign-signups]", err);
      return NextResponse.json(
         { error: "Failed to load analytics" },
         { status: 500 },
      );
   }
}
