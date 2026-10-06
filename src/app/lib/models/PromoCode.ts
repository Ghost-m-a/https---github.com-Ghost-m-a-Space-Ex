import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPromoCode extends Document {
   businessId: Types.ObjectId;
   code: string;
   discount: number;
   discountType: "percentage" | "fixed";
   discountDuration: "once" | "forever" | "repeating";
   repeatingMonths: number;
   eligibleUsers: "everyone" | "new_customers" | "specific";
   affiliateId?: Types.ObjectId;
   status: "active" | "expired" | "disabled";
   expiresAt?: Date;
   maxRedemptions: number;
   currentRedemptions: number;
   onePerUser: boolean;
   appliesToProducts: string[];
   uses: number;
   createdAt: Date;
   updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      code: {
         type: String,
         required: true,
         uppercase: true,
         trim: true,
         index: true,
      },
      discount: { type: Number, required: true, min: 0 },
      discountType: {
         type: String,
         enum: ["percentage", "fixed"],
         default: "percentage",
      },
      discountDuration: {
         type: String,
         enum: ["once", "forever", "repeating"],
         default: "forever",
      },
      repeatingMonths: { type: Number, default: 3 },
      eligibleUsers: {
         type: String,
         enum: ["everyone", "new_customers", "specific"],
         default: "everyone",
      },
      affiliateId: { type: Schema.Types.ObjectId, ref: "Affiliate" },
      status: {
         type: String,
         enum: ["active", "expired", "disabled"],
         default: "active",
         index: true,
      },
      expiresAt: { type: Date },
      maxRedemptions: { type: Number, default: 0 },
      currentRedemptions: { type: Number, default: 0 },
      onePerUser: { type: Boolean, default: true },
      appliesToProducts: { type: [String], default: [] },
      uses: { type: Number, default: 0 },
   },
   { timestamps: true },
);

PromoCodeSchema.index({ businessId: 1, code: 1 }, { unique: true });

const PromoCode: Model<IPromoCode> =
   mongoose.models.PromoCode ||
   mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

export default PromoCode;
