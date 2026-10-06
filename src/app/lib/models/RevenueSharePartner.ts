import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRevenueSharePartner extends Document {
   businessId: Types.ObjectId;
   userId: Types.ObjectId;
   name: string;
   email: string;
   avatar: string;
   product: string;
   earned: number;
   share: number; // percentage
   payoutType: "automatic" | "manual";
   status: "active" | "paused";
   createdAt: Date;
}

const RevenueSharePartnerSchema = new Schema<IRevenueSharePartner>(
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
      avatar: { type: String, default: "" },
      product: { type: String, required: true },
      earned: { type: Number, default: 0 },
      share: { type: Number, default: 20, min: 0, max: 100 },
      payoutType: {
         type: String,
         enum: ["automatic", "manual"],
         default: "automatic",
      },
      status: {
         type: String,
         enum: ["active", "paused"],
         default: "active",
      },
   },
   { timestamps: true },
);

const RevenueSharePartner: Model<IRevenueSharePartner> =
   mongoose.models.RevenueSharePartner ||
   mongoose.model<IRevenueSharePartner>(
      "RevenueSharePartner",
      RevenueSharePartnerSchema,
   );

export default RevenueSharePartner;
