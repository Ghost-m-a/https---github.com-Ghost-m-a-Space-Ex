import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentStatus =
   | "succeeded"
   | "needs_review"
   | "failed"
   | "pending"
   | "blocked"
   | "disputed"
   | "resolution";

export type PaymentMethod =
   | "card"
   | "paypal"
   | "apple_pay"
   | "google_pay"
   | "crypto"
   | "balance";

export interface IPayment extends Document {
   businessId: Types.ObjectId;
   amount: number;
   currency: string;
   status: PaymentStatus;
   product: string;
   productId?: Types.ObjectId;
   plan: string;
   method: PaymentMethod;
   methodLast4?: string;
   email: string;
   customerName?: string;
   reason: string;
   promoCode: string;
   userId?: Types.ObjectId;
   userAvatar?: string;
   refunded: boolean;
   metadata: Record<string, unknown>;
   createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      amount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
      status: {
         type: String,
         enum: [
            "succeeded",
            "needs_review",
            "failed",
            "pending",
            "blocked",
            "disputed",
            "resolution",
         ],
         default: "pending",
         index: true,
      },
      product: { type: String, default: "" },
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      plan: { type: String, default: "One-time" },
      method: {
         type: String,
         enum: [
            "card",
            "paypal",
            "apple_pay",
            "google_pay",
            "crypto",
            "balance",
         ],
         default: "card",
      },
      methodLast4: { type: String, default: "" },
      email: { type: String, default: "" },
      customerName: { type: String, default: "" },
      reason: { type: String, default: "" },
      promoCode: { type: String, default: "" },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      userAvatar: { type: String, default: "" },
      refunded: { type: Boolean, default: false },
      metadata: { type: Schema.Types.Mixed, default: {} },
   },
   { timestamps: true },
);

PaymentSchema.index({ businessId: 1, createdAt: -1 });
PaymentSchema.index({ businessId: 1, status: 1 });

const Payment: Model<IPayment> =
   mongoose.models.Payment ||
   mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
