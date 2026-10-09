import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Business from "@/models/Business";
import User from "@/models/User";
import { getCurrentUserId } from "@/lib/auth";

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

      // ---- Per-user "joined" state ----
      let joinedIds = new Set<string>();
      const userId = await getCurrentUserId();

      if (userId && docs.length > 0) {
         const AffiliateSignup = (
            await import("@/models/AffiliateSignup")
         ).default;
         const signups = await AffiliateSignup.find({
            userId,
            campaignId: { $in: docs.map((d) => d._id) },
         })
            .select("campaignId")
            .lean<any[]>();

         joinedIds = new Set(signups.map((s) => String(s.campaignId)));
      }

      // ---- Shape for the Discover UI ----
      const campaigns = docs.map((c) => {
         const budget = c.budget ?? 0;
         const budgetSpent = c.budgetSpent ?? c.spent ?? 0;

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
            joinedUsers: c.joinedUsers ?? c.participants?.length ?? 0,
            totalViews: c.totalViews ?? 0,
            duration: c.duration ?? "",
            featured: Boolean(c.featured),
            joined: joinedIds.has(String(c._id)),
         };
      });

      return NextResponse.json({ campaigns });
   } catch (err) {
      console.error("[api/discover/campaigns]", err);
      return NextResponse.json(
         { campaigns: [], error: "Failed to load campaigns" },
         { status: 500 },
      );
   }
}
