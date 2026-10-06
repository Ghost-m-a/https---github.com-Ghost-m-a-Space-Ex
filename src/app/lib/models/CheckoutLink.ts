import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CheckoutPricingType = "free" | "one-time" | "recurring";

export interface ICheckoutBranding {
   backgroundColor: string;
   buttonColor: string;
   font: string;
   borderStyle: string;
}

export interface ICheckoutLink extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   productId?: Types.ObjectId;
   productName: string;
   headline: string;
   description: string;
   includedApps: string[];
   pricingType: CheckoutPricingType;
   price: number;
   currency: string;
   recurringInterval: "monthly" | "yearly" | "";
   amountPresets: number[];
   advancedOptions: boolean;
   acceptLocalCurrencies: boolean;
   customizePaymentMethods: boolean;
   checkoutBranding: ICheckoutBranding;
   slug: string;
   url: string;
   createdAt: Date;
   updatedAt: Date;
}

const CheckoutLinkSchema = new Schema<ICheckoutLink>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String, required: true, trim: true, maxlength: 100 },
      headline: { type: String, default: "", maxlength: 80 },
      description: { type: String, default: "", maxlength: 400 },
      includedApps: [{ type: String }],
      pricingType: {
         type: String,
         enum: ["free", "one-time", "recurring"],
         default: "one-time",
      },
      price: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "USD" },
      recurringInterval: {
         type: String,
         enum: ["monthly", "yearly", ""],
         default: "",
      },
      amountPresets: {
         type: [Number],
         default: [50, 100, 250],
      },
      advancedOptions: { type: Boolean, default: false },
      acceptLocalCurrencies: { type: Boolean, default: true },
      customizePaymentMethods: { type: Boolean, default: false },
      checkoutBranding: {
         backgroundColor: { type: String, default: "#000000" },
         buttonColor: { type: String, default: "#ffffff" },
         font: { type: String, default: "global" },
         borderStyle: { type: String, default: "global" },
      },
      slug: { type: String, index: true },
      url: { type: String, default: "" },
   },
   { timestamps: true },
);

CheckoutLinkSchema.index({ businessId: 1, createdAt: -1 });

const CheckoutLink: Model<ICheckoutLink> =
   mongoose.models.CheckoutLink ||
   mongoose.model<ICheckoutLink>("CheckoutLink", CheckoutLinkSchema);

export default CheckoutLink;
