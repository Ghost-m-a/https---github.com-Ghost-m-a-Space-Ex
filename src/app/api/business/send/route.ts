import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, amount, recipientId, recipientEmail, note } =
         await req.json();

      if (!businessId || !amount || amount <= 0) {
         return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 },
         );
      }

      await connectDB();

      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });

      if (!business) {
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );
      }

      if ((business.balance || 0) < amount) {
         return NextResponse.json(
            { error: "Insufficient balance" },
            { status: 400 },
         );
      }

      // Find recipient
      let recipient = null;
      if (recipientId) {
         recipient = await User.findById(recipientId).lean();
      } else if (recipientEmail) {
         recipient = await User.findOne({
            email: recipientEmail.toLowerCase(),
         }).lean();
      }

      const tx = await Transaction.create({
         businessId: business._id,
         kind: "send",
         amount: Number(amount),
         status: "completed",
         description:
            note ||
            `Payment to ${recipient?.name || recipientEmail || "recipient"}`,
         counterparty: {
            id: recipient?._id,
            name: recipient?.name || "",
            email: recipient?.email || recipientEmail || "",
            avatar: recipient?.name?.charAt(0).toUpperCase() || "?",
         },
      });

      business.balance = (business.balance || 0) - Number(amount);
      await business.save();

      return NextResponse.json({
         success: true,
         transaction: {
            id: tx._id.toString(),
            amount: tx.amount,
            recipient: recipient?.name || recipientEmail,
            status: tx.status,
         },
         newBalance: business.balance,
      });
   } catch (err) {
      console.error("[Send]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
