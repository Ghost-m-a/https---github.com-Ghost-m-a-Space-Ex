import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CampaignPlatform =
   | "youtube"
   | "tiktok"
   | "instagram"
   | "x"
   | "facebook";

export interface IPlatformRate {
   platform: CampaignPlatform;
   minViews: number;
   maxViews: number;
   cpm: number; // credits per 1000 views
}

export interface ICampaign extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   coverImage: string;
   previewImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;

   budget: number;
   budgetSpent: number;
   cpm: number; // default credit per 1000 views
   duration: string;

   socials: CampaignPlatform[];
   platformRates: IPlatformRate[];

   requirements: string[];
   instructions: string[];
   assets: { name: string; url: string }[];
   summary: string;

   joinedUsers: number;
   totalViews: number;

   status: "active" | "paused" | "ended" | "draft";
   featured: boolean;

   startDate: Date;
   endDate: Date | null;

   createdAt: Date;
   updatedAt: Date;
}

const PlatformRateSchema = new Schema<IPlatformRate>(
   {
      platform: {
         type: String,
         enum: ["youtube", "tiktok", "instagram", "x", "facebook"],
         required: true,
      },
      minViews: { type: Number, default: 1000 },
      maxViews: { type: Number, default: 1000000 },
      cpm: { type: Number, default: 1 },
   },
   { _id: false },
);

const CampaignSchema = new Schema<ICampaign>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      slug: { type: String, required: true, unique: true, index: true },
      title: { type: String, required: true, maxlength: 200 },
      subtitle: { type: String, default: "" },
      category: { type: String, default: "Entertainment", index: true },
      coverImage: { type: String, default: "" },
      previewImage: { type: String, default: "" },
      brandName: { type: String, default: "" },
      brandAvatar: { type: String, default: "" },
      brandVerified: { type: Boolean, default: false },

      budget: { type: Number, required: true, min: 0 },
      budgetSpent: { type: Number, default: 0, min: 0 },
      cpm: { type: Number, default: 1, min: 0 },
      duration: { type: String, default: "" },

      socials: [
         {
            type: String,
            enum: ["youtube", "tiktok", "instagram", "x", "facebook"],
         },
      ],
      platformRates: { type: [PlatformRateSchema], default: [] },

      requirements: { type: [String], default: [] },
      instructions: { type: [String], default: [] },
      assets: [{ name: String, url: String }],
      summary: { type: String, default: "" },

      joinedUsers: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },

      status: {
         type: String,
         enum: ["active", "paused", "ended", "draft"],
         default: "active",
         index: true,
      },
      featured: { type: Boolean, default: false, index: true },

      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: null },
   },
   { timestamps: true },
);

CampaignSchema.index({ budget: -1 });
CampaignSchema.index({ createdAt: -1 });

const Campaign: Model<ICampaign> =
   mongoose.models.Campaign ||
   mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
