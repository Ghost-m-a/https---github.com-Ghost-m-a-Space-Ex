import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHotOffer extends Document {
   name: string;
   tagline: string;
   pricingType: "recurring" | "one-time";
   productPrice: number;
   currency: string;
   commissionRate: number;
   commissionRateMax: number;
   affiliateSales: number;
   affiliateEarnings: number;
   conversionRate: number;
   earningsPerClick: number;
   coverColor: string;
   coverEmoji: string;
   active: boolean;
   createdAt: Date;
}

const HotOfferSchema = new Schema<IHotOffer>(
   {
      name: { type: String, required: true },
      tagline: { type: String, default: "" },
      pricingType: {
         type: String,
         enum: ["recurring", "one-time"],
         default: "recurring",
      },
      productPrice: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      commissionRate: { type: Number, default: 30 },
      commissionRateMax: { type: Number, default: 30 },
      affiliateSales: { type: Number, default: 0 },
      affiliateEarnings: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      earningsPerClick: { type: Number, default: 0 },
      coverColor: { type: String, default: "#3b82f6" },
      coverEmoji: { type: String, default: "📦" },
      active: { type: Boolean, default: true },
   },
   { timestamps: true },
);

const HotOffer: Model<IHotOffer> =
   mongoose.models.HotOffer ||
   mongoose.model<IHotOffer>("HotOffer", HotOfferSchema);

export default HotOffer;
