import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Transaction from "@/models/Transaction";
import Website from "@/models/Website";
import LiveEvent from "@/models/LiveEvent";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

      if (!business) {
         return NextResponse.json({ business: null }, { status: 404 });
      }

      const bizId = business._id;

      // ---- Balance chart (last 30 days) ----
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactions = await Transaction.find({
         businessId: bizId,
         createdAt: { $gte: thirtyDaysAgo },
         status: "completed",
      })
         .sort({ createdAt: 1 })
         .lean();

      // Build daily balance series
      const chartData: { date: string; balance: number }[] = [];
      let running = 0;

      // Start from 0 balance 30 days ago
      for (let i = 30; i >= 0; i--) {
         const d = new Date();
         d.setDate(d.getDate() - i);
         const dayStart = new Date(d.setHours(0, 0, 0, 0));
         const dayEnd = new Date(d.setHours(23, 59, 59, 999));

         const dayTx = transactions.filter((t) => {
            const created = new Date(t.createdAt);
            return created >= dayStart && created <= dayEnd;
         });

         for (const tx of dayTx) {
            if (["deposit", "payment"].includes(tx.kind)) running += tx.amount;
            if (
               [
                  "send",
                  "refund",
                  "withdrawal",
                  "card_spend",
                  "ad_spend",
               ].includes(tx.kind)
            ) {
               running -= tx.amount;
            }
         }

         chartData.push({
            date: d.toISOString().split("T")[0],
            balance: Math.max(0, running),
         });
      }

      // ---- Websites ----
      const websites = await Website.find({ businessId: bizId }).lean();

      // ---- Card spend (7 days) ----
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cardSpends = await Transaction.find({
         businessId: bizId,
         kind: "card_spend",
         status: "completed",
         createdAt: { $gte: sevenDaysAgo },
      }).lean();

      const weeklySpend = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
      cardSpends.forEach((t) => {
         const d = new Date(t.createdAt);
         const dayIdx = (d.getDay() + 6) % 7; // Mon=0
         weeklySpend[dayIdx] += t.amount;
      });

      // ---- Live events (last 10) ----
      const liveEvents = await LiveEvent.find({ businessId: bizId })
         .sort({ createdAt: -1 })
         .limit(10)
         .lean();

      return NextResponse.json({
         business: {
            id: bizId.toString(),
            name: business.name,
            initial: business.initial,
            balance: business.balance || 0,
            economicIntelligence: business.economicIntelligence || false,
         },
         chartData,
         websites: websites.map((w) => ({
            id: w._id.toString(),
            domain: w.domain,
            name: w.name,
            status: w.status,
            visits: w.visits,
         })),
         weeklyCardSpend: weeklySpend,
         cardSpendTotal: weeklySpend.reduce((s, v) => s + v, 0),
         liveEvents: liveEvents.map((e) => ({
            id: e._id.toString(),
            type: e.type,
            country: e.country,
            city: e.city,
            message: e.message,
            amount: e.amount,
            createdAt: e.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Business Home GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
