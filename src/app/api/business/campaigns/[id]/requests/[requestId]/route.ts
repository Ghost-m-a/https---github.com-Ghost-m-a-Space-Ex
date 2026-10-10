import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Campaign from "@/models/Campaign";
import AffiliateSignup from "@/models/AffiliateSignup";
import { getCurrentUserId } from "@/lib/auth";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
   req: Request,
   {
      params,
   }: {
      params: Promise<{ id: string; requestId: string }>;
   },
) {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const business = await Business.findOne({ userId }).lean<any>();
      if (!business) {
         return NextResponse.json({ error: "No business" }, { status: 403 });
      }

      const { id, requestId } = await params;

      const campaign = await Campaign.findOne({
         businessId: business._id,
         ...(id.match(/^[a-f0-9]{24}$/)
            ? { $or: [{ _id: id }, { slug: id }] }
            : { slug: id }),
      }).lean<any>();
      if (!campaign) {
         return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 },
         );
      }

      const body = await req.json();
      const action = body?.action as "approve" | "reject" | undefined;
      const note = String(body?.note ?? "").slice(0, 500);

      if (action !== "approve" && action !== "reject") {
         return NextResponse.json(
            { error: "action must be 'approve' or 'reject'" },
            { status: 400 },
         );
      }

      const signup = await AffiliateSignup.findOne({
         _id: requestId,
         campaignId: campaign._id,
      });
      if (!signup) {
         return NextResponse.json(
            { error: "Request not found" },
            { status: 404 },
         );
      }

      if (signup.status !== "pending" && signup.status !== "signed_up") {
         return NextResponse.json(
            { error: `Request already ${signup.status}` },
            { status: 400 },
         );
      }

      if (action === "approve") {
         signup.status = "approved";
         signup.reviewedBy = userId as any;
         signup.reviewedAt = new Date();
         signup.reviewNote = note;
         await signup.save();

         // Bump the campaign counter now — the creator is truly joined
         await Campaign.findByIdAndUpdate(campaign._id, {
            $inc: { joinedUsers: 1 },
         });
      } else {
         signup.status = "rejected";
         signup.reviewedBy = userId as any;
         signup.reviewedAt = new Date();
         signup.reviewNote = note;
         await signup.save();
      }

      logInfo("requests/review", `${action} applied`, {
         requestId,
         campaignId: String(campaign._id),
      });

      return NextResponse.json({
         ok: true,
         status: signup.status,
      });
   } catch (err) {
      logError("POST requests/review", err);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
   }
}
