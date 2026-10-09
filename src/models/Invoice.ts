import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvoiceLineItem {
   name: string;
   amount: number;
}

export interface IInvoice extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   number: string;
   customerName: string;
   customerEmail: string;
   product: string;
   pricingType: "one-time" | "recurring";
   price: number;
   currency: string;
   status: "draft" | "sent" | "paid" | "overdue" | "void";
   dueDate: Date;
   description: string;
   lineItems: IInvoiceLineItem[];
   subtotal: number;
   total: number;
   createdAt: Date;
   updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      number: { type: String, required: true, index: true },
      customerName: { type: String, default: "" },
      customerEmail: { type: String, default: "" },
      product: { type: String, default: "" },
      pricingType: {
         type: String,
         enum: ["one-time", "recurring"],
         default: "one-time",
      },
      price: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      status: {
         type: String,
         enum: ["draft", "sent", "paid", "overdue", "void"],
         default: "draft",
         index: true,
      },
      dueDate: {
         type: Date,
         default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      description: { type: String, default: "", maxlength: 500 },
      lineItems: [
         {
            name: { type: String, default: "" },
            amount: { type: Number, default: 0 },
         },
      ],
      subtotal: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
   },
   { timestamps: true },
);

const Invoice: Model<IInvoice> =
   mongoose.models.Invoice ||
   mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
