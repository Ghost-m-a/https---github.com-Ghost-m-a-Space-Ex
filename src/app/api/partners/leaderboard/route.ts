import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PartnerReferral from "@/models/PartnerReferral";
import User from "@/models/User";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();

      const agg = await PartnerReferral.aggregate([
         { $match: { status: "active" } },
         {
            $group: {
               _id: "$partnerUserId",
               earnings: { $sum: "$earnings" },
            },
         },
         { $sort: { earnings: -1 } },
         { $limit: 10 },
      ]);

      const userIds = agg.map((a) => a._id);
      const users = await User.find({ _id: { $in: userIds } })
         .select("name username avatarColor location")
         .lean<any[]>();
      const userMap = new Map(users.map((u) => [String(u._id), u]));

      const leaderboard = agg.map((a, i) => {
         const u = userMap.get(String(a._id));
         return {
            rank: i + 1,
            name: u?.name ?? "A partner somewhere",
            avatarColor: u?.avatarColor ?? "#3b82f6",
            location: u?.location ?? "Somewhere",
            earnings: a.earnings,
         };
      });

      // If no real data, seed mock leaderboard so the page isn't empty
      if (leaderboard.length === 0) {
         return NextResponse.json({
            leaderboard: [
               {
                  rank: 1,
                  name: "A partner somewhere",
                  avatarColor: "#f59e0b",
                  location: "Global",
                  earnings: 71800,
               },
               {
                  rank: 2,
                  name: "A partner somewhere",
                  avatarColor: "#3b82f6",
                  location: "Global",
                  earnings: 65700,
               },
               {
                  rank: 3,
                  name: "A partner somewhere",
                  avatarColor: "#ef4444",
                  location: "Global",
                  earnings: 49800,
               },
               {
                  rank: 4,
                  name: "A partner in New York City, US",
                  avatarColor: "#10b981",
                  location: "New York",
                  earnings: 46700,
               },
               {
                  rank: 5,
                  name: "A partner somewhere",
                  avatarColor: "#8b5cf6",
                  location: "Global",
                  earnings: 44200,
               },
            ],
         });
      }

      return NextResponse.json({ leaderboard });
   } catch (err) {
      logError("GET /api/partners/leaderboard", err);
      return NextResponse.json({ leaderboard: [] }, { status: 500 });
   }
}
