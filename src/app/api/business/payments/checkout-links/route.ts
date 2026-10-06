import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import CheckoutLink from "@/app/lib/models/CheckoutLink";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

function slugify(text: string): string {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
}

// GET — list checkout links
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ links: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

      await connectDB();

      let business;
      if (businessId) {
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      } else {
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      }
      if (!business) return NextResponse.json({ links: [] });

      const links = await CheckoutLink.find({ businessId: business._id })
         .sort({ createdAt: -1 })
         .lean();

      return NextResponse.json({
         links: links.map((l) => ({
            id: l._id.toString(),
            productName: l.productName,
            price: l.price,
            currency: l.currency,
            url: l.url,
            createdAt: l.createdAt,
         })),
      });
   } catch (err) {
      console.error("[CheckoutLinks GET]", err);
      return NextResponse.json({ links: [] });
   }
}

// POST — create checkout link
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { businessId, ...rest } = body;

      if (!businessId)
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      if (!rest.productName?.trim()) {
         return NextResponse.json(
            { error: "Product name required" },
            { status: 400 },
         );
      }

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

      // Generate unique slug
      const baseSlug = slugify(rest.productName) || `link-${Date.now()}`;
      let slug = baseSlug;
      let counter = 1;
      while (await CheckoutLink.exists({ businessId: business._id, slug })) {
         slug = `${baseSlug}-${counter++}`;
      }

      const url = `space-ex.com/${business.initial.toLowerCase()}/${slug}`;

      const link = await CheckoutLink.create({
         businessId: business._id,
         createdBy: session.userId,
         productId: rest.productId || undefined,
         productName: rest.productName.trim(),
         headline: rest.headline || "",
         description: rest.description || "",
         includedApps: Array.isArray(rest.includedApps)
            ? rest.includedApps
            : [],
         pricingType: rest.pricingType || "one-time",
         price: Number(rest.price) || 0,
         currency: rest.currency || "USD",
         recurringInterval: rest.recurringInterval || "",
         amountPresets: Array.isArray(rest.amountPresets)
            ? rest.amountPresets
            : [50, 100, 250],
         advancedOptions: !!rest.advancedOptions,
         acceptLocalCurrencies: rest.acceptLocalCurrencies !== false,
         customizePaymentMethods: !!rest.customizePaymentMethods,
         checkoutBranding: {
            backgroundColor:
               rest.checkoutBranding?.backgroundColor || "#000000",
            buttonColor: rest.checkoutBranding?.buttonColor || "#ffffff",
            font: rest.checkoutBranding?.font || "global",
            borderStyle: rest.checkoutBranding?.borderStyle || "global",
         },
         slug,
         url,
      });

      return NextResponse.json({
         link: {
            id: link._id.toString(),
            productName: link.productName,
            url: link.url,
         },
      });
   } catch (err) {
      console.error("[CheckoutLinks POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
