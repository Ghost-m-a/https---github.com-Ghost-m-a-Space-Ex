import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

function shape(c: any, statusMap: Map<string, string>) {
   const budget = c.budget ?? 0;
   const budgetSpent = c.budgetSpent ?? 0;
   const raw = statusMap.get(String(c._id)) ?? null;
   const requestStatus =
      raw === "active" ? "approved" : raw === "signed_up" ? "pending" : raw;

   return {
      id: String(c._id),
      slug: c.slug ?? String(c._id),
      title: c.title ?? "Untitled",
      subtitle: c.subtitle ?? "",
      coverImage: c.coverImage ?? "",
      brandName: c.brandName ?? "Unknown",
      brandAvatar: c.brandAvatar ?? "",
      brandVerified: Boolean(c.brandVerified),
      socials: c.socials ?? [],
      cpm: c.cpm ?? 0,
      duration: c.duration ?? "",
      budget,
      budgetSpent,
      budgetRemaining: Math.max(0, budget - budgetSpent),
      joinedUsers: c.joinedUsers ?? 0,
      totalViews: c.totalViews ?? 0,
      objective: c.objective ?? "views",
      adFormat: c.adFormat ?? "short-video",
      category: c.category ?? "General",
      featured: Boolean(c.featured),
      requestStatus,
      joined: requestStatus === "approved",
   };
}

export async function GET() {
   try {
      await connectDB();

      const baseFilter = { status: { $in: ["active", "published", "live"] } };
      const limit = 12;

      const [featuredDocs, popularDocs, newDocs] = await Promise.all([
         Campaign.find({ ...baseFilter, featured: true })
            .sort({ joinedUsers: -1 })
            .limit(5)
            .lean<any[]>(),
         Campaign.find(baseFilter)
            .sort({ joinedUsers: -1, totalViews: -1 })
            .limit(limit)
            .lean<any[]>(),
         Campaign.find(baseFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean<any[]>(),
      ]);

      // Build the request-status map for the current user
      const allIds = new Set<string>();
      [...featuredDocs, ...popularDocs, ...newDocs].forEach((d) =>
         allIds.add(String(d._id)),
      );

      const statusMap = new Map<string, string>();
      const userId = await getCurrentUserId();
      if (userId && allIds.size > 0) {
         const signups = await AffiliateSignup.find({
            userId,
            campaignId: { $in: Array.from(allIds) },
         })
            .select("campaignId status")
            .lean<any[]>();
         signups.forEach((s) => statusMap.set(String(s.campaignId), s.status));
      }

      // User's own campaigns (any status except withdrawn/left)
      let yourCampaigns: any[] = [];
      if (userId) {
         const signups = await AffiliateSignup.find({
            userId,
            status: { $nin: ["withdrawn", "left"] },
         })
            .sort({ signedUpAt: -1 })
            .limit(limit)
            .populate(
               "campaignId",
               "slug title coverImage brandName cpm duration budget budgetSpent joinedUsers totalViews socials objective status",
            )
            .lean<any[]>();

         yourCampaigns = signups
            .filter((s) => s.campaignId)
            .map((s) => ({
               ...shape(s.campaignId, statusMap),
               requestStatus:
                  s.status === "active"
                     ? "approved"
                     : s.status === "signed_up"
                       ? "pending"
                       : s.status,
               joined: s.status === "active" || s.status === "approved",
            }));
      }

      return NextResponse.json({
         featured: featuredDocs.map((d) => shape(d, statusMap)),
         yourCampaigns,
         popular: popularDocs.map((d) => shape(d, statusMap)),
         newCampaigns: newDocs.map((d) => shape(d, statusMap)),
      });
   } catch (err) {
      logError("GET /api/discover/feed", err);
      return NextResponse.json(
         { featured: [], yourCampaigns: [], popular: [], newCampaigns: [] },
         { status: 500 },
      );
   }
}
