import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrder extends Document {
   userId: Types.ObjectId;
   productName: string;
   productImage: string;
   amount: number;
   currency: string;
   status: "pending" | "completed" | "refunded" | "failed";
   isWaitlist: boolean;
   notes: string;
   createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      productName: { type: String, required: true },
      productImage: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      status: {
         type: String,
         enum: ["pending", "completed", "refunded", "failed"],
         default: "pending",
      },
      isWaitlist: { type: Boolean, default: false },
      notes: { type: String, default: "" },
   },
   { timestamps: true },
);

const Order: Model<IOrder> =
   mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
