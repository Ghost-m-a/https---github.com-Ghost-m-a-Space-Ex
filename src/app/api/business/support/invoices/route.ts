import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Invoice from "@/models/Invoice";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ invoices: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const status = url.searchParams.get("status") || "";

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
      if (!business) return NextResponse.json({ invoices: [] });

      const query: Record<string, unknown> = { businessId: business._id };
      if (status) query.status = status;

      const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
         invoices: invoices.map((i) => ({
            id: i._id.toString(),
            number: i.number,
            total: i.total,
            currency: i.currency,
            status: i.status,
            customerName: i.customerName,
            customerEmail: i.customerEmail,
            product: i.product,
            dueDate: i.dueDate,
            createdAt: i.createdAt,
         })),
      });
   } catch {
      return NextResponse.json({ invoices: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const {
         businessId,
         customerName,
         customerEmail,
         product,
         price,
         description,
         dueDate,
         pricingType,
         lineItems,
      } = body;

      if (!businessId)
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );

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

      // Generate next invoice number
      const count = await Invoice.countDocuments({ businessId: business._id });
      const number = `INV-${String(count + 1).padStart(6, "0")}`;

      const subtotal = Number(price) || 0;
      const total = subtotal;

      const invoice = await Invoice.create({
         businessId: business._id,
         createdBy: session.userId,
         number,
         customerName: customerName || "",
         customerEmail: customerEmail || "",
         product: product || "",
         pricingType: pricingType || "one-time",
         price: Number(price) || 0,
         dueDate: dueDate ? new Date(dueDate) : undefined,
         description: description || "",
         lineItems: Array.isArray(lineItems) ? lineItems : [],
         subtotal,
         total,
         status: "sent",
      });

      return NextResponse.json({
         invoice: {
            id: invoice._id.toString(),
            number: invoice.number,
            total: invoice.total,
            status: invoice.status,
         },
      });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
