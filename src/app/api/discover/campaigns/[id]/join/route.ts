import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import AffiliateSignup from "@/models/AffiliateSignup";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
   _req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   const step = { at: "start" as string };
   try {
      step.at = "connectDB";
      await connectDB();

      step.at = "getCurrentUserId";
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      step.at = "parse params";
      const { id } = await params;

      step.at = "load campaign";
      const query = mongoose.isValidObjectId(id)
         ? { $or: [{ _id: id }, { slug: id }] }
         : { slug: id };

      const campaign = await Campaign.findOne(query).lean<any>();
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found", step: step.at },
            { status: 404 },
         );
      }
      if (!campaign.businessId) {
         console.error("[join] campaign has no businessId:", campaign._id);
         return NextResponse.json(
            {
               error: "This campaign is missing a businessId. Recreate it via the business campaign form.",
               step: step.at,
               campaignId: String(campaign._id),
            },
            { status: 400 },
         );
      }

      step.at = "load user";
      const user = await User.findById(userId).lean<any>();
      if (!user) {
         return NextResponse.json(
            { error: "User not found", step: step.at },
            { status: 404 },
         );
      }

      step.at = "find/create affiliate";
      let affiliate = await Affiliate.findOne({
         userId,
         businessId: campaign.businessId,
      });

      if (!affiliate) {
         const base =
            (user.username || user.name || "user")
               .toString()
               .toLowerCase()
               .replace(/[^a-z0-9]/g, "")
               .slice(0, 10) || "user";

         // Try up to 5 times to get a unique referral code
         let created = false;
         for (let i = 0; i < 5 && !created; i++) {
            const referralCode = `${base}${Math.random()
               .toString(36)
               .slice(2, 6)
               .toUpperCase()}`;
            try {
               affiliate = await Affiliate.create({
                  businessId: campaign.businessId,
                  userId,
                  name: user.name ?? "Anonymous",
                  email: user.email ?? "",
                  username: user.username ?? "",
                  avatar: (user.name?.charAt(0) ?? "?").toUpperCase(),
                  referralCode,
                  commissionRate: 30,
                  status: "active",
                  referrals: 0,
                  rewardsEarned: 0,
                  retention: 0,
               });
               created = true;
            } catch (e: any) {
               if (e?.code === 11000) continue; // referralCode collision, retry
               throw e;
            }
         }
         if (!created) {
            return NextResponse.json(
               {
                  error: "Could not generate unique referral code",
                  step: step.at,
               },
               { status: 500 },
            );
         }
      }

      step.at = "check existing signup";
      const existing = await AffiliateSignup.findOne({
         affiliateId: affiliate!._id,
         campaignId: campaign._id,
      });
      if (existing) {
         return NextResponse.json({ joined: true, alreadyJoined: true });
      }

      step.at = "create signup";
      const signup = await AffiliateSignup.create({
         businessId: campaign.businessId,
         affiliateId: affiliate!._id,
         campaignId: campaign._id,
         userId,
         name: user.name ?? "Anonymous",
         email: user.email ?? "",
         username: user.username ?? "",
         avatar: (user.name?.charAt(0) ?? "?").toUpperCase(),
         product: campaign.title ?? "",
         status: "active",
         referrals: 0,
         rewardsEarned: 0,
         signedUpAt: new Date(),
      });

      step.at = "increment joinedUsers";
      await Campaign.findByIdAndUpdate(campaign._id, {
         $inc: { joinedUsers: 1 },
      });

      return NextResponse.json({
         joined: true,
         signupId: String(signup._id),
      });
   } catch (err: any) {
      // Duplicate-key race → treat as already joined
      if (err?.code === 11000) {
         return NextResponse.json({ joined: true, alreadyJoined: true });
      }

      console.error(`[join] failed at step "${step.at}":`, err);

      // In dev, return the real message so you can see what broke
      const detail =
         process.env.NODE_ENV !== "production"
            ? (err?.message ?? String(err))
            : "Failed to join campaign";

      return NextResponse.json(
         { error: detail, step: step.at },
         { status: 500 },
      );
   }
}
