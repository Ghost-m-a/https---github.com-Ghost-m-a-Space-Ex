import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Website from "@/models/Website";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ websites: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

      await connectDB();

      let business;
      if (businessId) {
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      } else {
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      }
      if (!business) return NextResponse.json({ websites: [] });

      const websites = await Website.find({ businessId: business._id }).lean();

      return NextResponse.json({
         websites: websites.map((w) => ({
            id: w._id.toString(),
            domain: w.domain,
            name: w.name,
            status: w.status,
            visits: w.visits,
            pageViews: w.pageViews,
            checkouts: w.checkouts,
         })),
      });
   } catch (err) {
      console.error("[Websites GET]", err);
      return NextResponse.json({ websites: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, domain, name, blueprintId } = await req.json();

      if (!businessId || !domain || !name) {
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      await connectDB();

      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );

      const website = await Website.create({
         businessId: business._id,
         domain: domain.toLowerCase().trim(),
         name: name.trim(),
         status: "draft",
         visits: 0,
         pageViews: 0,
         checkouts: 0,
         blueprintId: blueprintId || "",
      });

      return NextResponse.json({
         website: {
            id: website._id.toString(),
            domain: website.domain,
            name: website.name,
            status: website.status,
            visits: 0,
            pageViews: 0,
            checkouts: 0,
         },
      });
   } catch (err) {
      console.error("[Websites POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
