import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Transaction from "@/app/lib/models/Transaction";
import Website from "@/app/lib/models/Website";
import LiveEvent from "@/app/lib/models/LiveEvent";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

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
         return NextResponse.json(
            { error: "No business found" },
            { status: 404 },
         );
      }

      const bizId = business._id;

      // ---- Time range ----
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // ---- Today's transactions ----
      const todayTx = await Transaction.find({
         businessId: bizId,
         createdAt: { $gte: today },
         status: "completed",
      }).lean();

      const yesterdayTx = await Transaction.find({
         businessId: bizId,
         createdAt: { $gte: yesterday, $lt: today },
         status: "completed",
      }).lean();

      // ---- Profit calculation ----
      const calcProfit = (txs: any[]) => {
         let moneyIn = 0;
         let moneyOut = 0;
         txs.forEach((t) => {
            if (["deposit", "payment"].includes(t.kind)) moneyIn += t.amount;
            if (
               [
                  "send",
                  "refund",
                  "withdrawal",
                  "card_spend",
                  "ad_spend",
               ].includes(t.kind)
            ) {
               moneyOut += t.amount;
            }
         });
         return { moneyIn, moneyOut, profit: moneyIn - moneyOut };
      };

      const todayProfit = calcProfit(todayTx);
      const yesterdayProfit = calcProfit(yesterdayTx);

      // ---- Hourly chart for today (24 hours) ----
      const hourlyProfit: {
         hour: number;
         profit: number;
         moneyIn: number;
         moneyOut: number;
      }[] = [];
      for (let h = 0; h < 24; h++) {
         const hourStart = new Date(today);
         hourStart.setHours(h, 0, 0, 0);
         const hourEnd = new Date(today);
         hourEnd.setHours(h, 59, 59, 999);

         const hourTx = todayTx.filter((t) => {
            const created = new Date(t.createdAt);
            return created >= hourStart && created <= hourEnd;
         });

         const { moneyIn, moneyOut, profit } = calcProfit(hourTx);
         hourlyProfit.push({ hour: h, profit, moneyIn, moneyOut });
      }

      // ---- Cashflow breakdown ----
      const paymentsCount = todayTx.filter((t) => t.kind === "payment").length;
      const cardSpendCount = todayTx.filter(
         (t) => t.kind === "card_spend",
      ).length;
      const adsCount = todayTx.filter((t) => t.kind === "ad_spend").length;

      // ---- Metrics ----
      const adSpend = todayTx
         .filter((t) => t.kind === "ad_spend")
         .reduce((s, t) => s + t.amount, 0);

      const successfulPayments = todayTx.filter(
         (t) => t.kind === "payment",
      ).length;

      const grossTransactionValue = todayTx
         .filter((t) => t.kind === "payment")
         .reduce((s, t) => s + t.amount, 0);

      const avgRevenuePerCustomer =
         successfulPayments > 0
            ? grossTransactionValue / successfulPayments
            : 0;

      const refundedToday = todayTx
         .filter((t) => t.kind === "refund")
         .reduce((s, t) => s + t.amount, 0);

      // ---- Visitors from websites ----
      const websites = await Website.find({ businessId: bizId }).lean();
      const totalVisitors = websites.reduce((s, w) => s + w.visits, 0);
      const totalPageViews = websites.reduce((s, w) => s + w.pageViews, 0);
      const totalCheckouts = websites.reduce((s, w) => s + w.checkouts, 0);

      // ---- Top sources / pages from websites ----
      const sourceMap = new Map<string, number>();
      const pageMap = new Map<string, number>();

      websites.forEach((w) => {
         (w.topSources || []).forEach((s: any) => {
            sourceMap.set(s.source, (sourceMap.get(s.source) || 0) + s.visits);
         });
         (w.topPages || []).forEach((p: any) => {
            pageMap.set(p.path, (pageMap.get(p.path) || 0) + p.visits);
         });
      });

      const topSources = Array.from(sourceMap.entries())
         .map(([source, visits]) => ({ source, visits }))
         .sort((a, b) => b.visits - a.visits)
         .slice(0, 5);

      const topPages = Array.from(pageMap.entries())
         .map(([path, visits]) => ({ path, visits }))
         .sort((a, b) => b.visits - a.visits)
         .slice(0, 5);

      // ---- Traffic by time (hourly visitors) ----
      const trafficByHour = Array.from({ length: 24 }, (_, i) => ({
         hour: i,
         visitors: 0,
      }));

      // ---- Live events ----
      const liveEvents = await LiveEvent.find({ businessId: bizId })
         .sort({ createdAt: -1 })
         .limit(20)
         .lean();

      // ---- Rate calculations ----
      const refundRate =
         grossTransactionValue > 0
            ? (refundedToday / grossTransactionValue) * 100
            : 0;
      const disputeRate = 0;

      // ---- Members ----
      const paidActiveMembers = 0; // placeholder for subscription system
      const churnRate = 0;
      const churnedRevenue = 0;

      const mrr = 0; // monthly recurring revenue placeholder

      return NextResponse.json({
         business: {
            id: bizId.toString(),
            name: business.name,
            initial: business.initial,
         },
         date: today.toISOString().split("T")[0],

         profit: {
            today: todayProfit.profit,
            yesterday: yesterdayProfit.profit,
            moneyIn: todayProfit.moneyIn,
            moneyOut: todayProfit.moneyOut,
            hourly: hourlyProfit,
         },

         cashflow: {
            payments: { count: paymentsCount, amount: todayProfit.moneyIn },
            cardSpend: {
               count: cardSpendCount,
               amount: todayTx
                  .filter((t) => t.kind === "card_spend")
                  .reduce((s, t) => s + t.amount, 0),
            },
            ads: {
               count: adsCount,
               amount: adSpend,
            },
         },

         metrics: {
            adSpend,
            visitors: totalVisitors,
            successfulPayments,
            profitMargin:
               todayProfit.moneyIn > 0
                  ? (todayProfit.profit / todayProfit.moneyIn) * 100
                  : 0,
            grossTransactionValue,
            avgRevenuePerCustomer,
            totalRefunded: refundedToday,
            newCustomers: successfulPayments,
            refundRate,
            disputeRate,
            paidActiveMembers,
            churnRate,
            churnedRevenue,
            mrr,
            grossPaymentRevenue: grossTransactionValue,
         },

         traffic: {
            visitors: totalVisitors,
            pageViews: totalPageViews,
            checkouts: totalCheckouts,
            byHour: trafficByHour,
            topSources,
            topPages,
            abandonedCheckouts: 0,
         },

         usersBreakdown: {
            joined: successfulPayments,
            total: successfulPayments,
         },

         liveEvents: liveEvents.map((e) => ({
            id: e._id.toString(),
            type: e.type,
            country: e.country,
            city: e.city,
            message: e.message,
            amount: e.amount,
            createdAt: e.createdAt,
         })),

         websites: websites.map((w) => ({
            id: w._id.toString(),
            domain: w.domain,
            name: w.name,
            status: w.status,
            visits: w.visits,
         })),
      });
   } catch (err) {
      console.error("[Business Analytics GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
