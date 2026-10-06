import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Affiliate from "@/app/lib/models/Affiliate";
import AffiliateSettings from "@/app/lib/models/AffiliateSettings";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

async function getBusiness(session: any, businessId: string | null) {
   if (businessId)
      return await Business.findOne({
         _id: businessId,
         userId: session.userId,
      }).lean();
   return await Business.findOne({ userId: session.userId })
      .sort({ createdAt: 1 })
      .lean();
}

function genCode() {
   return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// GET - list affiliates + dashboard summary
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ affiliates: [], summary: null });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";
      const status = url.searchParams.get("status") || "";

      await connectDB();
      const business = await getBusiness(session, businessId);
      if (!business)
         return NextResponse.json({ affiliates: [], summary: null });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;
      if (q) {
         query.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { referralCode: { $regex: q, $options: "i" } },
         ];
      }

      const affiliates = await Affiliate.find(query)
         .sort({ createdAt: -1 })
         .lean();

      // Summary
      const summary = {
         totalAffiliates: affiliates.length,
         activeAffiliates: affiliates.filter((a) => a.status === "active")
            .length,
         totalReferrals: affiliates.reduce((s, a) => s + a.referrals, 0),
         totalRewards: affiliates.reduce((s, a) => s + a.rewardsEarned, 0),
      };

      // Settings
      let settings = await AffiliateSettings.findOne({
         businessId: business._id,
      });
      if (!settings) {
         settings = await AffiliateSettings.create({
            businessId: business._id,
            portalLink: `space-ex.com/${business.initial.toLowerCase()}/affiliates`,
         });
      }

      return NextResponse.json({
         affiliates: affiliates.map((a) => ({
            id: a._id.toString(),
            name: a.name,
            email: a.email,
            username: a.username,
            avatar: a.avatar,
            referralCode: a.referralCode,
            commissionRate: a.commissionRate,
            status: a.status,
            referrals: a.referrals,
            rewardsEarned: a.rewardsEarned,
            retention: a.retention,
            signedUpAt: a.signedUpAt,
         })),
         summary,
         settings: settings.toObject(),
      });
   } catch (err) {
      console.error("[Affiliates GET]", err);
      return NextResponse.json({ affiliates: [], summary: null });
   }
}

// POST - invite/create an affiliate
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, email, name, commissionRate } = await req.json();
      if (!businessId || !email) {
         return NextResponse.json(
            { error: "businessId and email required" },
            { status: 400 },
         );
      }

      await connectDB();
      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );

      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      if (!user)
         return NextResponse.json(
            { error: "No user with that email" },
            { status: 404 },
         );

      let code = genCode();
      while (await Affiliate.exists({ referralCode: code })) code = genCode();

      const affiliate = await Affiliate.create({
         businessId: business._id,
         userId: user._id,
         name: user.name,
         email: user.email,
         username: user.username || user.name.toLowerCase().replace(/\s+/g, ""),
         avatar: user.name.charAt(0).toUpperCase(),
         referralCode: code,
         commissionRate: Number(commissionRate) || 30,
         status: "active",
      });

      return NextResponse.json({
         affiliate: {
            id: affiliate._id.toString(),
            referralCode: affiliate.referralCode,
         },
      });
   } catch (err) {
      console.error("[Affiliates POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
