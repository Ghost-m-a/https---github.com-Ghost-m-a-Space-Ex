import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISubAccount extends Document {
   parentBusinessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   accountName: string;
   email: string;
   kind: "pay_workers" | "client_payments" | "marketplace_sellers";
   status: "pending" | "verified" | "active" | "suspended";
   kycStatus: "not_started" | "in_progress" | "completed";
   createdAt: Date;
   updatedAt: Date;
}

const SubAccountSchema = new Schema<ISubAccount>(
   {
      parentBusinessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      accountName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      kind: {
         type: String,
         enum: ["pay_workers", "client_payments", "marketplace_sellers"],
         default: "pay_workers",
      },
      status: {
         type: String,
         enum: ["pending", "verified", "active", "suspended"],
         default: "pending",
         index: true,
      },
      kycStatus: {
         type: String,
         enum: ["not_started", "in_progress", "completed"],
         default: "not_started",
      },
   },
   { timestamps: true },
);

const SubAccount: Model<ISubAccount> =
   mongoose.models.SubAccount ||
   mongoose.model<ISubAccount>("SubAccount", SubAccountSchema);

export default SubAccount;
