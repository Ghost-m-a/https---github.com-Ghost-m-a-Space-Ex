import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

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

      const signup = await AffiliateSignup.findOne({
         userId,
         campaignId: campaign._id,
      });
      if (!signup) {
         return NextResponse.json(
            { error: "You haven't requested this campaign" },
            { status: 404 },
         );
      }

      const wasApproved =
         signup.status === "approved" || signup.status === "active";

      signup.status = wasApproved ? "left" : "withdrawn";
      signup.reviewNote = wasApproved
         ? "Creator left the campaign"
         : "Creator withdrew their request";
      await signup.save();

      // Only decrement the counter if they were actually joined
      if (wasApproved) {
         await Campaign.findByIdAndUpdate(campaign._id, {
            $inc: { joinedUsers: -1 },
         });
      }

      logInfo("leave", "Creator left/withdrew", {
         userId,
         campaignId: String(campaign._id),
         wasApproved,
      });

      return NextResponse.json({ ok: true, wasApproved });
   } catch (err) {
      logError("leave", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
