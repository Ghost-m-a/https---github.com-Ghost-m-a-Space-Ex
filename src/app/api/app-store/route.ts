import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AppListing from "@/models/AppListing";
import InstalledApp from "@/models/InstalledApp";
import Business from "@/models/Business";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = token ? await verifySessionToken(token) : null;

      const url = new URL(req.url);
      const category = url.searchParams.get("category") || "all";
      const q = url.searchParams.get("q") || "";
      const sort = url.searchParams.get("sort") || "most_weekly";

      await connectDB();

      const query: Record<string, unknown> = {};
      if (category && category !== "all") query.category = category;
      if (q) query.name = { $regex: q, $options: "i" };

      let sortQuery: Record<string, 1 | -1> = { installs: -1 };
      if (sort === "newest") sortQuery = { createdAt: -1 };
      if (sort === "most_weekly") sortQuery = { installs: -1 };

      const apps = await AppListing.find(query)
         .sort(sortQuery)
         .limit(60)
         .lean();

      // Which apps are installed for this business
      let installedSet = new Set<string>();
      if (session) {
         const business = await Business.findOne({
            userId: session.userId,
         }).lean();
         if (business) {
            const installed = await InstalledApp.find({
               businessId: business._id,
            }).lean();
            installedSet = new Set(installed.map((i) => i.appSlug));
         }
      }

      return NextResponse.json({
         apps: apps.map((a) => ({
            id: a._id.toString(),
            slug: a.slug,
            name: a.name,
            tagline: a.tagline,
            description: a.description,
            category: a.category,
            iconColor: a.iconColor,
            iconEmoji: a.iconEmoji,
            price: a.price,
            rating: a.rating,
            reviewCount: a.reviewCount,
            installs: a.installs,
            installsRange: a.installsRange,
            installed: installedSet.has(a.slug),
         })),
      });
   } catch (err) {
      console.error("[AppStore GET]", err);
      return NextResponse.json({ apps: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { slug } = await req.json();
      if (!slug)
         return NextResponse.json({ error: "slug required" }, { status: 400 });

      await connectDB();
      const business = await Business.findOne({ userId: session.userId });
      if (!business)
         return NextResponse.json({ error: "No business" }, { status: 404 });

      const app = await AppListing.findOne({ slug });
      if (!app)
         return NextResponse.json({ error: "App not found" }, { status: 404 });

      const exists = await InstalledApp.exists({
         businessId: business._id,
         appSlug: slug,
      });
      if (exists) {
         await InstalledApp.deleteOne({
            businessId: business._id,
            appSlug: slug,
         });
         return NextResponse.json({ installed: false });
      }

      await InstalledApp.create({
         businessId: business._id,
         appId: app._id,
         appSlug: slug,
         status: "active",
      });

      return NextResponse.json({ installed: true });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
