import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Campaign from "@/app/lib/models/Campaign";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

async function getBusiness(session: any, businessId: string | null) {
   if (businessId)
      return await Business.findOne({
         _id: businessId,
         userId: session.userId,
      }).lean();
   return await Business.findOne({ userId: session.userId })
      .sort({ createdAt: 1 })
      .lean();
}

// GET - list campaigns with dashboard stats
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ campaigns: [], summary: null });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";
      const tab = url.searchParams.get("tab") || "campaigns";

      await connectDB();
      const business = await getBusiness(session, businessId);
      if (!business) return NextResponse.json({ campaigns: [], summary: null });

      const query: Record<string, unknown> = { businessId: business._id };
      if (q) query.title = { $regex: q, $options: "i" };

      const campaigns = await Campaign.find(query)
         .sort({ createdAt: -1 })
         .lean();

      // Aggregate summary
      const summary = campaigns.reduce(
         (acc, c) => ({
            totalSpend: acc.totalSpend + (c.stats?.spent || 0),
            totalImpressions:
               acc.totalImpressions + (c.stats?.impressions || 0),
            totalClicks: acc.totalClicks + (c.stats?.clicks || 0),
            totalResults: acc.totalResults + (c.stats?.results || 0),
            totalRevenue: acc.totalRevenue + (c.stats?.revenue || 0),
         }),
         {
            totalSpend: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalResults: 0,
            totalRevenue: 0,
         },
      );

      return NextResponse.json({
         campaigns: campaigns.map((c) => ({
            id: c._id.toString(),
            title: c.title,
            platform: c.platform,
            objective: c.objective,
            status: c.status,
            onOff: c.onOff,
            budgetType: c.budgetType,
            budgetAmount: c.budgetAmount,
            stats: c.stats,
            createdAt: c.createdAt,
         })),
         summary,
         isEmpty: campaigns.length === 0,
      });
   } catch (err) {
      console.error("[Ads GET]", err);
      return NextResponse.json({ campaigns: [], summary: null });
   }
}

// POST - create campaign
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { businessId, title, ...rest } = body;

      if (!businessId)
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      if (!title?.trim())
         return NextResponse.json(
            { error: "Title is required" },
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

      const campaign = await Campaign.create({
         businessId: business._id,
         createdBy: session.userId,
         title: title.trim(),
         platform: rest.platform || "facebook",
         objective: rest.objective || "sales",
         budgetType: rest.budgetType || "daily",
         budgetAmount: Number(rest.budgetAmount) || 0,
         budgetControl: rest.budgetControl || "campaign",
         bidStrategy: rest.bidStrategy || "highest_volume",
         specialAdCategory: rest.specialAdCategory || "none",
         status: "active",
         onOff: true,
         conversionLocation: rest.conversionLocation || "website",
         conversionEvent: rest.conversionEvent || "",
         advantagePlacements: rest.advantagePlacements !== false,
         advantageAudience: rest.advantageAudience !== false,
         minAge: Number(rest.minAge) || 18,
         countries: Array.isArray(rest.countries)
            ? rest.countries
            : ["United States"],
         facebookPage: rest.facebookPage || "",
         instagramAccount: rest.instagramAccount || "",
         messageDestinations: rest.messageDestinations || {
            messenger: true,
            instagram: false,
         },
         performanceGoal: rest.performanceGoal || "maximize_conversions",
         startDate: rest.startDate ? new Date(rest.startDate) : new Date(),
         endDate: rest.endDate ? new Date(rest.endDate) : null,
         setEndDate: !!rest.setEndDate,
         deliveryHours: rest.deliveryHours || "all_day",
         minDailySpend: Number(rest.minDailySpend) || 0,
         languages: Array.isArray(rest.languages) ? rest.languages : [],
      });

      return NextResponse.json({
         campaign: { id: campaign._id.toString(), title: campaign.title },
      });
   } catch (err) {
      console.error("[Ads POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
