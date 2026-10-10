import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PagePlatform =
   | "facebook"
   | "instagram"
   | "youtube"
   | "tiktok"
   | "x";

export interface ISocialPage extends Document {
   businessId: Types.ObjectId;
   platform: PagePlatform;
   platformPageId: string;
   name: string;
   username: string;
   avatar: string;
   verified: boolean;
   connectedAt: Date;
   connectedBy: Types.ObjectId;
   status: "active" | "revoked";
   createdAt: Date;
   updatedAt: Date;
}

const SocialPageSchema = new Schema<ISocialPage>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      platform: {
         type: String,
         enum: ["facebook", "instagram", "youtube", "tiktok", "x"],
         required: true,
      },
      platformPageId: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String, default: "" },
      avatar: { type: String, default: "" },
      verified: { type: Boolean, default: false },
      connectedAt: { type: Date, default: Date.now },
      connectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      status: {
         type: String,
         enum: ["active", "revoked"],
         default: "active",
      },
   },
   { timestamps: true },
);

SocialPageSchema.index(
   { businessId: 1, platform: 1, platformPageId: 1 },
   { unique: true },
);

const SocialPage: Model<ISocialPage> =
   mongoose.models.SocialPage ||
   mongoose.model<ISocialPage>("SocialPage", SocialPageSchema);

export default SocialPage;
