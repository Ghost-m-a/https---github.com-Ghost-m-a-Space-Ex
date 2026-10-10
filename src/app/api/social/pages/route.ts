import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SocialPage from "@/models/SocialPage";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — all connected social pages for the current business
export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ pages: [] }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) return NextResponse.json({ pages: [] });

      const pages = await SocialPage.find({
         businessId: business._id,
         status: "active",
      })
         .sort({ platform: 1, name: 1 })
         .lean();

      return NextResponse.json({ pages });
   } catch (err) {
      console.error("[GET /api/social/pages]", err);
      return NextResponse.json({ pages: [], error: "Failed" }, { status: 500 });
   }
}

// POST — connect a new page (used by OAuth callback, or manual add)
export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json({ error: "No business" }, { status: 400 });
      }

      const body = await req.json();
      const { platform, platformPageId, name, username, avatar, verified } =
         body ?? {};

      if (!platform || !platformPageId || !name) {
         return NextResponse.json(
            { error: "platform, platformPageId, and name required" },
            { status: 400 },
         );
      }

      const page = await SocialPage.findOneAndUpdate(
         { businessId: business._id, platform, platformPageId },
         {
            businessId: business._id,
            platform,
            platformPageId,
            name,
            username: username ?? "",
            avatar: avatar ?? "",
            verified: Boolean(verified),
            connectedBy: userId,
            status: "active",
         },
         { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return NextResponse.json({ page }, { status: 201 });
   } catch (err) {
      console.error("[POST /api/social/pages]", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
