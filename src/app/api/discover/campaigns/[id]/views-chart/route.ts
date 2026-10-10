import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import CampaignSubmission from "@/models/CampaignSubmission";
import { logError } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await connectDB();
      const { id } = await params;
      const query = mongoose.isValidObjectId(id)
         ? { $or: [{ _id: id }, { slug: id }] }
         : { slug: id };

      const campaign = await Campaign.findOne(query).lean<any>();
      if (!campaign) {
         return NextResponse.json({ points: [], total: 0 });
      }

      // Last 30 days
      const days = 30;
      const now = Date.now();
      const since = new Date(now - (days - 1) * 86400_000);
      since.setHours(0, 0, 0, 0);

      const agg = await CampaignSubmission.aggregate([
         {
            $match: {
               campaignId: campaign._id,
               createdAt: { $gte: since },
            },
         },
         {
            $group: {
               _id: {
                  $dateToString: {
                     format: "%Y-%m-%d",
                     date: "$createdAt",
                  },
               },
               views: { $sum: "$views" },
            },
         },
         { $sort: { _id: 1 } },
      ]);

      const map = new Map(agg.map((a) => [a._id, a.views]));
      const points: { date: string; views: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
         const d = new Date(now - i * 86400_000);
         const key = d.toISOString().slice(0, 10);
         points.push({ date: key, views: map.get(key) ?? 0 });
      }

      return NextResponse.json({
         points,
         total: campaign.totalViews ?? 0,
      });
   } catch (err) {
      logError("GET views-chart", err);
      return NextResponse.json({ points: [], total: 0 });
   }
}
