import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import PromoCode from "@/models/PromoCode";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ codes: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const status = url.searchParams.get("status") || "active";

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
      if (!business) return NextResponse.json({ codes: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;

      const codes = await PromoCode.find(query).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
         codes: codes.map((c) => ({
            id: c._id.toString(),
            code: c.code,
            discount: c.discount,
            discountType: c.discountType,
            discountDuration: c.discountDuration,
            eligibleUsers: c.eligibleUsers,
            status: c.status,
            uses: c.uses,
            maxRedemptions: c.maxRedemptions,
            expiresAt: c.expiresAt,
            createdAt: c.createdAt,
         })),
      });
   } catch {
      return NextResponse.json({ codes: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const {
         businessId,
         code,
         discount,
         discountType,
         discountDuration,
         eligibleUsers,
         expiresAt,
         maxRedemptions,
         onePerUser,
         appliesToProducts,
      } = body;

      if (!businessId || !code)
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });

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

      const upper = String(code).toUpperCase().trim();
      const exists = await PromoCode.exists({
         businessId: business._id,
         code: upper,
      });
      if (exists)
         return NextResponse.json(
            { error: "Code already exists" },
            { status: 409 },
         );

      const pc = await PromoCode.create({
         businessId: business._id,
         code: upper,
         discount: Number(discount) || 0,
         discountType: discountType || "percentage",
         discountDuration: discountDuration || "forever",
         eligibleUsers: eligibleUsers || "everyone",
         expiresAt: expiresAt ? new Date(expiresAt) : undefined,
         maxRedemptions: Number(maxRedemptions) || 0,
         onePerUser: onePerUser !== false,
         appliesToProducts: Array.isArray(appliesToProducts)
            ? appliesToProducts
            : [],
         status: "active",
      });

      return NextResponse.json({
         code: { id: pc._id.toString(), code: pc.code },
      });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
