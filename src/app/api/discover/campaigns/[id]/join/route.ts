import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Affiliate from "@/models/Affiliate";
import AffiliateSignup from "@/models/AffiliateSignup";
import User from "@/models/User";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";
import { joinLimiter, checkLimit } from "@/lib/ratelimit";
import { logError, logInfo } from "@/lib/logger";
import { sendEmail, newSignupEmail } from "@/lib/email";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(
   req: Request,
   { params }: { params: Promise<{ id: string }> },
) {
   let step = "start";
   try {
      step = "connect";
      await connectDB();

      step = "auth";
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      step = "rate-limit";
      const limited = await checkLimit(joinLimiter(), `join:${userId}`);
      if (!limited.ok) {
         return NextResponse.json(
            { error: "Too many requests. Slow down." },
            { status: 429 },
         );
      }

      step = "parse";
      const { id } = await params;
      const body = await req.json().catch(() => ({}));
      const applicationMessage = String(body?.message ?? "").slice(0, 800);

      step = "load-campaign";
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
      if (!campaign.businessId) {
         return NextResponse.json(
            { error: "Campaign is missing a business" },
            { status: 400 },
         );
      }

      step = "load-user";
      const user = await User.findById(userId).lean<any>();
      if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      step = "check-existing";
      const existing = await AffiliateSignup.findOne({
         userId,
         campaignId: campaign._id,
      });

      if (existing) {
         // Already pending or approved — don't create a duplicate
         if (
            existing.status === "pending" ||
            existing.status === "approved" ||
            existing.status === "active"
         ) {
            return NextResponse.json({
               status: existing.status,
               alreadyRequested: true,
            });
         }
         // Otherwise (rejected / withdrawn / left) — delete and let them re-apply
         await existing.deleteOne();
      }

      step = "affiliate";
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
               if (e?.code === 11000) continue;
               throw e;
            }
         }
         if (!created) {
            return NextResponse.json(
               { error: "Could not generate referral code" },
               { status: 500 },
            );
         }
      }

      step = "create-signup";
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
         status: "pending",
         applicationMessage,
         referrals: 0,
         rewardsEarned: 0,
         signedUpAt: new Date(),
      });

      logInfo("join", "Join request submitted", {
         userId,
         campaignId: String(campaign._id),
      });

      // Notify the business owner (fire and forget)
      step = "notify";
      (async () => {
         try {
            const biz = await Business.findById(
               campaign.businessId,
            ).lean<any>();
            if (!biz) return;
            const owner = await User.findById(biz.userId).lean<any>();
            if (!owner?.email) return;
            const appUrl =
               process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
            const tpl = newSignupEmail(
               biz.name ?? "your business",
               campaign.title ?? "your campaign",
               user.name ?? "A creator",
               appUrl,
            );
            await sendEmail({ to: owner.email, ...tpl });
         } catch (e) {
            logError("join:notify", e);
         }
      })();

      return NextResponse.json({
         status: "pending",
         signupId: String(signup._id),
      });
   } catch (err: any) {
      if (err?.code === 11000) {
         return NextResponse.json({
            status: "pending",
            alreadyRequested: true,
         });
      }
      logError(`join:${step}`, err);
      return NextResponse.json(
         {
            error: "Failed to submit request",
            step: process.env.NODE_ENV !== "production" ? step : undefined,
         },
         { status: 500 },
      );
   }
}
