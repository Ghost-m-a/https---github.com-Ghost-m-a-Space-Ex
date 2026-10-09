import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// GET — list all businesses for the current user
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ businesses: [] });

      await connectDB();

      const businesses = await Business.find({ userId: session.userId })
         .sort({ createdAt: 1 })
         .lean();

      return NextResponse.json({
         businesses: businesses.map((b) => ({
            id: b._id.toString(),
            name: b.name,
            initial: b.initial,
            type: b.type,
            revenue: b.revenue,
            migrateFrom: b.migrateFrom,
            website: b.website,
            createdAt: b.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Business GET]", err);
      return NextResponse.json({ businesses: [] });
   }
}

// POST — create a new business
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { name, type, revenue, migrateFrom, website } = body;

      if (!name?.trim()) {
         return NextResponse.json(
            { error: "Name is required" },
            { status: 400 },
         );
      }

      await connectDB();

      const initial = name.trim().charAt(0).toUpperCase() || "B";

      const business = await Business.create({
         userId: session.userId,
         name: name.trim(),
         initial,
         type: type || "",
         revenue: revenue || "",
         migrateFrom: migrateFrom || "",
         website: website || "",
      });

      return NextResponse.json({
         business: {
            id: business._id.toString(),
            name: business.name,
            initial: business.initial,
            type: business.type,
            revenue: business.revenue,
            migrateFrom: business.migrateFrom,
            website: business.website,
            createdAt: business.createdAt,
         },
      });
   } catch (err) {
      console.error("[Business POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
