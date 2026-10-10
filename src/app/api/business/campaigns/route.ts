import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) return NextResponse.json({ campaigns: [] }, { status: 401 });

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) return NextResponse.json({ campaigns: [] });

      const campaigns = await Campaign.find({ businessId: business._id })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({ campaigns });
   } catch (err) {
      console.error("[GET /api/business/campaigns]", err);
      return NextResponse.json(
         { campaigns: [], error: "Failed" },
         { status: 500 },
      );
   }
}

export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const {
         title,
         subtitle,
         category,
         summary,
         coverImage,
         adFormat,
         objective,
         platform,
         socials,
         budget,
         budgetType,
         budgetControl,
         bidStrategy,
         cpm,
         specialAdCategory,
         conversionLocation,
         conversionEvent,
         performanceGoal,
         messageDestinations,
         pageId,
         socialProfileId,
         globalReach,
         targetCountries,
         targetLanguages,
         excludedCountries,
         minAge,
         maxAge,
         autoAudience,
         audiences,
         audienceId,
         autoPlacements,
         startDate,
         endDate,
         minDailySpend,
         deliveryHours,
         headline,
         primaryText,
         ctaType,
         ctaUrl,
         mediaAssets,
         minFollowers,
         minEngagement,
         creatorRequirements,
         deliverable,
         instructions,
         requirements,
      } = body ?? {};

      if (!title?.trim()) {
         return NextResponse.json(
            { error: "Campaign title is required" },
            { status: 400 },
         );
      }
      if (typeof budget !== "number" || budget <= 0) {
         return NextResponse.json(
            { error: "Budget must be positive" },
            { status: 400 },
         );
      }
      if (typeof cpm !== "number" || cpm <= 0) {
         return NextResponse.json(
            { error: "Reward rate must be positive" },
            { status: 400 },
         );
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json(
            { error: "Create a business first" },
            { status: 400 },
         );
      }

      const baseSlug = title
         .toLowerCase()
         .replace(/[^\w\s-]/g, "")
         .replace(/\s+/g, "-")
         .slice(0, 50);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

      const campaign = await Campaign.create({
         businessId: business._id,
         createdBy: userId,
         slug,
         title: title.trim(),
         subtitle: subtitle ?? "",
         category: category ?? "General",
         summary: summary ?? "",
         coverImage: coverImage || (mediaAssets?.[0]?.url ?? ""),
         previewImage: coverImage || (mediaAssets?.[0]?.url ?? ""),

         brandName: business.name ?? "Unknown",
         brandAvatar:
            business.initial ?? (business.name?.charAt(0) ?? "?").toUpperCase(),
         brandVerified: business.verification?.business === "verified",

         adFormat: adFormat ?? "feed",
         objective: objective ?? "sales",
         platform: platform ?? "multi",
         socials: socials ?? [],

         budget,
         budgetSpent: 0,
         budgetType: budgetType ?? "daily",
         budgetControl: budgetControl ?? "campaign",
         bidStrategy: bidStrategy ?? "highest-volume",
         cpm,
         specialAdCategory: specialAdCategory ?? "none",

         conversionLocation: conversionLocation ?? "website",
         conversionEvent: conversionEvent ?? "",
         performanceGoal: performanceGoal ?? "maximize-conversions",
         messageDestinations: messageDestinations ?? [],
         pageId: pageId ?? "",
         socialProfileId: socialProfileId ?? "",

         globalReach: globalReach !== false,
         targetCountries: targetCountries ?? [],
         targetLanguages: targetLanguages ?? [],
         excludedCountries: excludedCountries ?? [],
         minAge: minAge ?? 18,
         maxAge: maxAge ?? 65,
         autoAudience: autoAudience !== false,
         audiences: audiences ?? [],
         audienceId: audienceId ?? "",
         autoPlacements: autoPlacements !== false,

         startDate: startDate ? new Date(startDate) : new Date(),
         endDate: endDate ? new Date(endDate) : null,
         minDailySpend: minDailySpend ?? 0,
         deliveryHours: deliveryHours ?? [],

         headline: headline ?? "",
         primaryText: primaryText ?? "",
         ctaType: ctaType ?? "learn-more",
         ctaUrl: ctaUrl ?? "",
         mediaAssets: mediaAssets ?? [],

         minFollowers: minFollowers ?? 0,
         minEngagement: minEngagement ?? 0,
         creatorRequirements: creatorRequirements ?? [],
         deliverable: deliverable ?? "",
         instructions: instructions ?? [],
         requirements: requirements ?? [],

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
