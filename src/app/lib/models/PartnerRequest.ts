import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPartnerRequest extends Document {
   userId: Types.ObjectId;
   partnerName: string;
   partnerAvatar: string;
   message: string;
   status: "pending" | "accepted" | "declined";
   createdAt: Date;
}

const PartnerRequestSchema = new Schema<IPartnerRequest>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      partnerName: { type: String, required: true },
      partnerAvatar: { type: String, default: "" },
      message: { type: String, default: "" },
      status: {
         type: String,
         enum: ["pending", "accepted", "declined"],
         default: "pending",
      },
   },
   { timestamps: true },
);

const PartnerRequest: Model<IPartnerRequest> =
   mongoose.models.PartnerRequest ||
   mongoose.model<IPartnerRequest>("PartnerRequest", PartnerRequestSchema);

export default PartnerRequest;
