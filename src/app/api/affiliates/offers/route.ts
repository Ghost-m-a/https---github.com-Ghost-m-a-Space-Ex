import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HotOffer from "@/models/HotOffer";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Seed once if empty
async function ensureSeed() {
   const count = await HotOffer.countDocuments();
   if (count > 0) return;
   await HotOffer.create([
      {
         name: "ToolSuit",
         tagline: "AI toolkit",
         pricingType: "recurring",
         productPrice: 29.95,
         commissionRate: 30,
         commissionRateMax: 50,
         affiliateSales: 10000,
         affiliateEarnings: 500000,
         conversionRate: 4.37,
         earningsPerClick: 1.81,
         coverColor: "#3b82f6",
         coverEmoji: "🛠️",
      },
      {
         name: "PokeNotify",
         tagline: "Trading cards",
         pricingType: "recurring",
         productPrice: 8.99,
         commissionRate: 50,
         affiliateSales: 10000,
         affiliateEarnings: 10000,
         conversionRate: 12.38,
         earningsPerClick: 0.29,
         coverColor: "#a855f7",
         coverEmoji: "🔔",
      },
      {
         name: "Deal Soldier",
         tagline: "Cook groups",
         pricingType: "recurring",
         productPrice: 44.0,
         commissionRate: 30,
         affiliateSales: 10000,
         affiliateEarnings: 500000,
         conversionRate: 5.09,
         earningsPerClick: 0.12,
         coverColor: "#10b981",
         coverEmoji: "🎯",
      },
      {
         name: "Pro Options Trading",
         tagline: "Options trading",
         pricingType: "recurring",
         productPrice: 699.0,
         commissionRate: 15,
         affiliateSales: 10000,
         affiliateEarnings: 500000,
         conversionRate: 3.36,
         earningsPerClick: 19.23,
         coverColor: "#6366f1",
         coverEmoji: "📈",
      },
   ]);
}

export async function GET() {
   try {
      await connectDB();
      await ensureSeed();
      const offers = await HotOffer.find({ active: true })
         .sort({ earningsPerClick: -1 })
         .lean<any[]>();

      return NextResponse.json({
         offers: offers.map((o) => ({
            id: String(o._id),
            name: o.name,
            tagline: o.tagline,
            pricingType: o.pricingType,
            productPrice: o.productPrice,
            currency: o.currency,
            commissionRate: o.commissionRate,
            commissionRateMax: o.commissionRateMax,
            affiliateSales: o.affiliateSales,
            affiliateEarnings: o.affiliateEarnings,
            conversionRate: o.conversionRate,
            earningsPerClick: o.earningsPerClick,
            coverColor: o.coverColor,
            coverEmoji: o.coverEmoji,
         })),
      });
   } catch (err) {
      logError("GET /api/affiliates/offers", err);
      return NextResponse.json({ offers: [] }, { status: 500 });
   }
}
