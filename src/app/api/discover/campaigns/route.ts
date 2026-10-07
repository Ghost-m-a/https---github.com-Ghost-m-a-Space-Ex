import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import DiscoverCampaign from "@/app/lib/models/DiscoverCampaign";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

// GET — list campaigns with filters
export async function GET(req: NextRequest) {
   try {
      const url = new URL(req.url);
      const q = url.searchParams.get("q") || "";
      const social = url.searchParams.get("social") || "";
      const category = url.searchParams.get("category") || "";
      const sort = url.searchParams.get("sort") || "top";

      await connectDB();

      const query: Record<string, unknown> = { status: "active" };
      if (q) query.title = { $regex: q, $options: "i" };
      if (social) query.socials = { $in: [social] };
      if (category && category !== "all") query.category = category;

      let sortQuery: Record<string, 1 | -1> = { budget: -1 };
      if (sort === "newest") sortQuery = { createdAt: -1 };
      if (sort === "cpm") sortQuery = { cpm: -1 };
      if (sort === "top") sortQuery = { featured: -1, budget: -1 };

      const campaigns = await DiscoverCampaign.find(query)
         .sort(sortQuery)
         .limit(60)
         .lean();

      return NextResponse.json({
         campaigns: campaigns.map((c) => ({
            id: c._id.toString(),
            slug: c.slug,
            title: c.title,
            subtitle: c.subtitle,
            category: c.category,
            previewImage: c.previewImage,
            brandName: c.brandName,
            brandAvatar: c.brandAvatar,
            brandVerified: c.brandVerified,
            socials: c.socials,
            budget: c.budget,
            raised: c.raised,
            cpm: c.cpm,
            totalEarned: c.totalEarned,
            duration: c.duration,
            ageRestricted: c.ageRestricted,
            featured: c.featured,
         })),
      });
   } catch (err) {
      console.error("[Discover campaigns GET]", err);
      return NextResponse.json({ campaigns: [] });
   }
}

// POST — create a campaign (for creators/brands)
export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { title, budget, cpm, category, socials, previewImage, brandName } =
         body;

      if (!title)
         return NextResponse.json({ error: "Title required" }, { status: 400 });

      await connectDB();

      const slug =
         title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 50) +
         "-" +
         Date.now().toString(36);

      const campaign = await DiscoverCampaign.create({
         slug,
         title,
         subtitle: body.subtitle || "",
         category: category || "Entertainment",
         previewImage: previewImage || "",
         brandName: brandName || "Space/Ex",
         brandVerified: true,
         socials: Array.isArray(socials) ? socials : ["youtube", "tiktok"],
         budget: Number(budget) || 0,
         raised: 0,
         cpm: Number(cpm) || 0,
         totalEarned: 0,
         status: "active",
         duration: body.duration || "5d",
         createdBy: session.userId as any,
      });

      return NextResponse.json({
         campaign: { id: campaign._id.toString(), slug: campaign.slug },
      });
   } catch (err) {
      console.error("[Discover campaigns POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
