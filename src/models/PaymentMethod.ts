import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPaymentMethod extends Document {
   userId: Types.ObjectId;
   brand: string;
   last4: string;
   expiry: string;
   holderName: string;
   country: string;
   addressLine1: string;
   isDefault: boolean;
   createdAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      brand: { type: String, required: true },
      last4: { type: String, required: true, maxlength: 4 },
      expiry: { type: String, required: true },
      holderName: { type: String, required: true },
      country: { type: String, default: "" },
      addressLine1: { type: String, default: "" },
      isDefault: { type: Boolean, default: false },
   },
   { timestamps: true },
);

const PaymentMethod: Model<IPaymentMethod> =
   mongoose.models.PaymentMethod ||
   mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);

export default PaymentMethod;
