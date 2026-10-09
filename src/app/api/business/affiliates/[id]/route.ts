import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Affiliate from "@/models/Affiliate";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      await connectDB();
      const affiliate = await Affiliate.findById(id);
      if (!affiliate)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: affiliate.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const allowed = ["commissionRate", "status"];
      for (const key of allowed) {
         if (key in body) (affiliate as any)[key] = body[key];
      }
      await affiliate.save();
      return NextResponse.json({ affiliate: affiliate.toObject() });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const affiliate = await Affiliate.findById(id);
      if (!affiliate)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: affiliate.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      await affiliate.deleteOne();
      return NextResponse.json({ success: true });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
