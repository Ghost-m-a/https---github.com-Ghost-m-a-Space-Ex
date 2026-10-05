import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import PartnerRequest from "@/app/lib/models/PartnerRequest";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const all = await PartnerRequest.find({ userId: session.userId })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         pending: all
            .filter((p) => p.status === "pending")
            .map((p) => ({
               id: p._id.toString(),
               partnerName: p.partnerName,
               partnerAvatar: p.partnerAvatar,
               message: p.message,
               createdAt: p.createdAt,
            })),
         all: all.map((p) => ({
            id: p._id.toString(),
            partnerName: p.partnerName,
            status: p.status,
            message: p.message,
            createdAt: p.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Partners GET]", err);
      return NextResponse.json({ pending: [], all: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { id, action } = await req.json();
      await connectDB();
      await PartnerRequest.findOneAndUpdate(
         { _id: id, userId: session.userId },
         { $set: { status: action === "accept" ? "accepted" : "declined" } },
      );
      return NextResponse.json({ success: true });
   } catch (err) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
