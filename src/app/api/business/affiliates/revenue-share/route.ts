import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import RevenueSharePartner from "@/app/lib/models/RevenueSharePartner";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ partners: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

      await connectDB();
      let business;
      if (businessId)
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      else
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      if (!business) return NextResponse.json({ partners: [] });

      const partners = await RevenueSharePartner.find({
         businessId: business._id,
      })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         partners: partners.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            email: p.email,
            avatar: p.avatar,
            product: p.product,
            earned: p.earned,
            share: p.share,
            payoutType: p.payoutType,
            status: p.status,
         })),
      });
   } catch {
      return NextResponse.json({ partners: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, email, product, share } = await req.json();
      if (!businessId || !email || !product) {
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

      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      if (!user)
         return NextResponse.json(
            { error: "No user with that email" },
            { status: 404 },
         );

      const partner = await RevenueSharePartner.create({
         businessId: business._id,
         userId: user._id,
         name: user.name,
         email: user.email,
         avatar: user.name.charAt(0).toUpperCase(),
         product,
         share: Number(share) || 20,
         payoutType: "automatic",
         status: "active",
      });

      return NextResponse.json({ partner: { id: partner._id.toString() } });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
