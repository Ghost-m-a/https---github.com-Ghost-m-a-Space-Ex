import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const user = await User.findById(session.userId).lean();
      if (!user)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({
         user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username || "",
            bio: user.bio || "",
            dateOfBirth: user.dateOfBirth || "",
            location: user.location || "",
            avatarUrl: user.avatarUrl || "",
            avatarColor: user.avatarColor || "#3b82f6",
            privacy: user.privacy,
            socialAccounts: user.socialAccounts,
            notificationPrefs: user.notificationPrefs,
            twoFactor: user.twoFactor,
            wallet: user.wallet,
            verification: user.verification,
         },
      });
   } catch (err) {
      console.error("[Settings GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

export async function PATCH(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const body = await req.json();

      // Only allow whitelisted updates
      const allowed: Record<string, unknown> = {};
      const topFields = [
         "name",
         "username",
         "bio",
         "dateOfBirth",
         "location",
         "avatarUrl",
         "avatarColor",
      ];
      const objFields = [
         "privacy",
         "socialAccounts",
         "notificationPrefs",
         "twoFactor",
         "wallet",
         "verification",
      ];

      for (const key of topFields) {
         if (key in body) allowed[key] = body[key];
      }
      for (const key of objFields) {
         if (key in body) {
            // Merge nested fields rather than overwrite
            allowed[key] = body[key];
         }
      }

      if (allowed.username) {
         const cleaned = String(allowed.username)
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "");
         if (cleaned.length < 3) {
            return NextResponse.json(
               { error: "Username must be at least 3 characters" },
               { status: 400 },
            );
         }
         const existing = await User.findOne({
            username: cleaned,
            _id: { $ne: session.userId },
         });
         if (existing) {
            return NextResponse.json(
               { error: "Username already taken" },
               { status: 409 },
            );
         }
         allowed.username = cleaned;
      }

      const updated = await User.findByIdAndUpdate(
         session.userId,
         { $set: allowed },
         { new: true, runValidators: true },
      ).lean();

      if (!updated)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({
         user: {
            id: updated._id.toString(),
            name: updated.name,
            username: updated.username || "",
            bio: updated.bio || "",
            dateOfBirth: updated.dateOfBirth || "",
            location: updated.location || "",
            privacy: updated.privacy,
            socialAccounts: updated.socialAccounts,
            notificationPrefs: updated.notificationPrefs,
            twoFactor: updated.twoFactor,
            wallet: updated.wallet,
            verification: updated.verification,
         },
      });
   } catch (err) {
      console.error("[Settings PATCH]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
