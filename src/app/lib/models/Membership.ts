import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMembership extends Document {
   businessId: Types.ObjectId;
   userId: Types.ObjectId;
   productId: Types.ObjectId;
   productName: string;
   email: string;
   name: string;
   avatar: string;
   status: "active" | "inactive";
   totalSpend: number;
   createdAt: Date;
   canceledAt?: Date;
   cancelReason: string;
}

const MembershipSchema = new Schema<IMembership>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      productId: {
         type: Schema.Types.ObjectId,
         ref: "Product",
         required: true,
      },
      productName: { type: String, required: true },
      email: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: "" },
      status: {
         type: String,
         enum: ["active", "inactive"],
         default: "active",
         index: true,
      },
      totalSpend: { type: Number, default: 0 },
      canceledAt: { type: Date },
      cancelReason: { type: String, default: "" },
   },
   { timestamps: true },
);

MembershipSchema.index({ businessId: 1, createdAt: -1 });

const Membership: Model<IMembership> =
   mongoose.models.Membership ||
   mongoose.model<IMembership>("Membership", MembershipSchema);

export default Membership;
