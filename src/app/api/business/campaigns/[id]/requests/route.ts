import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import CampaignSubmission from "@/models/CampaignSubmission";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
   req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json({ error: "No business" }, { status: 403 });
      }

      const { id } = await params;
      const query = mongoose.isValidObjectId(id)
         ? { $or: [{ _id: id }, { slug: id }] }
         : { slug: id };

      const campaign = await Campaign.findOne({
         ...query,
         businessId: business._id,
      }).lean<any>();
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      }

      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") ?? "pending";

      const filter: Record<string, unknown> = {
         campaignId: campaign._id,
      };
      if (status !== "all") filter.status = status;

      const rows = await AffiliateSignup.find(filter)
         .sort({ signedUpAt: -1 })
         .lean<any[]>();

      // Look up how many submissions each creator has made
      const userIds = rows.map((r) => r.userId);
      const submissionCounts = await CampaignSubmission.aggregate([
         { $match: { userId: { $in: userIds } } },
         { $group: { _id: "$userId", n: { $sum: 1 } } },
      ]);
      const countMap = new Map(
         submissionCounts.map((s) => [String(s._id), s.n]),
      );

      return NextResponse.json({
         campaign: {
            id: String(campaign._id),
            title: campaign.title,
            slug: campaign.slug,
            coverImage: campaign.coverImage ?? "",
         },
         requests: rows.map((r) => ({
            id: String(r._id),
            userId: String(r.userId),
            name: r.name,
            email: r.email,
            username: r.username,
            avatar: r.avatar,
            applicationMessage: r.applicationMessage ?? "",
            status:
               r.status === "active"
                  ? "approved"
                  : r.status === "signed_up"
                    ? "pending"
                    : r.status,
            reviewNote: r.reviewNote ?? "",
            reviewedAt: r.reviewedAt ?? null,
            signedUpAt: r.signedUpAt,
            totalSubmissions: countMap.get(String(r.userId)) ?? 0,
         })),
      });
   } catch (err) {
      logError("GET requests", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
