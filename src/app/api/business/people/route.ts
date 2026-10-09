import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Visitor from "@/models/Visitor";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ people: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";
      const source = url.searchParams.get("source") || "";
      const country = url.searchParams.get("country") || "";

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
      if (!business) return NextResponse.json({ people: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (source) query.source = source;
      if (country) query.country = country;
      if (q) {
         query.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
         ];
      }

      const people = await Visitor.find(query)
         .sort({ lastSeen: -1 })
         .limit(200)
         .lean();

      return NextResponse.json({
         people: people.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            email: p.email,
            username: p.username,
            avatar: p.avatar,
            location: p.location,
            source: p.source,
            totalSpend: p.totalSpend,
            purchases: p.purchases,
            events: p.events,
            lastSeen: p.lastSeen,
         })),
      });
   } catch (err) {
      console.error("[People GET]", err);
      return NextResponse.json({ people: [] });
   }
}
