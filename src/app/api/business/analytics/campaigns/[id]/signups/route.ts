import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json({ signups: [] });
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

      const signups = await AffiliateSignup.find({
         campaignId: campaign._id,
      })
         .sort({ signedUpAt: -1 })
         .lean<any[]>();

      return NextResponse.json({
         campaign: {
            id: String(campaign._id),
            title: campaign.title,
            slug: campaign.slug,
         },
         signups: signups.map((s) => ({
            id: String(s._id),
            name: s.name,
            email: s.email,
            avatar: s.avatar,
            status: s.status,
            signedUpAt: s.signedUpAt,
            totalViews: s.totalViews ?? 0,
            rewardsEarned: s.rewardsEarned ?? 0,
         })),
      });
   } catch (err) {
      console.error("[GET signups]", err);
      return NextResponse.json(
         { error: "Failed to load signups" },
         { status: 500 },
      );
   }
}
