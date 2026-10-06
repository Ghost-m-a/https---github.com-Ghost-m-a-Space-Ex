import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import SubAccount from "@/app/lib/models/SubAccount";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ subAccounts: [] });

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
      if (!business) return NextResponse.json({ subAccounts: [] });

      const list = await SubAccount.find({ parentBusinessId: business._id })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         subAccounts: list.map((s) => ({
            id: s._id.toString(),
            accountName: s.accountName,
            email: s.email,
            kind: s.kind,
            status: s.status,
            kycStatus: s.kycStatus,
            createdAt: s.createdAt,
         })),
      });
   } catch {
      return NextResponse.json({ subAccounts: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, email, accountName, kind } = await req.json();
      if (!businessId || !email)
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });

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

      const sub = await SubAccount.create({
         parentBusinessId: business._id,
         createdBy: session.userId,
         accountName: accountName || email.split("@")[0],
         email: email.toLowerCase(),
         kind: kind || "pay_workers",
         status: "pending",
         kycStatus: "not_started",
      });

      return NextResponse.json({ subAccount: { id: sub._id.toString() } });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
