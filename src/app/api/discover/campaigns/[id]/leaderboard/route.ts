import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
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
         return NextResponse.json({ leaderboard: [], average: 0, total: 0 });
      }

      const rows = await AffiliateSignup.find({
         campaignId: campaign._id,
         status: { $in: ["approved", "active"] },
      })
         .sort({ totalViews: -1, rewardsEarned: -1 })
         .limit(3)
         .lean<any[]>();

      const total = await AffiliateSignup.countDocuments({
         campaignId: campaign._id,
         status: { $in: ["approved", "active"] },
      });

      const avgAgg = await AffiliateSignup.aggregate([
         {
            $match: {
               campaignId: campaign._id,
               status: { $in: ["approved", "active"] },
            },
         },
         { $group: { _id: null, avg: { $avg: "$rewardsEarned" } } },
      ]);
      const average = avgAgg[0]?.avg ?? 0;

      return NextResponse.json({
         leaderboard: rows.map((r, i) => ({
            rank: i + 1,
            name: r.name ?? "Anonymous",
            avatar: r.avatar || (r.name?.[0] ?? "?").toUpperCase(),
            earnings: r.rewardsEarned ?? 0,
            totalViews: r.totalViews ?? 0,
         })),
         average,
         total,
      });
   } catch (err) {
      logError("GET leaderboard", err);
      return NextResponse.json({ leaderboard: [], average: 0, total: 0 });
   }
}
