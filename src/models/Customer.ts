import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICustomer extends Document {
   businessId: Types.ObjectId;
   userId: Types.ObjectId;
   email: string;
   name: string;
   username: string;
   avatar: string;
   status: "joined" | "invited" | "pending" | "removed";
   country: string;
   state: string;
   city: string;
   totalSpend: number;
   joinedAt: Date;
   lastAccessed: Date;
   createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      email: { type: String, required: true, lowercase: true, trim: true },
      name: { type: String, required: true },
      username: { type: String, default: "" },
      avatar: { type: String, default: "" },
      status: {
         type: String,
         enum: ["joined", "invited", "pending", "removed"],
         default: "joined",
         index: true,
      },
      country: { type: String, default: "" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      totalSpend: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now },
      lastAccessed: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

CustomerSchema.index({ businessId: 1, userId: 1 }, { unique: true });
CustomerSchema.index({ businessId: 1, joinedAt: -1 });

const Customer: Model<ICustomer> =
   mongoose.models.Customer ||
   mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
