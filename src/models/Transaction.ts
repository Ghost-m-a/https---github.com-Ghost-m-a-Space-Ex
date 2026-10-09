import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TransactionKind =
   | "deposit" // money added by owner
   | "payment" // money received from customer
   | "send" // money sent to someone
   | "refund" // refund issued
   | "withdrawal" // money withdrawn
   | "card_spend" // card transaction
   | "ad_spend"; // ad campaign spend

export interface ITransaction extends Document {
   businessId: Types.ObjectId;
   kind: TransactionKind;
   amount: number; // positive number; sign determined by kind
   currency: string;
   status: "pending" | "completed" | "failed";
   description: string;
   counterparty: {
      id?: Types.ObjectId;
      name?: string;
      email?: string;
      avatar?: string;
   };
   metadata: Record<string, unknown>;
   createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      kind: {
         type: String,
         enum: [
            "deposit",
            "payment",
            "send",
            "refund",
            "withdrawal",
            "card_spend",
            "ad_spend",
         ],
         required: true,
         index: true,
      },
      amount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
      status: {
         type: String,
         enum: ["pending", "completed", "failed"],
         default: "completed",
      },
      description: { type: String, default: "" },
      counterparty: {
         id: { type: Schema.Types.ObjectId, ref: "User" },
         name: { type: String, default: "" },
         email: { type: String, default: "" },
         avatar: { type: String, default: "" },
      },
      metadata: { type: Schema.Types.Mixed, default: {} },
   },
   { timestamps: true },
);

TransactionSchema.index({ businessId: 1, createdAt: -1 });

const Transaction: Model<ITransaction> =
   mongoose.models.Transaction ||
   mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
