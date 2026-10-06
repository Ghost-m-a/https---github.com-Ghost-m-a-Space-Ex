import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ products: businessDb.getProducts() });
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { businessId, name, ...rest } = body;

      if (!businessId) {
         return NextResponse.json(
            { error: "No active business — please select or create one first" },
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

      // Slugify
      const baseSlug =
         name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || `product-${Date.now()}`;

      let slug = baseSlug;
      let counter = 1;
      while (await Product.exists({ businessId: business._id, slug })) {
         slug = `${baseSlug}-${counter++}`;
      }

      const productUrl =
         rest.productSettings?.productUrl ||
         `space-ex.com/${business.initial.toLowerCase()}/${slug}`;

      const product = await Product.create({
         businessId: business._id,
         name: name.trim(),
         slug,
         headline: rest.headline || "",
         description: rest.description || "",
         bannerImage: rest.bannerImage || "",
         productImage: rest.productImage || "",
         labels: Array.isArray(rest.labels) ? rest.labels : [],
         collectShippingAddress: !!rest.collectShippingAddress,
         accessType: rest.accessType || "free",
         pricingType: rest.pricingType || "one-time",
         price: Number(rest.price) || 0,
         currency: rest.currency || "USD",
         recurringInterval: rest.recurringInterval || "",
         launchAsWaitlist: !!rest.launchAsWaitlist,
         askQuestionsBeforeCheckout: !!rest.askQuestionsBeforeCheckout,
         includedApps: Array.isArray(rest.includedApps)
            ? rest.includedApps
            : [],
         faqs: Array.isArray(rest.faqs)
            ? rest.faqs.filter((f: any) => f.question?.trim())
            : [],
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
            checkoutRedirect: !!rest.productSettings?.checkoutRedirect,
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
