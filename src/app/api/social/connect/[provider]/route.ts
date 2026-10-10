import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SocialPage from "@/models/SocialPage";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// =========================================
// GET /api/social/connect/[provider]
// Redirects the browser to the provider's OAuth screen.
// In dev (no env vars set), falls back to DEMO mode:
// creates a demo page and redirects back to the campaign builder.
// =========================================
export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ provider: string }> },
) {
   try {
      const { provider } = await params;
      const origin = req.nextUrl.origin;

      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.redirect(`${origin}/login`);
      }

      const redirectUri = `${origin}/api/social/callback/${provider}`;

      // ---------- DEMO MODE ----------
      // Triggered when no env credentials are set, so you can test
      // the full flow locally without registering OAuth apps.
      if (provider === "meta" && !process.env.META_APP_ID) {
         return await createDemoPageAndRedirect(userId, "facebook", origin);
      }
      if (provider === "google" && !process.env.GOOGLE_CLIENT_ID) {
         return await createDemoPageAndRedirect(userId, "youtube", origin);
      }
      if (provider === "tiktok" && !process.env.TIKTOK_CLIENT_KEY) {
         return await createDemoPageAndRedirect(userId, "tiktok", origin);
      }

      // ---------- REAL OAUTH ----------
      if (provider === "meta") {
         const url = new URL("https://www.facebook.com/v18.0/dialog/oauth");
         url.searchParams.set("client_id", process.env.META_APP_ID!);
         url.searchParams.set("redirect_uri", redirectUri);
         url.searchParams.set(
            "scope",
            "pages_show_list,pages_read_engagement,instagram_basic",
         );
         url.searchParams.set("response_type", "code");
         url.searchParams.set("state", userId);
         return NextResponse.redirect(url.toString());
      }

      if (provider === "google") {
         const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
         url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
         url.searchParams.set("redirect_uri", redirectUri);
         url.searchParams.set(
            "scope",
            "https://www.googleapis.com/auth/youtube.readonly",
         );
         url.searchParams.set("response_type", "code");
         url.searchParams.set("access_type", "offline");
         url.searchParams.set("prompt", "consent");
         url.searchParams.set("state", userId);
         return NextResponse.redirect(url.toString());
      }

      if (provider === "tiktok") {
         const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
         url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY!);
         url.searchParams.set("redirect_uri", redirectUri);
         url.searchParams.set("scope", "user.info.basic,video.list");
         url.searchParams.set("response_type", "code");
         url.searchParams.set("state", userId);
         return NextResponse.redirect(url.toString());
      }

      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
   } catch (err) {
      console.error("[social/connect]", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}

// ---------- Helper for DEMO mode ----------
async function createDemoPageAndRedirect(
   userId: string,
   platform: "facebook" | "instagram" | "youtube" | "tiktok" | "x",
   origin: string,
) {
   await connectDB();

   const business = await Business.findOne({ userId }).lean<any>();
   if (!business) {
      return NextResponse.redirect(`${origin}/business`);
   }

   const demoName = `Demo ${
      platform.charAt(0).toUpperCase() + platform.slice(1)
   }`;
   const platformPageId = `demo-${platform}-${Date.now()}`;

   await SocialPage.findOneAndUpdate(
      { businessId: business._id, platform, platformPageId },
      {
         businessId: business._id,
         platform,
         platformPageId,
         name: demoName,
         username: demoName.toLowerCase().replace(/\s/g, ""),
         avatar: "",
         verified: false,
         connectedBy: userId,
         status: "active",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
   );

   return NextResponse.redirect(
      `${origin}/business/campaigns/new?connected=${platform}`,
   );
}
