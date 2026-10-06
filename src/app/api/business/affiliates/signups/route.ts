import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import AffiliateSignup from "@/app/lib/models/AffiliateSignup";
import Affiliate from "@/app/lib/models/Affiliate";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ signups: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";
      const status = url.searchParams.get("status") || "";

      await connectDB();
      let business;
      if (businessId)
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      else
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      if (!business) return NextResponse.json({ signups: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;
      if (q)
         query.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
         ];

      const signups = await AffiliateSignup.find(query)
         .sort({ signedUpAt: -1 })
         .lean();

      return NextResponse.json({
         signups: signups.map((s) => ({
            id: s._id.toString(),
            name: s.name,
            email: s.email,
            username: s.username,
            avatar: s.avatar,
            product: s.product,
            status: s.status,
            referrals: s.referrals,
            rewardsEarned: s.rewardsEarned,
            signedUpAt: s.signedUpAt,
         })),
      });
   } catch {
      return NextResponse.json({ signups: [] });
   }
}

// Approve/reject a pending signup (portal applications)
export async function PATCH(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { id, action } = await req.json();
      if (!id || !["approve", "reject"].includes(action)) {
         return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 },
         );
      }

      await connectDB();
      const signup = await AffiliateSignup.findById(id);
      if (!signup)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: signup.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      if (action === "approve") {
         // Create affiliate from this application
         let code = Math.random().toString(36).slice(2, 10).toUpperCase();
         while (await Affiliate.exists({ referralCode: code }))
            code = Math.random().toString(36).slice(2, 10).toUpperCase();

         await Affiliate.create({
            businessId: business._id,
            userId: signup.affiliateId,
            name: signup.name,
            email: signup.email,
            username: signup.username,
            avatar: signup.avatar,
            referralCode: code,
            status: "active",
         });
         signup.status = "active";
      } else {
         signup.status = "inactive";
      }

      await signup.save();
      return NextResponse.json({ success: true });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
