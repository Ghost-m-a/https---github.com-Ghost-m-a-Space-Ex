import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAffiliate extends Document {
   businessId: Types.ObjectId;
   userId: Types.ObjectId;
   name: string;
   email: string;
   username: string;
   avatar: string;
   referralCode: string;
   commissionRate: number; // percentage
   status: "active" | "pending" | "rejected" | "suspended";
   referrals: number;
   rewardsEarned: number;
   retention: number;
   signedUpAt: Date;
   createdAt: Date;
   updatedAt: Date;
}

const AffiliateSchema = new Schema<IAffiliate>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      username: { type: String, default: "" },
      avatar: { type: String, default: "" },
      referralCode: {
         type: String,
         required: true,
         unique: true,
         index: true,
      },
      commissionRate: { type: Number, default: 30, min: 0, max: 100 },
      status: {
         type: String,
         enum: ["active", "pending", "rejected", "suspended"],
         default: "pending",
         index: true,
      },
      referrals: { type: Number, default: 0 },
      rewardsEarned: { type: Number, default: 0 },
      retention: { type: Number, default: 0 },
      signedUpAt: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

AffiliateSchema.index({ businessId: 1, createdAt: -1 });

const Affiliate: Model<IAffiliate> =
   mongoose.models.Affiliate ||
   mongoose.model<IAffiliate>("Affiliate", AffiliateSchema);

export default Affiliate;
