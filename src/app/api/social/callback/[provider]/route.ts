import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SocialPage from "@/models/SocialPage";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ provider: string }> },
) {
   try {
      const { provider } = await params;
      const origin = req.nextUrl.origin;
      const code = req.nextUrl.searchParams.get("code");
      const state = req.nextUrl.searchParams.get("state");

      const userId = state || (await getCurrentUserId());
      if (!userId) {
         return NextResponse.redirect(`${origin}/login`);
      }
      if (!code) {
         return NextResponse.redirect(
            `${origin}/business/campaigns/new?error=missing_code`,
         );
      }

      await connectDB();
      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.redirect(`${origin}/business`);
      }

      const redirectUri = `${origin}/api/social/callback/${provider}`;

      // ---------- META ----------
      if (provider === "meta") {
         // Exchange code → short-lived user access token
         const tokenRes = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?` +
               `client_id=${process.env.META_APP_ID}` +
               `&client_secret=${process.env.META_APP_SECRET}` +
               `&redirect_uri=${encodeURIComponent(redirectUri)}` +
               `&code=${code}`,
         );
         const tokenData = await tokenRes.json();
         const accessToken = tokenData.access_token;

         // Fetch the user's pages
         const pagesRes = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
         );
         const pagesData = await pagesRes.json();

         for (const p of pagesData.data ?? []) {
            await SocialPage.findOneAndUpdate(
               {
                  businessId: business._id,
                  platform: "facebook",
                  platformPageId: p.id,
               },
               {
                  businessId: business._id,
                  platform: "facebook",
                  platformPageId: p.id,
                  name: p.name,
                  username: p.username ?? "",
                  avatar: "",
                  verified: false,
                  connectedBy: userId,
                  status: "active",
               },
               { upsert: true, new: true, setDefaultsOnInsert: true },
            );
         }
      }

      // ---------- GOOGLE (YouTube) ----------
      if (provider === "google") {
         const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
               code,
               client_id: process.env.GOOGLE_CLIENT_ID!,
               client_secret: process.env.GOOGLE_CLIENT_SECRET!,
               redirect_uri: redirectUri,
               grant_type: "authorization_code",
            }),
         });
         const tokenData = await tokenRes.json();
         const accessToken = tokenData.access_token;

         const chanRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
         );
         const chanData = await chanRes.json();

         for (const c of chanData.items ?? []) {
            await SocialPage.findOneAndUpdate(
               {
                  businessId: business._id,
                  platform: "youtube",
                  platformPageId: c.id,
               },
               {
                  businessId: business._id,
                  platform: "youtube",
                  platformPageId: c.id,
                  name: c.snippet?.title ?? "YouTube channel",
                  username: c.snippet?.customUrl ?? "",
                  avatar: c.snippet?.thumbnails?.default?.url ?? "",
                  verified: false,
                  connectedBy: userId,
                  status: "active",
               },
               { upsert: true, new: true, setDefaultsOnInsert: true },
            );
         }
      }

      // ---------- TIKTOK ----------
      if (provider === "tiktok") {
         const tokenRes = await fetch(
            "https://open.tiktokapis.com/v2/oauth/token/",
            {
               method: "POST",
               headers: { "Content-Type": "application/x-www-form-urlencoded" },
               body: new URLSearchParams({
                  code,
                  client_key: process.env.TIKTOK_CLIENT_KEY!,
                  client_secret: process.env.TIKTOK_CLIENT_SECRET!,
                  redirect_uri: redirectUri,
                  grant_type: "authorization_code",
               }),
            },
         );
         const tokenData = await tokenRes.json();
         const accessToken = tokenData.access_token;

         const infoRes = await fetch(
            "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,avatar_url",
            { headers: { Authorization: `Bearer ${accessToken}` } },
         );
         const info = await infoRes.json();
         const u = info?.data?.user;

         if (u) {
            await SocialPage.findOneAndUpdate(
               {
                  businessId: business._id,
                  platform: "tiktok",
                  platformPageId: u.open_id,
               },
               {
                  businessId: business._id,
                  platform: "tiktok",
                  platformPageId: u.open_id,
                  name: u.display_name ?? "TikTok account",
                  username: u.username ?? "",
                  avatar: u.avatar_url ?? "",
                  verified: false,
                  connectedBy: userId,
                  status: "active",
               },
               { upsert: true, new: true, setDefaultsOnInsert: true },
            );
         }
      }

      return NextResponse.redirect(
         `${origin}/business/campaigns/new?connected=${provider}`,
      );
   } catch (err) {
      console.error("[social/callback]", err);
      return NextResponse.redirect(
         `${req.nextUrl.origin}/business/campaigns/new?error=oauth_failed`,
      );
   }
}
