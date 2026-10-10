import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SavedAudience from "@/models/SavedAudience";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) return NextResponse.json({ audiences: [] }, { status: 401 });

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) return NextResponse.json({ audiences: [] });

      const audiences = await SavedAudience.find({
         businessId: business._id,
      })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({ audiences });
   } catch (err) {
      console.error("[GET audiences]", err);
      return NextResponse.json(
         { audiences: [], error: "Failed" },
         { status: 500 },
      );
   }
}

export async function POST(req: Request) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business)
         return NextResponse.json({ error: "No business" }, { status: 400 });

      const body = await req.json();
      const {
         name,
         description,
         countries,
         excludedCountries,
         languages,
         minAge,
         maxAge,
         interests,
      } = body ?? {};

      if (!name || !name.trim()) {
         return NextResponse.json(
            { error: "Audience name is required" },
            { status: 400 },
         );
      }

      const audience = await SavedAudience.create({
         businessId: business._id,
         createdBy: userId,
         name: name.trim(),
         description: description ?? "",
         countries: countries ?? [],
         excludedCountries: excludedCountries ?? [],
         languages: languages ?? [],
         minAge: minAge ?? 18,
         maxAge: maxAge ?? 65,
         interests: interests ?? [],
      });

      return NextResponse.json({ audience }, { status: 201 });
   } catch (err) {
      console.error("[POST audiences]", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
