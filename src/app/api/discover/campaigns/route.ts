import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Sort = "top" | "newest" | "cpm" | "budget";

export async function GET(req: Request) {
   try {
      await connectDB();

      const { searchParams } = new URL(req.url);
      const q = (searchParams.get("q") ?? "").trim();
      const social = searchParams.get("social") ?? "";
      const sort = (searchParams.get("sort") ?? "top") as Sort;

      const filter: Record<string, unknown> = {
         status: { $in: ["active", "published", "live"] },
      };
      if (q) {
         filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { subtitle: { $regex: q, $options: "i" } },
         ];
      }
      if (social) filter.socials = social;

      const sortMap: Record<Sort, Record<string, 1 | -1>> = {
         top: { featured: -1, joinedUsers: -1, createdAt: -1 },
         newest: { createdAt: -1 },
         cpm: { cpm: -1 },
         budget: { budget: -1 },
      };

      const docs = await Campaign.find(filter)
         .sort(sortMap[sort] ?? sortMap.top)
         .limit(60)
         .lean<any[]>();

      // Build a map of campaignId → request status for the current user
      const statusMap = new Map<string, string>();
      const userId = await getCurrentUserId();
      if (userId && docs.length > 0) {
         const signups = await AffiliateSignup.find({
            userId,
            campaignId: { $in: docs.map((d) => d._id) },
         })
            .select("campaignId status")
            .lean<any[]>();

         signups.forEach((s) => statusMap.set(String(s.campaignId), s.status));
      }

      const campaigns = docs.map((c) => {
         const budget = c.budget ?? 0;
         const budgetSpent = c.budgetSpent ?? c.spent ?? 0;
         const rawStatus = statusMap.get(String(c._id)) ?? null;

         // Normalize legacy values
         const requestStatus =
            rawStatus === "active"
               ? "approved"
               : rawStatus === "signed_up"
                 ? "pending"
                 : rawStatus;

         return {
            id: String(c._id),
            slug: c.slug ?? String(c._id),
            title: c.title ?? "Untitled campaign",
            subtitle: c.subtitle ?? "",
            category: c.category ?? "General",
            coverImage: c.coverImage ?? c.imageUrl ?? c.thumbnail ?? "",
            previewImage: c.previewImage ?? c.coverImage ?? "",
            brandName: c.brandName ?? "Unknown",
            brandAvatar: c.brandAvatar ?? "",
            brandVerified: Boolean(c.brandVerified),
            socials: c.socials ?? [],
            budget,
            budgetSpent,
            budgetRemaining: Math.max(0, budget - budgetSpent),
            cpm: c.cpm ?? 0,
            joinedUsers: c.joinedUsers ?? 0,
            totalViews: c.totalViews ?? 0,
            duration: c.duration ?? "",
            featured: Boolean(c.featured),
            objective: c.objective ?? "views",
            adFormat: c.adFormat ?? "short-video",
            requestStatus,
            joined: requestStatus === "approved",
         };
      });

      return NextResponse.json({ campaigns });
   } catch (err) {
      logError("GET /api/discover/campaigns", err);
      return NextResponse.json(
         { campaigns: [], error: "Failed to load campaigns" },
         { status: 500 },
      );
   }
}
