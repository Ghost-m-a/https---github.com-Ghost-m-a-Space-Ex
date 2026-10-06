import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type Platform = "facebook" | "tiktok" | "google" | "x" | "reddit";
export type Objective =
   | "sales"
   | "leads"
   | "engagement"
   | "traffic"
   | "awareness";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type BudgetControl = "campaign" | "ad_group";
export type BidStrategy = "highest_volume" | "cost_cap" | "bid_cap";
export type SpecialCategory = "none" | "financial" | "employment" | "housing";
export type ConversionLocation = "website" | "message_destinations";

export interface ICampaign extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   platform: Platform;
   objective: Objective;
   title: string;
   budgetType: "daily" | "lifetime";
   budgetAmount: number;
   budgetControl: BudgetControl;
   bidStrategy: BidStrategy;
   specialAdCategory: SpecialCategory;
   status: CampaignStatus;
   onOff: boolean;

   // Build step
   conversionLocation: ConversionLocation;
   conversionEvent: string;
   advantagePlacements: boolean;
   advantageAudience: boolean;
   minAge: number;
   countries: string[];
   facebookPage: string;
   instagramAccount: string;
   messageDestinations: { messenger: boolean; instagram: boolean };
   performanceGoal: string;

   // Schedule
   startDate: Date | null;
   endDate: Date | null;
   setEndDate: boolean;
   deliveryHours: string;
   minDailySpend: number;
   languages: string[];

   // Stats
   stats: {
      spent: number;
      impressions: number;
      clicks: number;
      results: number;
      roas: number;
      revenue: number;
   };

   createdAt: Date;
   updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      platform: {
         type: String,
         enum: ["facebook", "tiktok", "google", "x", "reddit"],
         default: "facebook",
      },
      objective: {
         type: String,
         enum: ["sales", "leads", "engagement", "traffic", "awareness"],
         default: "sales",
      },
      title: { type: String, required: true, trim: true, maxlength: 200 },
      budgetType: {
         type: String,
         enum: ["daily", "lifetime"],
         default: "daily",
      },
      budgetAmount: { type: Number, default: 0, min: 0 },
      budgetControl: {
         type: String,
         enum: ["campaign", "ad_group"],
         default: "campaign",
      },
      bidStrategy: {
         type: String,
         enum: ["highest_volume", "cost_cap", "bid_cap"],
         default: "highest_volume",
      },
      specialAdCategory: {
         type: String,
         enum: ["none", "financial", "employment", "housing"],
         default: "none",
      },
      status: {
         type: String,
         enum: ["draft", "active", "paused", "completed"],
         default: "draft",
         index: true,
      },
      onOff: { type: Boolean, default: false },

      conversionLocation: {
         type: String,
         enum: ["website", "message_destinations"],
         default: "website",
      },
      conversionEvent: { type: String, default: "" },
      advantagePlacements: { type: Boolean, default: true },
      advantageAudience: { type: Boolean, default: true },
      minAge: { type: Number, default: 18 },
      countries: { type: [String], default: ["United States"] },
      facebookPage: { type: String, default: "" },
      instagramAccount: { type: String, default: "" },
      messageDestinations: {
         messenger: { type: Boolean, default: true },
         instagram: { type: Boolean, default: false },
      },
      performanceGoal: { type: String, default: "maximize_conversions" },

      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      setEndDate: { type: Boolean, default: false },
      deliveryHours: { type: String, default: "all_day" },
      minDailySpend: { type: Number, default: 0, min: 0 },
      languages: { type: [String], default: [] },

      stats: {
         spent: { type: Number, default: 0 },
         impressions: { type: Number, default: 0 },
         clicks: { type: Number, default: 0 },
         results: { type: Number, default: 0 },
         roas: { type: Number, default: 0 },
         revenue: { type: Number, default: 0 },
      },
   },
   { timestamps: true },
);

CampaignSchema.index({ businessId: 1, createdAt: -1 });

const Campaign: Model<ICampaign> =
   mongoose.models.Campaign ||
   mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
