import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import CampaignSubmission from "@/models/CampaignSubmission";
import { getCurrentUserId } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// ---------------------------------------------------
// GET — all submissions by the current user
// ---------------------------------------------------
export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) return NextResponse.json({ submissions: [] });

      const rows = await CampaignSubmission.find({ userId })
         .sort({ createdAt: -1 })
         .populate("campaignId", "slug title coverImage brandName cpm")
         .lean<any[]>();

      return NextResponse.json({
         submissions: rows.map((r) => ({
            id: String(r._id),
            campaignId: r.campaignId?._id ? String(r.campaignId._id) : null,
            campaign: r.campaignId
               ? {
                    slug: r.campaignId.slug,
                    title: r.campaignId.title,
                    coverImage: r.campaignId.coverImage ?? "",
                    brandName: r.campaignId.brandName ?? "",
                    cpm: r.campaignId.cpm ?? 0,
                 }
               : null,
            platform: r.platform,
            videoUrl: r.videoUrl,
            thumbnail: r.thumbnail ?? "",
            views: r.views,
            credit: r.credit,
            status: r.status,
            reviewNote: r.reviewNote ?? "",
            reviewedAt: r.reviewedAt ?? null,
            createdAt: r.createdAt,
         })),
      });
   } catch (err) {
      logError("GET user/submissions", err);
      return NextResponse.json({ submissions: [] }, { status: 500 });
   }
}

// ---------------------------------------------------
// POST — creator submits content for a campaign
// ---------------------------------------------------
export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { campaignId, platform, videoUrl, views } = body ?? {};

      if (!campaignId || !mongoose.isValidObjectId(campaignId)) {
         return NextResponse.json(
            { error: "Invalid campaign" },
            { status: 400 },
         );
      }
      if (!videoUrl || typeof videoUrl !== "string") {
         return NextResponse.json(
            { error: "Video URL is required" },
            { status: 400 },
         );
      }
      if (!platform) {
         return NextResponse.json(
            { error: "Platform is required" },
            { status: 400 },
         );
      }
      const viewsNum = Number(views);
      if (!Number.isFinite(viewsNum) || viewsNum <= 0) {
         return NextResponse.json(
            { error: "Views must be a positive number" },
            { status: 400 },
         );
      }

      // Must have an approved signup for this campaign
      const signup = await AffiliateSignup.findOne({
         userId,
         campaignId,
         status: { $in: ["approved", "active"] },
      });
      if (!signup) {
         return NextResponse.json(
            { error: "You must be approved for this campaign first" },
            { status: 403 },
         );
      }

      const campaign = await Campaign.findById(campaignId).lean<any>();
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      }

      // Compute provisional credit (business can adjust on review)
      const rate = (campaign.platformRates ?? []).find(
         (r: any) => r.platform === platform,
      );
      const cpm = rate?.cpm ?? campaign.cpm ?? 0;
      const credit = (viewsNum / 1000) * cpm;

      const submission = await CampaignSubmission.create({
         campaignId: campaign._id,
         contributionId: signup._id, // reuse signup id as contribution ref
         userId,
         platform,
         videoUrl,
         views: viewsNum,
         credit,
         status: "pending",
      });

      logInfo("submission:create", "Creator submitted content", {
         userId,
         campaignId: String(campaign._id),
         views: viewsNum,
      });

      return NextResponse.json(
         {
            submission: {
               id: String(submission._id),
               status: submission.status,
               credit,
            },
         },
         { status: 201 },
      );
   } catch (err) {
      logError("POST user/submissions", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
