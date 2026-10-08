import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Product from "@/app/lib/models/Product";
import Payment from "@/app/lib/models/Payment";
import Campaign from "@/app/lib/models/Campaign";
import CampaignContribution from "@/app/lib/models/CampaignContribution";
import Customer from "@/app/lib/models/Customer";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
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
      if (!business)
         return NextResponse.json(
            { error: "No business found" },
            { status: 404 },
         );

      const bizId = business._id;

      // ─── PAYMENTS ───
      const payments = await Payment.find({ businessId: bizId }).lean();
      const succeeded = payments.filter((p) => p.status === "succeeded");
      const failed = payments.filter((p) => p.status === "failed");
      const refunded = payments.filter((p) => p.refunded);

      const grossRevenue = succeeded.reduce((s, p) => s + p.amount, 0);
      const refundedAmount = refunded.reduce((s, p) => s + p.amount, 0);
      const netRevenue = grossRevenue - refundedAmount;
      const totalPayments = succeeded.length;
      const avgOrderValue =
         totalPayments > 0 ? grossRevenue / totalPayments : 0;

      // ─── PRODUCTS ───
      const products = await Product.find({ businessId: bizId }).lean();
      const activeProducts = products.filter((p) => p.visibility === "visible");
      const topProducts = [...products]
         .sort(
            (a, b) =>
               (b.stats?.allTimeRevenue || 0) - (a.stats?.allTimeRevenue || 0),
         )
         .slice(0, 5);

      const totalProductRevenue = products.reduce(
         (s, p) => s + (p.stats?.allTimeRevenue || 0),
         0,
      );
      const totalActiveUsers = products.reduce(
         (s, p) => s + (p.stats?.activeUsers || 0),
         0,
      );

      // ─── CAMPAIGNS ───
      const campaigns = await Campaign.find({ businessId: bizId }).lean();
      const activeCampaigns = campaigns.filter((c) => c.status === "active");
      const totalCampaignBudget = campaigns.reduce((s, c) => s + c.budget, 0);
      const totalCampaignSpent = campaigns.reduce(
         (s, c) => s + c.budgetSpent,
         0,
      );
      const totalCampaignViews = campaigns.reduce(
         (s, c) => s + c.totalViews,
         0,
      );
      const totalCampaignCreators = campaigns.reduce(
         (s, c) => s + c.joinedUsers,
         0,
      );

      const topCampaigns = [...campaigns]
         .sort((a, b) => b.budgetSpent - a.budgetSpent)
         .slice(0, 5)
         .map((c) => ({
            id: c._id.toString(),
            slug: c.slug,
            title: c.title,
            budget: c.budget,
            budgetSpent: c.budgetSpent,
            totalViews: c.totalViews,
            joinedUsers: c.joinedUsers,
            cpm: c.cpm,
            status: c.status,
         }));

      // Top contributors across campaigns
      const campaignIds = campaigns.map((c) => c._id);
      const contributors = await CampaignContribution.find({
         campaignId: { $in: campaignIds },
      })
         .sort({ totalEarned: -1 })
         .limit(10)
         .lean();

      const topCreators = contributors.map((c) => ({
         id: c._id.toString(),
         name: c.userName,
         avatar: c.userAvatar,
         views: c.totalViews,
         earned: c.totalEarned,
      }));

      // ─── CUSTOMERS ───
      const customers = await Customer.find({ businessId: bizId }).lean();
      const joinedCustomers = customers.filter((c) => c.status === "joined");
      const totalCustomerSpend = customers.reduce(
         (s, c) => s + c.totalSpend,
         0,
      );

      // ─── REVENUE CHART (last 30 days) ───
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPayments = await Payment.find({
         businessId: bizId,
         status: "succeeded",
         createdAt: { $gte: thirtyDaysAgo },
      }).lean();

      const chartData: { date: string; revenue: number; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
         const day = new Date();
         day.setDate(day.getDate() - i);
         const dayStart = new Date(day.setHours(0, 0, 0, 0));
         const dayEnd = new Date(day.setHours(23, 59, 59, 999));

         const dayPayments = recentPayments.filter((p) => {
            const d = new Date(p.createdAt);
            return d >= dayStart && d <= dayEnd;
         });

         chartData.push({
            date: day.toISOString().split("T")[0],
            revenue: dayPayments.reduce((s, p) => s + p.amount, 0),
            count: dayPayments.length,
         });
      }

      // ─── CUSTOMER GROWTH (30 days) ───
      const customerChart: { date: string; count: number }[] = [];
      let running = 0;
      for (let i = 29; i >= 0; i--) {
         const day = new Date();
         day.setDate(day.getDate() - i);
         const dayEnd = new Date(day.setHours(23, 59, 59, 999));

         const joinedBefore = customers.filter(
            (c) => new Date(c.joinedAt) <= dayEnd,
         ).length;

         customerChart.push({
            date: day.toISOString().split("T")[0],
            count: joinedBefore,
         });
      }

      return NextResponse.json({
         business: {
            id: bizId.toString(),
            name: business.name,
            balance: business.balance || 0,
         },
         revenue: {
            gross: grossRevenue,
            net: netRevenue,
            refunded: refundedAmount,
            avgOrderValue,
            totalTransactions: payments.length,
            successfulTransactions: succeeded.length,
            failedTransactions: failed.length,
            failedRate:
               payments.length > 0
                  ? (failed.length / payments.length) * 100
                  : 0,
            chart: chartData,
         },
         products: {
            total: products.length,
            active: activeProducts.length,
            totalRevenue: totalProductRevenue,
            totalActiveUsers,
            top: topProducts.map((p) => ({
               id: p._id.toString(),
               name: p.name,
               slug: p.slug,
               revenue: p.stats?.allTimeRevenue || 0,
               activeUsers: p.stats?.activeUsers || 0,
               visibility: p.visibility,
            })),
         },
         campaigns: {
            total: campaigns.length,
            active: activeCampaigns.length,
            totalBudget: totalCampaignBudget,
            totalSpent: totalCampaignSpent,
            totalViews: totalCampaignViews,
            totalCreators: totalCampaignCreators,
            avgCpm:
               totalCampaignViews > 0
                  ? (totalCampaignSpent / totalCampaignViews) * 1000
                  : 0,
            top: topCampaigns,
         },
         customers: {
            total: customers.length,
            joined: joinedCustomers.length,
            totalSpend: totalCustomerSpend,
            growth: customerChart,
         },
         creators: {
            top: topCreators,
         },
      });
   } catch (err) {
      console.error("[Analytics GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
