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

// GET — single product
export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();

      const product = await Product.findById(id).lean();
      if (!product)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      // Verify ownership
      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      return NextResponse.json({ product });
   } catch (err) {
      console.error("[Product GET]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

// PATCH — update product
export async function PATCH(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();
      await connectDB();

      const product = await Product.findById(id);
      if (!product)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

      // Regenerate slug if name changed
      if (body.name && body.name !== product.name) {
         const slug = body.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .slice(0, 60);
         if (slug && slug !== product.slug) {
            let finalSlug = slug;
            let counter = 1;
            while (
               await Product.exists({
                  businessId: product.businessId,
                  slug: finalSlug,
                  _id: { $ne: product._id },
               })
            ) {
               finalSlug = `${slug}-${counter++}`;
            }
            product.slug = finalSlug;
         }
      }

      await product.save();

      return NextResponse.json({ product: product.toObject() });
   } catch (err) {
      console.error("[Product PATCH]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}

// DELETE — remove product
export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
   try {
      const { id } = await params;
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();

      const product = await Product.findById(id);
      if (!product)
         return NextResponse.json({ error: "Not found" }, { status: 404 });

      const business = await Business.findOne({
         _id: product.businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      await product.deleteOne();

      return NextResponse.json({ success: true });
   } catch (err) {
      console.error("[Product DELETE]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
