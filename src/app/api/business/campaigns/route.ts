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

function slugify(t: string) {
   return t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ campaigns: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

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
      if (!business) return NextResponse.json({ campaigns: [] });

      const campaigns = await Campaign.find({ businessId: business._id })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         campaigns: campaigns.map((c) => ({
            id: c._id.toString(),
            slug: c.slug,
            title: c.title,
            coverImage: c.coverImage,
            budget: c.budget,
            budgetSpent: c.budgetSpent,
            budgetRemaining: Math.max(0, c.budget - c.budgetSpent),
            cpm: c.cpm,
            joinedUsers: c.joinedUsers,
            totalViews: c.totalViews,
            status: c.status,
            createdAt: c.createdAt,
         })),
      });
   } catch {
      return NextResponse.json({ campaigns: [] });
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
         title,
         subtitle,
         category,
         coverImage,
         budget,
         cpm,
         duration,
         socials,
         platformRates,
         requirements,
         instructions,
         summary,
         assets,
      } = body;

      if (!businessId || !title || !budget) {
         return NextResponse.json(
            { error: "businessId, title, and budget are required" },
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

      const baseSlug = slugify(title) || `campaign-${Date.now()}`;
      let slug = baseSlug;
      let counter = 1;
      while (await Campaign.exists({ slug })) {
         slug = `${baseSlug}-${counter++}`;
      }

      const campaign = await Campaign.create({
         businessId: business._id,
         createdBy: session.userId,
         slug,
         title: title.trim(),
         subtitle: subtitle || "",
         category: category || "Entertainment",
         coverImage: coverImage || "",
         previewImage: coverImage || "",
         brandName: business.name,
         brandAvatar: business.initial,
         brandVerified: true,
         budget: Number(budget),
         budgetSpent: 0,
         cpm: Number(cpm) || 1,
         duration: duration || "",
         socials: Array.isArray(socials) ? socials : ["youtube", "tiktok"],
         platformRates: Array.isArray(platformRates) ? platformRates : [],
         requirements: Array.isArray(requirements) ? requirements : [],
         instructions: Array.isArray(instructions) ? instructions : [],
         assets: Array.isArray(assets) ? assets : [],
         summary: summary || "",
         joinedUsers: 0,
         totalViews: 0,
         status: "active",
         featured: false,
         startDate: new Date(),
      });

      return NextResponse.json({
         campaign: { id: campaign._id.toString(), slug: campaign.slug },
      });
   } catch (err) {
      console.error("[Business campaigns POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
