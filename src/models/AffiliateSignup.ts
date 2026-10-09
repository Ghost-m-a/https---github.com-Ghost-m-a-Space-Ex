import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAffiliateSignup extends Document {
   businessId: Types.ObjectId;
   affiliateId: Types.ObjectId;
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
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      username: { type: String, default: "" },
      avatar: { type: String, default: "" },
      product: { type: String, default: "" },
      status: {
         type: String,
         enum: ["signed_up", "active", "inactive"],
         default: "signed_up",
         index: true,
      },
      referrals: { type: Number, default: 0 },
      rewardsEarned: { type: Number, default: 0 },
      signedUpAt: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

const AffiliateSignup: Model<IAffiliateSignup> =
   mongoose.models.AffiliateSignup ||
   mongoose.model<IAffiliateSignup>("AffiliateSignup", AffiliateSignupSchema);

export default AffiliateSignup;
