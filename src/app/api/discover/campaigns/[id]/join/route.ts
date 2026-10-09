import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Campaign from "@/app/lib/models/Campaign";
import AffiliateSignup from "@/app/lib/models/AffiliateSignup";
import User from "@/app/lib/models/User";
import { getCurrentUserId } from "@/app/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      await dbConnect();

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      const query = mongoose.isValidObjectId(id)
         ? { $or: [{ _id: id }, { slug: id }] }
         : { slug: id };

      const campaign = await Campaign.findOne(query);
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      }

      // Already joined?
      const existing = await AffiliateSignup.findOne({
         userId,
         campaignId: campaign._id,
      });
      if (existing) {
         return NextResponse.json({ joined: true, alreadyJoined: true });
      }

      const user = await User.findById(userId).lean<any>();

      await AffiliateSignup.create({
         userId,
         campaignId: campaign._id,
         userName: user?.name ?? "Anonymous",
         userAvatar: (user?.name?.charAt(0) ?? "?").toUpperCase(),
         totalViews: 0,
         totalEarned: 0,
         status: "active",
      });

      await Campaign.findByIdAndUpdate(campaign._id, {
         $inc: { joinedUsers: 1 },
      });

      return NextResponse.json({ joined: true });
   } catch (err) {
      console.error("[POST join campaign]", err);
      return NextResponse.json(
         { error: "Failed to join campaign" },
         { status: 500 },
      );
   }
}
