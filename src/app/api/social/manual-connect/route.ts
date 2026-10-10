import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SocialPage from "@/models/SocialPage";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const PLATFORM_TO_ENUM: Record<string, string> = {
   tiktok: "tiktok",
   instagram: "instagram",
   youtube: "youtube",
   x: "x",
   facebook: "facebook",
};

export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const platform = String(body?.platform ?? "").toLowerCase();
      const username = String(body?.username ?? "").trim();

      if (!PLATFORM_TO_ENUM[platform]) {
         return NextResponse.json(
            { error: "Unsupported platform" },
            { status: 400 },
         );
      }
      if (!username) {
         return NextResponse.json(
            { error: "Username is required" },
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

      const page = await SocialPage.findOneAndUpdate(
         {
            businessId: business._id,
            platform,
            platformPageId: username,
         },
         {
            businessId: business._id,
            platform,
            platformPageId: username,
            name: `@${username}`,
            username,
            avatar: "",
            verified: false,
            connectedBy: userId,
            status: "active",
         },
         { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return NextResponse.json({ page }, { status: 201 });
   } catch (err) {
      logError("POST manual-connect", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
