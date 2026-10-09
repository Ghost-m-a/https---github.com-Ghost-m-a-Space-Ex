import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Business from "@/models/Business";
import Product from "@/models/Product";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// Helper — slugify
function slugify(text: string): string {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
}

// GET — list products
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ products: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");
      const visibility = url.searchParams.get("visibility"); // "visible" | "hidden" | "archived" | null

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

      if (!business) return NextResponse.json({ products: [] });

      const query: any = { businessId: business._id };
      if (visibility) {
         const visArr = visibility.split(",");
         query.visibility = { $in: visArr };
      }

      const products = await Product.find(query).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
         products: products.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            headline: p.headline,
            description: p.description,
            bannerImage: p.bannerImage,
            productImage: p.productImage,
            labels: p.labels,
            accessType: p.accessType,
            pricingType: p.pricingType,
            price: p.price,
            currency: p.currency,
            recurringInterval: p.recurringInterval,
            includedApps: p.includedApps,
            appearanceColor: p.appearanceColor,
            visibility: p.visibility,
            discoverStatus: p.discoverStatus,
            stats: p.stats,
            createdAt: p.createdAt,
         })),
      });
   } catch (err) {
      console.error("[Products GET]", err);
      return NextResponse.json({ products: [] });
   }
}

// POST — create product
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      const { businessId, name, ...rest } = body;

      if (!businessId) {
         return NextResponse.json(
            { error: "businessId required" },
            { status: 400 },
         );
      }
      if (!name?.trim()) {
         return NextResponse.json(
            { error: "Name is required" },
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

      // Generate unique slug
      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = `product-${Date.now()}`;
      let slug = baseSlug;
      let counter = 1;
      while (await Product.exists({ businessId: business._id, slug })) {
         slug = `${baseSlug}-${counter++}`;
      }

      // Build productUrl
      const productUrl =
         rest.productSettings?.productUrl ||
         `space-ex.com/${slugify(business.name)}/${slug}`;

      const product = await Product.create({
         businessId: business._id,
         name: name.trim(),
         slug,
         headline: rest.headline || "",
         description: rest.description || "",
         bannerImage: rest.bannerImage || "",
         productImage: rest.productImage || "",
         labels: rest.labels || [],
         collectShippingAddress: rest.collectShippingAddress || false,
         accessType: rest.accessType || "free",
         pricingType: rest.pricingType || "one-time",
         price: Number(rest.price) || 0,
         currency: rest.currency || "USD",
         recurringInterval: rest.recurringInterval || "",
         launchAsWaitlist: rest.launchAsWaitlist || false,
         askQuestionsBeforeCheckout: rest.askQuestionsBeforeCheckout || false,
         includedApps: rest.includedApps || [],
         faqs: rest.faqs || [],
         appearanceColor: rest.appearanceColor || "#3b82f6",
         growthTools: {
            showMemberCount: rest.growthTools?.showMemberCount !== false,
         },
         productSettings: {
            purchaseButtonText:
               rest.productSettings?.purchaseButtonText || "Join",
            productTaxCode: rest.productSettings?.productTaxCode || "",
            productUrl,
            addAffiliateRate: rest.productSettings?.addAffiliateRate !== false,
            affiliateRate: Number(rest.productSettings?.affiliateRate) || 30,
            checkoutRedirect: rest.productSettings?.checkoutRedirect || false,
            checkoutRedirectUrl:
               rest.productSettings?.checkoutRedirectUrl || "",
            visibleOnStorePage:
               rest.productSettings?.visibleOnStorePage !== false,
         },
         visibility: rest.visibility || "visible",
         discoverStatus: rest.discoverStatus || "unlisted",
         stats: {
            allTimeRevenue: 0,
            activeUsers: 0,
            checkoutConversion: 0,
            totalSales: 0,
         },
      });

      return NextResponse.json({
         product: {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            productUrl: product.productSettings.productUrl,
         },
      });
   } catch (err: unknown) {
      console.error("[Products POST]", err);
      const message = err instanceof Error ? err.message : "Server error";
      return NextResponse.json({ error: message }, { status: 500 });
   }
}
