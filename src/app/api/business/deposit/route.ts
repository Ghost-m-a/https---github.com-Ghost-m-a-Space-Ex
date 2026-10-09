import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Transaction from "@/models/Transaction";
import LiveEvent from "@/models/LiveEvent";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const session = await verifySessionToken(token);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, amount, method } = await req.json();

      if (!businessId) {
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      }
      if (!amount || amount <= 0) {
         return NextResponse.json(
            { error: "Amount must be positive" },
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

      // Create transaction
      const tx = await Transaction.create({
         businessId: business._id,
         kind: "deposit",
         amount: Number(amount),
         status: "completed",
         description: `Deposit via ${method || "bank_transfer"}`,
         metadata: { method: method || "bank_transfer" },
      });

      // Update business balance
      business.balance = (business.balance || 0) + Number(amount);
      await business.save();

      // Add live event
      await LiveEvent.create({
         businessId: business._id,
         type: "purchase",
         country: "United Arab Emirates",
         city: "Dubai",
         message: `Deposit of $${Number(amount).toFixed(2)} received`,
         amount: Number(amount),
      });

      return NextResponse.json({
         success: true,
         transaction: {
            id: tx._id.toString(),
            amount: tx.amount,
            kind: tx.kind,
            status: tx.status,
            createdAt: tx.createdAt,
         },
         newBalance: business.balance,
      });
   } catch (err) {
      console.error("[Deposit]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
