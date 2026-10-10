import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// --------------------------------------------------
// GET — list campaigns owned by current user's business
// --------------------------------------------------
export async function GET() {
   try {
      await connectDB();

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ campaigns: [] }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) return NextResponse.json({ campaigns: [] });

      const campaigns = await Campaign.find({ businessId: business._id })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({ campaigns });
   } catch (err) {
      console.error("[GET /api/business/campaigns]", err);
      return NextResponse.json(
         { campaigns: [], error: "Failed to load campaigns" },
         { status: 500 },
      );
   }
}

// --------------------------------------------------
// POST — create a new campaign
// --------------------------------------------------
export async function POST(req: Request) {
   try {
      await connectDB();

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();

      const {
         title,
         subtitle,
         category,
         summary,
         coverImage,
         adFormat,
         platform,
         socials,
         objective,
         conversionEvent,
         budget,
         budgetType,
         bidStrategy,
         cpm,
         targetCountries,
         targetLanguages,
         minAge,
         maxAge,
         globalReach,
         minFollowers,
         minEngagement,
         creatorRequirements,
         deliverable,
         instructions,
         requirements,
         startDate,
         endDate,
      } = body ?? {};

      // ---- Validation ----
      if (!title || typeof title !== "string" || !title.trim()) {
         return NextResponse.json(
            { error: "Campaign title is required" },
            { status: 400 },
         );
      }
      if (typeof budget !== "number" || budget <= 0) {
         return NextResponse.json(
            { error: "Budget must be a positive number" },
            { status: 400 },
         );
      }
      if (typeof cpm !== "number" || cpm <= 0) {
         return NextResponse.json(
            { error: "Reward rate (CPM) must be positive" },
            { status: 400 },
         );
      }
      if (!Array.isArray(socials) || socials.length === 0) {
         return NextResponse.json(
            { error: "Select at least one platform" },
            { status: 400 },
         );
      }

      // ---- Business ----
      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json(
            { error: "Create a business before creating campaigns." },
            { status: 400 },
         );
      }

      // ---- Unique slug ----
      const baseSlug = title
         .toLowerCase()
         .replace(/[^\w\s-]/g, "")
         .replace(/\s+/g, "-")
         .slice(0, 50);
      const suffix = Math.random().toString(36).slice(2, 8);
      const slug = `${baseSlug}-${suffix}`;

      // ---- Create ----
      const campaign = await Campaign.create({
         businessId: business._id,
         createdBy: userId,
         slug,
         title: title.trim(),
         subtitle: subtitle ?? "",
         category: category ?? "General",
         summary: summary ?? "",
         coverImage: coverImage ?? "",
         previewImage: coverImage ?? "",

         brandName: business.name ?? "Unknown",
         brandAvatar:
            business.initial ?? (business.name?.charAt(0) ?? "?").toUpperCase(),
         brandVerified: business.verification?.business === "verified",

         adFormat: adFormat ?? "short-video",
         platform: platform ?? "multi",
         socials,

         objective: objective ?? "views",
         conversionEvent: conversionEvent ?? "",

         budget,
         budgetSpent: 0,
         budgetType: budgetType ?? "lifetime",
         bidStrategy: bidStrategy ?? "highest-volume",
         cpm,

         targetCountries: targetCountries ?? [],
         targetLanguages: targetLanguages ?? [],
         minAge: minAge ?? 18,
         maxAge: maxAge ?? 65,
         globalReach: globalReach !== false,

         minFollowers: minFollowers ?? 0,
         minEngagement: minEngagement ?? 0,
         creatorRequirements: creatorRequirements ?? [],

         deliverable: deliverable ?? "",
         instructions: instructions ?? [],
         requirements: requirements ?? [],

         startDate: startDate ? new Date(startDate) : new Date(),
         endDate: endDate ? new Date(endDate) : null,

         joinedUsers: 0,
         totalViews: 0,
         status: "active",
         featured: false,
      });

      return NextResponse.json({ campaign }, { status: 201 });
   } catch (err) {
      console.error("[POST /api/business/campaigns]", err);
      return NextResponse.json(
         { error: "Failed to create campaign" },
         { status: 500 },
      );
   }
}
