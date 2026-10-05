import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// GET — fetch current business settings
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("id");

      await connectDB();

      let business;
      if (businessId) {
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      } else {
         // ✅ Fallback: get the user's first business
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      }

      if (!business) {
         return NextResponse.json({ business: null });
      }

      return NextResponse.json({ business });
   } catch (err) {
      console.error("[Business Settings GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

// PATCH — update any subset of settings
export async function PATCH(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { businessId, ...updates } = body;

      if (!businessId) {
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      }

      await connectDB();

      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });

      if (!business) {
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );
      }

      // Whitelist of updatable fields
      const allowed = [
         "name",
         "description",
         "logoUrl",
         "website",
         "industry",
         "analyticsPixels",
         "notificationPrefs",
         "checkout",
         "checkoutBranding",
         "payments",
         "verification",
         "invoices",
         "legal",
         "tax",
         "openGraph",
         "homePreferences",
      ];

      for (const key of allowed) {
         if (key in updates) {
            (business as any)[key] = updates[key];
         }
      }

      // If name changed, update initial
      if (updates.name) {
         business.initial = String(updates.name).charAt(0).toUpperCase() || "B";
      }

      await business.save();

      return NextResponse.json({ business: business.toObject() });
   } catch (err) {
      console.error("[Business Settings PATCH]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

// DELETE — delete the business
export async function DELETE(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("id");
      if (!businessId) {
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      }

      await connectDB();
      await Business.deleteOne({ _id: businessId, userId: session.userId });

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error("[Business Settings DELETE]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
