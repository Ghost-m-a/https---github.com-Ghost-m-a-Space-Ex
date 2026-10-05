import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import PaymentMethod from "@/app/lib/models/PaymentMethod";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      await connectDB();
      const methods = await PaymentMethod.find({ userId: session.userId })
         .sort({ isDefault: -1, createdAt: -1 })
         .lean();
      return NextResponse.json({
         methods: methods.map((m) => ({
            id: m._id.toString(),
            brand: m.brand,
            last4: m.last4,
            expiry: m.expiry,
            holderName: m.holderName,
            country: m.country,
            addressLine1: m.addressLine1,
            isDefault: m.isDefault,
         })),
      });
   } catch (err) {
      console.error("[Payment GET]", err);
      return NextResponse.json({ methods: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const body = await req.json();

      if (!body.cardNumber || body.cardNumber.replace(/\s/g, "").length < 12) {
         return NextResponse.json(
            { error: "Invalid card number" },
            { status: 400 },
         );
      }
      if (!body.expiry || !body.cvc || !body.holderName) {
         return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 },
         );
      }

      await connectDB();

      // Detect brand from first digit (simple)
      const first = String(body.cardNumber).replace(/\s/g, "")[0];
      const brand =
         first === "4"
            ? "Visa"
            : first === "5"
              ? "Mastercard"
              : first === "3"
                ? "Amex"
                : "Card";

      const last4 = String(body.cardNumber).replace(/\s/g, "").slice(-4);

      // If this is the first card, make it default
      const existingCount = await PaymentMethod.countDocuments({
         userId: session.userId,
      });

      const method = await PaymentMethod.create({
         userId: session.userId,
         brand,
         last4,
         expiry: body.expiry,
         holderName: body.holderName,
         country: body.country || "",
         addressLine1: body.addressLine1 || "",
         isDefault: existingCount === 0,
      });

      return NextResponse.json({
         method: {
            id: method._id.toString(),
            brand: method.brand,
            last4: method.last4,
            expiry: method.expiry,
            holderName: method.holderName,
            country: method.country,
            addressLine1: method.addressLine1,
            isDefault: method.isDefault,
         },
      });
   } catch (err) {
      console.error("[Payment POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

export async function DELETE(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id)
         return NextResponse.json({ error: "Missing id" }, { status: 400 });

      await connectDB();
      await PaymentMethod.deleteOne({ _id: id, userId: session.userId });
      return NextResponse.json({ success: true });
   } catch (err) {
      console.error("[Payment DELETE]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
