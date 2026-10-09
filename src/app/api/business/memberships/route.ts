import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Membership from "@/models/Membership";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ memberships: [], stats: {} });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const status = url.searchParams.get("status") || "";

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
      if (!business) return NextResponse.json({ memberships: [], stats: {} });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;

      const memberships = await Membership.find(query)
         .sort({ createdAt: -1 })
         .lean();

      // Stats
      const counts = await Membership.aggregate([
         { $match: { businessId: business._id } },
         { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const stats: Record<string, number> = { all: 0, active: 0, inactive: 0 };
      counts.forEach((c: { _id: string; count: number }) => {
         if (c._id in stats) stats[c._id] = c.count;
         stats.all += c.count;
      });

      return NextResponse.json({
         memberships: memberships.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            email: m.email,
            avatar: m.avatar,
            productName: m.productName,
            status: m.status,
            totalSpend: m.totalSpend,
            createdAt: m.createdAt,
            canceledAt: m.canceledAt,
            cancelReason: m.cancelReason,
         })),
         stats,
      });
   } catch (err) {
      console.error("[Memberships GET]", err);
      return NextResponse.json({ memberships: [], stats: {} });
   }
}
