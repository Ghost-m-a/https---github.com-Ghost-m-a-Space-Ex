import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/lib/models/Order";
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
      const orders = await Order.find({ userId: session.userId })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         orders: orders.map((o) => ({
            id: o._id.toString(),
            productName: o.productName,
            productImage: o.productImage,
            amount: o.amount,
            currency: o.currency,
            status: o.status,
            isWaitlist: o.isWaitlist,
            notes: o.notes,
            createdAt: o.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Orders GET]", err);
      return NextResponse.json({ orders: [] });
   }
}
