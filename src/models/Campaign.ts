import mongoose, { Schema, Document, Model, Types } from "mongoose";

// =========================================
// SHARED TYPES
// =========================================
export type AdFormat =
   | "feed"
   | "short-video"
   | "search-display"
   | "text-feed"
   | "community";

export type Objective =
   | "views"
   | "comments"
   | "shares"
   | "subscribes"
   | "follows"
   | "engagement"
   | "sales"
   | "leads"
   | "traffic"
   | "awareness";

export type CampaignPlatform =
   | "youtube"
   | "tiktok"
   | "instagram"
   | "x"
   | "facebook";

export interface IPlatformRate {
   platform: CampaignPlatform | string;
   minViews: number;
   maxViews: number;
   cpm: number;
}

export interface ICampaignAsset {
   type?: string;
   url?: string;
   label?: string;
   thumbnail?: string;
   [key: string]: unknown;
}

export interface ICampaign extends Document {
   // Ownership
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;

   // Identity
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   summary: string;

   // Brand display
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;

   // Visuals
   coverImage: string;
   previewImage: string;

   // Format & platform
   adFormat: AdFormat;
   platform: CampaignPlatform | "multi";
   socials: CampaignPlatform[];

   // Objective (what the advertiser wants to grow)
   objective: Objective;
   conversionEvent: string;

   // Budget & bid
   budget: number;
   budgetSpent: number;
   budgetType: "daily" | "lifetime";
   bidStrategy: "highest-volume" | "cost-cap" | "manual";
   cpm: number;

   // Audience targeting
   targetCountries: string[];
   targetLanguages: string[];
   minAge: number;
   maxAge: number;
   globalReach: boolean;

   // Creator requirements
   minFollowers: number;
   minEngagement: number;
   creatorRequirements: string[];

   // Deliverable & brief
   deliverable: string;
   instructions: string[];
   requirements: string[];

   // Legacy / compatibility
   duration: string;
   platformRates: IPlatformRate[];
   assets: ICampaignAsset[];

   // Schedule
   startDate: Date;
   endDate: Date | null;

   // Stats
   joinedUsers: number;
   totalViews: number;

   // Status — includes legacy "ended"
   status: "draft" | "active" | "paused" | "completed" | "archived" | "ended";
   featured: boolean;

   createdAt: Date;
   updatedAt: Date;
}

// =========================================
// SCHEMA
// =========================================
const PlatformRateSchema = new Schema<IPlatformRate>(
   {
      platform: { type: String, required: true },
      minViews: { type: Number, default: 0 },
      maxViews: { type: Number, default: 0 },
      cpm: { type: Number, default: 0 },
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
      title: { type: String, required: true },
      subtitle: { type: String, default: "" },
      category: { type: String, default: "General" },
      summary: { type: String, default: "" },

      brandName: { type: String, default: "" },
      brandAvatar: { type: String, default: "" },
      brandVerified: { type: Boolean, default: false },

      coverImage: { type: String, default: "" },
      previewImage: { type: String, default: "" },

      adFormat: {
         type: String,
         enum: [
            "feed",
            "short-video",
            "search-display",
            "text-feed",
            "community",
         ],
         default: "short-video",
      },
      platform: {
         type: String,
         enum: ["youtube", "tiktok", "instagram", "x", "facebook", "multi"],
         default: "multi",
      },
      socials: {
         type: [String],
         enum: ["youtube", "tiktok", "instagram", "x", "facebook"],
         default: [],
      },

      objective: {
         type: String,
         enum: [
            "views",
            "comments",
            "shares",
            "subscribes",
            "follows",
            "engagement",
            "sales",
            "leads",
            "traffic",
            "awareness",
         ],
         default: "views",
      },
      conversionEvent: { type: String, default: "" },

      budget: { type: Number, required: true, min: 1 },
      budgetSpent: { type: Number, default: 0 },
      budgetType: {
         type: String,
         enum: ["daily", "lifetime"],
         default: "lifetime",
      },
      bidStrategy: {
         type: String,
         enum: ["highest-volume", "cost-cap", "manual"],
         default: "highest-volume",
      },
      cpm: { type: Number, required: true, min: 0.01 },

      targetCountries: { type: [String], default: [] },
      targetLanguages: { type: [String], default: [] },
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 65 },
      globalReach: { type: Boolean, default: true },

      minFollowers: { type: Number, default: 0 },
      minEngagement: { type: Number, default: 0 },
      creatorRequirements: { type: [String], default: [] },

      deliverable: { type: String, default: "" },
      instructions: { type: [String], default: [] },
      requirements: { type: [String], default: [] },

      // ---------- Legacy fields kept for backward compatibility ----------
      duration: { type: String, default: "" },
      platformRates: { type: [PlatformRateSchema], default: [] },
      assets: { type: Schema.Types.Mixed, default: [] },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: null },

      joinedUsers: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },

      status: {
         type: String,
         enum: ["draft", "active", "paused", "completed", "archived", "ended"],
         default: "active",
         index: true,
      },
      featured: { type: Boolean, default: false },
   },
   { timestamps: true },
);

CampaignSchema.index({ businessId: 1, createdAt: -1 });
CampaignSchema.index({ status: 1, featured: -1, joinedUsers: -1 });

const Campaign: Model<ICampaign> =
   mongoose.models.Campaign ||
   mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
