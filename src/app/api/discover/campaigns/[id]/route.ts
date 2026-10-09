import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Campaign from "@/lib/models/Campaign";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await dbConnect();

      const { id } = await params;

      const query = mongoose.isValidObjectId(id)
         ? { $or: [{ _id: id }, { slug: id }] }
         : { slug: id };

      const campaign = await Campaign.findOne(query).lean<any>();
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      }

      const budget = campaign.budget ?? 0;
      const budgetSpent = campaign.budgetSpent ?? 0;

      return NextResponse.json({
         campaign: {
            id: String(campaign._id),
            slug: campaign.slug,
            title: campaign.title,
            subtitle: campaign.subtitle ?? "",
            category: campaign.category ?? "General",
            coverImage: campaign.coverImage ?? "",
            previewImage: campaign.previewImage ?? campaign.coverImage ?? "",
            brandName: campaign.brandName ?? "Unknown",
            brandAvatar: campaign.brandAvatar ?? "",
            brandVerified: Boolean(campaign.brandVerified),
            socials: campaign.socials ?? [],
            platformRates: campaign.platformRates ?? [],
            requirements: campaign.requirements ?? [],
            instructions: campaign.instructions ?? [],
            summary: campaign.summary ?? "",
            budget,
            budgetSpent,
            budgetRemaining: Math.max(0, budget - budgetSpent),
            cpm: campaign.cpm ?? 0,
            joinedUsers: campaign.joinedUsers ?? 0,
            totalViews: campaign.totalViews ?? 0,
            duration: campaign.duration ?? "",
            featured: Boolean(campaign.featured),
            startDate: campaign.startDate ?? null,
         },
      });
   } catch (err) {
      console.error("[GET /api/discover/campaigns/[id]]", err);
      return NextResponse.json(
         { error: "Failed to load campaign" },
         { status: 500 },
      );
   }
}
