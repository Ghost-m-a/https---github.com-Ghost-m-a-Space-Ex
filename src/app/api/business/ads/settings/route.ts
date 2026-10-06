import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import AdSettings from "@/app/lib/models/AdSettings";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ settings: null });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

      await connectDB();
      let business;
      if (businessId) {
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      } else {
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      }
      if (!business) return NextResponse.json({ settings: null });

      // Upsert — create default if missing
      let settings = await AdSettings.findOne({ businessId: business._id });
      if (!settings) {
         settings = await AdSettings.create({ businessId: business._id });
      }

      return NextResponse.json({ settings: settings.toObject() });
   } catch (err) {
      return NextResponse.json({ settings: null });
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
         "reportingCurrency",
         "accountTimezone",
         "prescriptionDrugCertified",
         "tripleWhaleApiKey",
         "shopDomain",
         "metaFacebookPage",
         "metaInstagramAccount",
         "metaPixelId",
      ];

      const update: Record<string, unknown> = {};
      for (const key of allowed) {
         if (key in patch) update[key] = patch[key];
      }

      const settings = await AdSettings.findOneAndUpdate(
         { businessId: business._id },
         { $set: update },
         { new: true, upsert: true },
      );

      return NextResponse.json({ settings: settings.toObject() });
   } catch (err) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
