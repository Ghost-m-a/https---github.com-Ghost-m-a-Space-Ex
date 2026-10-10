import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerReferral extends Document {
   partnerUserId: Types.ObjectId;
   referredBusinessId: Types.ObjectId;
   referredBusinessName: string;
   referredBusinessAvatar: string;
   volume30d: number;
   earnings: number;
   referredUserName: string;
   attributedAt: Date;
   status: "active" | "pending" | "lost";
   createdAt: Date;
}

const PartnerReferralSchema = new Schema<IPartnerReferral>(
   {
      partnerUserId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      referredBusinessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
      },
      referredBusinessName: { type: String, required: true },
      referredBusinessAvatar: { type: String, default: "" },
      volume30d: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 },
      referredUserName: { type: String, default: "" },
      attributedAt: { type: Date, default: Date.now },
      status: {
         type: String,
         enum: ["active", "pending", "lost"],
         default: "active",
         index: true,
      },
   },
   { timestamps: true },
);

PartnerReferralSchema.index({ partnerUserId: 1, status: 1 });

const PartnerReferral: Model<IPartnerReferral> =
   mongoose.models.PartnerReferral ||
   mongoose.model<IPartnerReferral>("PartnerReferral", PartnerReferralSchema);

export default PartnerReferral;
