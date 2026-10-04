import { NextResponse, NextRequest } from "next/server";
import { businessDb } from "@/app/lib/db";

export async function GET() {
   return NextResponse.json({ products: businessDb.getProducts() });
}

export async function POST(req: NextRequest) {
   const body = await req.json();
   if (body.action === "toggle") {
      const p = businessDb.toggleProductStatus(body.id);
      return NextResponse.json(p);
   }
   const p = businessDb.addProduct({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      type: body.type,
      status: "draft",
      image: body.name.substring(0, 2).toUpperCase(),
   });
   return NextResponse.json(p, { status: 201 });
}
