import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PulseEvent from "@/models/PulseEvent";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
   try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const limit = Math.min(50, Number(searchParams.get("limit") ?? 12));

      const events = await PulseEvent.find()
         .sort({ createdAt: -1 })
         .limit(limit)
         .lean<any[]>();

      return NextResponse.json({
         events: events.map((e) => ({
            id: String(e._id),
            kind: e.kind,
            actorName: e.actorName,
            actorAvatar: e.actorAvatar,
            businessName: e.businessName ?? "",
            amount: e.amount ?? 0,
            message: e.message,
            location: e.location ?? "",
            countryCode: e.countryCode ?? "",
            createdAt: e.createdAt,
         })),
      });
   } catch (err) {
      logError("GET /api/pulse", err);
      return NextResponse.json({ events: [] }, { status: 500 });
   }
}
