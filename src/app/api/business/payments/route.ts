import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Payment from "@/app/lib/models/Payment";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// =========================================
// GET — list payments with filters + stats
// =========================================
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ payments: [], stats: {} });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const status = url.searchParams.get("status");
      const method = url.searchParams.get("method");
      const q = url.searchParams.get("q") || "";

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

      if (!business) return NextResponse.json({ payments: [], stats: {} });

      // Build query
      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;
      if (method) query.method = method;
      if (q) {
         query.$or = [
            { email: { $regex: q, $options: "i" } },
            { customerName: { $regex: q, $options: "i" } },
            { product: { $regex: q, $options: "i" } },
         ];
      }

      const payments = await Payment.find(query)
         .sort({ createdAt: -1 })
         .limit(100)
         .lean();

      // Stats — count per status
      const statusCounts = await Payment.aggregate([
         { $match: { businessId: business._id } },
         { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const stats: Record<string, number> = {
         all: 0,
         needs_review: 0,
         succeeded: 0,
         resolution: 0,
         disputed: 0,
         failed: 0,
         pending: 0,
         blocked: 0,
      };

      statusCounts.forEach((s: { _id: string; count: number }) => {
         if (s._id in stats) stats[s._id] = s.count;
         stats.all += s.count;
      });

      return NextResponse.json({
         payments: payments.map((p) => ({
            id: p._id.toString(),
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            product: p.product,
            plan: p.plan,
            method: p.method,
            methodLast4: p.methodLast4,
            email: p.email,
            customerName: p.customerName,
            reason: p.reason,
            promoCode: p.promoCode,
            userAvatar: p.userAvatar,
            refunded: p.refunded,
            createdAt: p.createdAt,
         })),
         stats,
      });
   } catch (err) {
      console.error("[Payments GET]", err);
      return NextResponse.json({ payments: [], stats: {} });
   }
}

// =========================================
// POST — create a test payment (for demo)
// =========================================
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, amount, email, productName } = await req.json();

      if (!businessId || !amount) {
         return NextResponse.json(
            { error: "businessId and amount required" },
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

      const payment = await Payment.create({
         businessId: business._id,
         amount: Number(amount),
         status: "succeeded",
         product: productName || "Custom payment",
         plan: "One-time",
         method: "card",
         methodLast4: "4242",
         email: email || "customer@example.com",
         reason: "",
         promoCode: "",
         refunded: false,
      });

      // Update business balance
      business.balance = (business.balance || 0) + Number(amount);
      await business.save();

      return NextResponse.json({ payment: { id: payment._id.toString() } });
   } catch (err) {
      console.error("[Payments POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
