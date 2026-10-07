import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x";

export interface IDiscoverCampaign extends Document {
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   heroImage: string;
   previewImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;
   socials: SocialPlatform[];
   budget: number;
   raised: number;
   cpm: number;
   totalEarned: number;
   status: "active" | "paused" | "ended";
   duration: string;
   ageRestricted: boolean;
   featured: boolean;
   createdBy: Types.ObjectId;
   businessId: Types.ObjectId;
   createdAt: Date;
   updatedAt: Date;
}

const DiscoverCampaignSchema = new Schema<IDiscoverCampaign>(
   {
      slug: { type: String, required: true, unique: true, index: true },
      title: { type: String, required: true },
      subtitle: { type: String, default: "" },
      category: { type: String, default: "Entertainment", index: true },
      heroImage: { type: String, default: "" },
      previewImage: { type: String, default: "" },
      brandName: { type: String, default: "" },
      brandAvatar: { type: String, default: "" },
      brandVerified: { type: Boolean, default: false },
      socials: [
         { type: String, enum: ["youtube", "tiktok", "instagram", "x"] },
      ],
      budget: { type: Number, default: 0 },
      raised: { type: Number, default: 0 },
      cpm: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      status: {
         type: String,
         enum: ["active", "paused", "ended"],
         default: "active",
         index: true,
      },
      duration: { type: String, default: "" },
      ageRestricted: { type: Boolean, default: false },
      featured: { type: Boolean, default: false, index: true },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      businessId: { type: Schema.Types.ObjectId, ref: "Business" },
   },
   { timestamps: true },
);

DiscoverCampaignSchema.index({ budget: -1 });
DiscoverCampaignSchema.index({ createdAt: -1 });

const DiscoverCampaign: Model<IDiscoverCampaign> =
   mongoose.models.DiscoverCampaign ||
   mongoose.model<IDiscoverCampaign>(
      "DiscoverCampaign",
      DiscoverCampaignSchema,
   );

export default DiscoverCampaign;
