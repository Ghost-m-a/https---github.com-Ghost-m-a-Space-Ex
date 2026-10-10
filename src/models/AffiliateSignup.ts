import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAffiliateSignup extends Document {
   businessId: Types.ObjectId;
   affiliateId: Types.ObjectId;
   campaignId: Types.ObjectId;
   userId: Types.ObjectId;
   name: string;
   email: string;
   username: string;
   avatar: string;
   product: string;
   status: "signed_up" | "active" | "inactive";
   referrals: number;
   rewardsEarned: number;
   signedUpAt: Date;
   createdAt: Date;
}

const AffiliateSignupSchema = new Schema<IAffiliateSignup>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      affiliateId: {
         type: Schema.Types.ObjectId,
         ref: "Affiliate",
         required: true,
         index: true,
      },
      campaignId: {
         type: Schema.Types.ObjectId,
         ref: "Campaign",
         required: true,
         index: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      username: { type: String, default: "" },
      avatar: { type: String, default: "" },
      product: { type: String, default: "" },
      status: {
         type: String,
         enum: ["signed_up", "active", "inactive"],
         default: "active",
         index: true,
      },
      referrals: { type: Number, default: 0 },
      rewardsEarned: { type: Number, default: 0 },
      signedUpAt: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

AffiliateSignupSchema.index(
   { affiliateId: 1, campaignId: 1 },
   { unique: true },
);
AffiliateSignupSchema.index({ userId: 1, campaignId: 1 });

const AffiliateSignup: Model<IAffiliateSignup> =
   mongoose.models.AffiliateSignup ||
   mongoose.model<IAffiliateSignup>("AffiliateSignup", AffiliateSignupSchema);

export default AffiliateSignup;
