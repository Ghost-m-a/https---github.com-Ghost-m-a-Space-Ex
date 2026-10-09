import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import CampaignContribution from "@/models/CampaignContribution";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const url = new URL(req.url);
      const q = url.searchParams.get("q") || "";
      const social = url.searchParams.get("social") || "";
      const category = url.searchParams.get("category") || "";
      const sort = url.searchParams.get("sort") || "top";

      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = token ? await verifySessionToken(token) : null;

      await connectDB();

      const query: Record<string, unknown> = { status: "active" };
      if (q) query.title = { $regex: q, $options: "i" };
      if (social) query.socials = { $in: [social] };
      if (category && category !== "all") query.category = category;

      let sortQuery: Record<string, 1 | -1> = { featured: -1, budget: -1 };
      if (sort === "newest") sortQuery = { createdAt: -1 };
      if (sort === "cpm") sortQuery = { cpm: -1 };
      if (sort === "budget") sortQuery = { budget: -1 };

      const campaigns = await Campaign.find(query)
         .sort(sortQuery)
         .limit(60)
         .lean();

      // Which campaigns has the current user joined?
      let joinedIds = new Set<string>();
      if (session) {
         const myContribs = await CampaignContribution.find({
            userId: session.userId,
         }).lean();
         joinedIds = new Set(myContribs.map((c) => c.campaignId.toString()));
      }

      return NextResponse.json({
         campaigns: campaigns.map((c) => ({
            id: c._id.toString(),
            slug: c.slug,
            title: c.title,
            subtitle: c.subtitle,
            category: c.category,
            coverImage: c.coverImage,
            previewImage: c.previewImage,
            brandName: c.brandName,
            brandAvatar: c.brandAvatar,
            brandVerified: c.brandVerified,
            socials: c.socials,
            budget: c.budget,
            budgetSpent: c.budgetSpent,
            budgetRemaining: Math.max(0, c.budget - c.budgetSpent),
            cpm: c.cpm,
            joinedUsers: c.joinedUsers,
            totalViews: c.totalViews,
            duration: c.duration,
            featured: c.featured,
            joined: joinedIds.has(c._id.toString()),
         })),
      });
   } catch (err) {
      console.error("[Campaigns GET]", err);
      return NextResponse.json({ campaigns: [] });
   }
}
