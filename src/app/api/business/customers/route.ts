import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Customer from "@/models/Customer";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

async function getBusiness(session: any, businessId: string | null) {
   if (businessId) {
      return await Business.findOne({
         _id: businessId,
         userId: session.userId,
      }).lean();
   }
   return await Business.findOne({ userId: session.userId })
      .sort({ createdAt: 1 })
      .lean();
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ customers: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const q = url.searchParams.get("q") || "";
      const status = url.searchParams.get("status") || "";

      await connectDB();
      const business = await getBusiness(session, businessId);
      if (!business) return NextResponse.json({ customers: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;
      if (q) {
         query.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
         ];
      }

      const customers = await Customer.find(query)
         .sort({ joinedAt: -1 })
         .limit(200)
         .lean();

      return NextResponse.json({
         customers: customers.map((c) => ({
            id: c._id.toString(),
            email: c.email,
            name: c.name,
            username: c.username,
            avatar: c.avatar,
            status: c.status,
            country: c.country,
            state: c.state,
            city: c.city,
            totalSpend: c.totalSpend,
            joinedAt: c.joinedAt,
            lastAccessed: c.lastAccessed,
         })),
      });
   } catch (err) {
      console.error("[Customers GET]", err);
      return NextResponse.json({ customers: [] });
   }
}
