import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import AffiliateSettings from "@/models/AffiliateSettings";
import Affiliate from "@/models/Affiliate";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ settings: null, pending: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

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
      if (!business) return NextResponse.json({ settings: null, pending: [] });

      let settings = await AffiliateSettings.findOne({
         businessId: business._id,
      });
      if (!settings) {
         settings = await AffiliateSettings.create({
            businessId: business._id,
            portalLink: `space-ex.com/${business.initial.toLowerCase()}/affiliates`,
         });
      }

      const pending = await Affiliate.find({
         businessId: business._id,
         status: "pending",
      })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         settings: settings.toObject(),
         pending: pending.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            email: p.email,
            date: p.createdAt,
         })),
      });
   } catch {
      return NextResponse.json({ settings: null, pending: [] });
   }
}

export async function PATCH(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, ...patch } = await req.json();
      if (!businessId)
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );

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

      const allowed = [
         "waitlistEnabled",
         "defaultCommission",
         "portalLink",
         "defaultProductCommission",
      ];
      const update: Record<string, unknown> = {};
      for (const key of allowed) if (key in patch) update[key] = patch[key];

      const settings = await AffiliateSettings.findOneAndUpdate(
         { businessId: business._id },
         { $set: update },
         { new: true, upsert: true },
      );

      return NextResponse.json({ settings: settings.toObject() });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
