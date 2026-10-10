import mongoose, { Schema, Document, Model, Types } from "mongoose";

// =========================================
// TYPES
// =========================================
export type AdFormat =
   | "feed"
   | "short-video"
   | "search-display"
   | "text-feed"
   | "community";

export type Objective =
   | "sales"
   | "leads"
   | "engagement"
   | "traffic"
   | "awareness"
   | "views"
   | "comments"
   | "shares"
   | "subscribes"
   | "follows";

export type CampaignPlatform =
   | "youtube"
   | "tiktok"
   | "instagram"
   | "x"
   | "facebook";

export type BudgetControl = "campaign" | "adgroup";
export type BidStrategy = "highest-volume" | "cost-cap" | "bid-cap";
export type SpecialAdCategory =
   | "none"
   | "financial-products"
   | "employment"
   | "housing";
export type ConversionLocation = "website" | "messages";
export type PerformanceGoal =
   | "maximize-conversions"
   | "maximize-conversations"
   | "maximize-clicks";

export type CTAType =
   | "learn-more"
   | "shop-now"
   | "sign-up"
   | "subscribe"
   | "download"
   | "contact-us"
   | "get-offer"
   | "book-now"
   | "watch-more";

export interface IPlatformRate {
   platform: CampaignPlatform | string;
   minViews: number;
   maxViews: number;
   cpm: number;
}

export interface IMediaAsset {
   url: string;
   type: "image" | "video";
   name?: string;
   size?: number;
   width?: number;
   height?: number;
   thumbnail?: string;
}

export interface ICampaignAsset {
   type?: string;
   url?: string;
   label?: string;
   thumbnail?: string;
   [key: string]: unknown;
}

export interface ICampaign extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;

   slug: string;
   title: string;
   subtitle: string;
   category: string;
   summary: string;

   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;

   coverImage: string;
   previewImage: string;

   // Step 1
   adFormat: AdFormat;
   objective: Objective;
   platform: CampaignPlatform | "multi";
   socials: CampaignPlatform[];

   budget: number;
   budgetSpent: number;
   budgetType: "daily" | "lifetime";
   budgetControl: BudgetControl;
   bidStrategy: BidStrategy;
   bidCapAmount: number;
   cpm: number;
   specialAdCategory: SpecialAdCategory;

   // Step 2
   conversionLocation: ConversionLocation;
   conversionEvent: string;
   performanceGoal: PerformanceGoal;

   messageDestinations: string[];
   pageId: string;
   socialProfileId: string;

   globalReach: boolean;
   targetCountries: string[];
   targetLanguages: string[];
   excludedCountries: string[];
   minAge: number;
   maxAge: number;
   autoAudience: boolean;
   audiences: string[];
   audienceId: string; // ← SavedAudience reference

   autoPlacements: boolean;

   startDate: Date;
   endDate: Date | null;
   minDailySpend: number;
   deliveryHours: string[];

   // Step 3 — Ad creative
   headline: string;
   primaryText: string;
   ctaType: CTAType;
   ctaUrl: string;
   mediaAssets: IMediaAsset[];

   // Step 4 — Creator brief
   minFollowers: number;
   minEngagement: number;
   creatorRequirements: string[];
   deliverable: string;
   instructions: string[];
   requirements: string[];
   duration: string;
   platformRates: IPlatformRate[];
   assets: ICampaignAsset[];

   joinedUsers: number;
   totalViews: number;

   status: "draft" | "active" | "paused" | "completed" | "archived" | "ended";
   featured: boolean;

   createdAt: Date;
   updatedAt: Date;
}

// =========================================
// SCHEMAS
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

const MediaAssetSchema = new Schema<IMediaAsset>(
   {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
      name: { type: String, default: "" },
      size: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      thumbnail: { type: String, default: "" },
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
         default: "feed",
      },
      objective: {
         type: String,
         enum: [
            "sales",
            "leads",
            "engagement",
            "traffic",
            "awareness",
            "views",
            "comments",
            "shares",
            "subscribes",
            "follows",
         ],
         default: "sales",
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

      budget: { type: Number, required: true, min: 1 },
      budgetSpent: { type: Number, default: 0 },
      budgetType: {
         type: String,
         enum: ["daily", "lifetime"],
         default: "daily",
      },
      budgetControl: {
         type: String,
         enum: ["campaign", "adgroup"],
         default: "campaign",
      },
      bidStrategy: {
         type: String,
         enum: ["highest-volume", "cost-cap", "bid-cap"],
         default: "highest-volume",
      },
      bidCapAmount: { type: Number, default: 0 },
      cpm: { type: Number, required: true, min: 0.01, default: 1 },
      specialAdCategory: {
         type: String,
         enum: ["none", "financial-products", "employment", "housing"],
         default: "none",
      },

      conversionLocation: {
         type: String,
         enum: ["website", "messages"],
         default: "website",
      },
      conversionEvent: { type: String, default: "" },
      performanceGoal: {
         type: String,
         enum: [
            "maximize-conversions",
            "maximize-conversations",
            "maximize-clicks",
         ],
         default: "maximize-conversions",
      },

      messageDestinations: { type: [String], default: [] },
      pageId: { type: String, default: "" },
      socialProfileId: { type: String, default: "" },

      globalReach: { type: Boolean, default: true },
      targetCountries: { type: [String], default: [] },
      targetLanguages: { type: [String], default: [] },
      excludedCountries: { type: [String], default: [] },
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 65 },
      autoAudience: { type: Boolean, default: true },
      audiences: { type: [String], default: [] },
      audienceId: { type: String, default: "" },

      autoPlacements: { type: Boolean, default: true },

      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: null },
      minDailySpend: { type: Number, default: 0 },
      deliveryHours: { type: [String], default: [] },

      // Step 3
      headline: { type: String, default: "" },
      primaryText: { type: String, default: "" },
      ctaType: {
         type: String,
         enum: [
            "learn-more",
            "shop-now",
            "sign-up",
            "subscribe",
            "download",
            "contact-us",
            "get-offer",
            "book-now",
            "watch-more",
         ],
         default: "learn-more",
      },
      ctaUrl: { type: String, default: "" },
      mediaAssets: { type: [MediaAssetSchema], default: [] },

      // Step 4
      minFollowers: { type: Number, default: 0 },
      minEngagement: { type: Number, default: 0 },
      creatorRequirements: { type: [String], default: [] },
      deliverable: { type: String, default: "" },
      instructions: { type: [String], default: [] },
      requirements: { type: [String], default: [] },
      duration: { type: String, default: "" },
      platformRates: { type: [PlatformRateSchema], default: [] },
      assets: { type: Schema.Types.Mixed, default: [] },

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
