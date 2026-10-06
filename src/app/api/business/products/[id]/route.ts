import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import Product from "@/app/lib/models/Product";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

// =========================================
// AUTH HELPER
// =========================================
async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// =========================================
// GET — fetch a single product
// =========================================
export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();

      const product = await Product.findById(id).lean();
      if (!product) {
         return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Verify ownership
      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json({ product });
   } catch (err) {
      console.error("[Product GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

// =========================================
// PATCH — update a product
// =========================================
export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      await connectDB();

      const product = await Product.findById(id);
      if (!product) {
         return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const allowed = [
         "name",
         "headline",
         "description",
         "bannerImage",
         "productImage",
         "labels",
         "collectShippingAddress",
         "accessType",
         "pricingType",
         "price",
         "currency",
         "recurringInterval",
         "launchAsWaitlist",
         "askQuestionsBeforeCheckout",
         "includedApps",
         "faqs",
         "appearanceColor",
         "growthTools",
         "productSettings",
         "visibility",
         "discoverStatus",
      ];

      for (const key of allowed) {
         if (key in body) {
            (product as any)[key] = body[key];
         }
      }

      // Clean FAQs — only keep those with a question
      if (Array.isArray(body.faqs)) {
         product.faqs = body.faqs.filter((f: { question?: string }) =>
            f.question?.trim(),
         );
      }

      // Regenerate slug if name changed
      if (body.name && body.name !== product.name) {
         const baseSlug = body.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60);

         if (baseSlug && baseSlug !== product.slug) {
            let finalSlug = baseSlug;
            let counter = 1;
            while (
               await Product.exists({
                  businessId: product.businessId,
                  slug: finalSlug,
                  _id: { $ne: product._id },
               })
            ) {
               finalSlug = `${baseSlug}-${counter++}`;
            }
            product.slug = finalSlug;
         }
      }

      await product.save();

      return NextResponse.json({ product: product.toObject() });
   } catch (err: unknown) {
      console.error("[Product PATCH]", err);
      const message = err instanceof Error ? err.message : "Server error";
      return NextResponse.json({ error: message }, { status: 500 });
   }
}

// =========================================
// DELETE — remove a product
// =========================================
export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();

      const product = await Product.findById(id);
      if (!product) {
         return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await product.deleteOne();

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error("[Product DELETE]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
