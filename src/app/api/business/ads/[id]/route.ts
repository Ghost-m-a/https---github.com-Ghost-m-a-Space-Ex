import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Campaign from "@/app/lib/models/Campaign";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();
      const campaign = await Campaign.findById(id).lean();
      if (!campaign)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: campaign.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      return NextResponse.json({ campaign });
   } catch (err) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
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

      const campaign = await Campaign.findById(id);
      if (!campaign)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: campaign.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const allowed = [
         "title",
         "platform",
         "objective",
         "budgetType",
         "budgetAmount",
         "budgetControl",
         "bidStrategy",
         "specialAdCategory",
         "status",
         "onOff",
         "conversionLocation",
         "conversionEvent",
         "advantagePlacements",
         "advantageAudience",
         "minAge",
         "countries",
         "facebookPage",
         "instagramAccount",
         "messageDestinations",
         "performanceGoal",
         "startDate",
         "endDate",
         "setEndDate",
         "deliveryHours",
         "minDailySpend",
         "languages",
      ];

      for (const key of allowed) {
         if (key in body) (campaign as any)[key] = body[key];
      }

      await campaign.save();
      return NextResponse.json({ campaign: campaign.toObject() });
   } catch (err) {
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
      const campaign = await Campaign.findById(id);
      if (!campaign)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: campaign.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      await campaign.deleteOne();
      return NextResponse.json({ success: true });
   } catch (err) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
