import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SignupStatus =
   | "pending"
   | "approved"
   | "rejected"
   | "withdrawn"
   | "left"
   // legacy statuses kept for compatibility
   | "active"
   | "signed_up"
   | "inactive";

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
   status: SignupStatus;

   applicationMessage: string; // creator's pitch
   reviewedBy?: Types.ObjectId;
   reviewedAt?: Date;
   reviewNote: string;

   referrals: number;
   rewardsEarned: number;
   signedUpAt: Date;
   createdAt: Date;
   updatedAt: Date;
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
         enum: [
            "pending",
            "approved",
            "rejected",
            "withdrawn",
            "left",
            "active",
            "signed_up",
            "inactive",
         ],
         default: "pending",
         index: true,
      },
      applicationMessage: { type: String, default: "" },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      reviewNote: { type: String, default: "" },
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
AffiliateSignupSchema.index({ businessId: 1, status: 1, createdAt: -1 });

const AffiliateSignup: Model<IAffiliateSignup> =
   mongoose.models.AffiliateSignup ||
   mongoose.model<IAffiliateSignup>("AffiliateSignup", AffiliateSignupSchema);

export default AffiliateSignup;
