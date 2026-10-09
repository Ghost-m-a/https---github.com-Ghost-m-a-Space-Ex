import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Campaign from "@/app/lib/models/Campaign";
import Business from "@/app/lib/models/Business";
import User from "@/app/lib/models/User";
import { getCurrentUserId } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// --------------------------------------------------
// GET — list campaigns owned by the current user's business
// --------------------------------------------------
export async function GET() {
   try {
      await dbConnect();

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ campaigns: [] }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean();
      if (!business) {
         return NextResponse.json({ campaigns: [] });
      }

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
// POST — create a new campaign (real, from the UI form)
// --------------------------------------------------
export async function POST(req: Request) {
   try {
      await dbConnect();

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();

      const {
         title,
         subtitle,
         category,
         coverImage,
         socials,
         budget,
         cpm,
         duration,
         requirements,
         instructions,
         summary,
      } = body ?? {};

      // -------- validation --------
      if (!title || typeof title !== "string" || !title.trim()) {
         return NextResponse.json(
            { error: "Title is required" },
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
            { error: "CPM must be a positive number" },
            { status: 400 },
         );
      }
      if (!Array.isArray(socials) || socials.length === 0) {
         return NextResponse.json(
            { error: "Select at least one platform" },
            { status: 400 },
         );
      }

      // -------- resolve business --------
      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json(
            { error: "Create a business before creating campaigns." },
            { status: 400 },
         );
      }

      // -------- unique slug --------
      const baseSlug = title
         .toLowerCase()
         .replace(/[^\w\s-]/g, "")
         .replace(/\s+/g, "-")
         .slice(0, 50);
      const suffix = Math.random().toString(36).slice(2, 8);
      const slug = `${baseSlug}-${suffix}`;

      // -------- create --------
      const campaign = await Campaign.create({
         businessId: business._id,
         createdBy: userId,
         slug,
         title: title.trim(),
         subtitle: subtitle ?? "",
         category: category ?? "General",
         coverImage: coverImage ?? "",
         previewImage: coverImage ?? "",
         brandName: business.name ?? "Unknown",
         brandAvatar:
            business.initial ?? (business.name?.charAt(0) ?? "?").toUpperCase(),
         brandVerified: business.verification?.business === "verified",
         socials,
         platformRates: socials.map((s: string) => ({
            platform: s,
            minViews: 1000,
            maxViews: 1_000_000,
            cpm,
         })),
         budget,
         budgetSpent: 0,
         cpm,
         duration: duration ?? "1mo",
         requirements: requirements ?? [],
         instructions: instructions ?? [],
         summary:
            summary ??
            `Create short-form content for ${title.trim()} and get paid per view.`,
         joinedUsers: 0,
         totalViews: 0,
         status: "active",
         featured: false,
         startDate: new Date(),
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
