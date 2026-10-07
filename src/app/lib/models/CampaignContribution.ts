import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICampaignContribution extends Document {
   campaignId: Types.ObjectId;
   userId: Types.ObjectId;
   userName: string;
   userAvatar: string;
   totalViews: number;
   totalEarned: number;
   status: "active" | "paused";
   joinedAt: Date;
   createdAt: Date;
}

const CampaignContributionSchema = new Schema<ICampaignContribution>(
   {
      campaignId: {
         type: Schema.Types.ObjectId,
         ref: "Campaign",
         required: true,
         index: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      userName: { type: String, required: true },
      userAvatar: { type: String, default: "" },
      totalViews: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "paused"], default: "active" },
      joinedAt: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

CampaignContributionSchema.index(
   { campaignId: 1, userId: 1 },
   { unique: true },
);

const CampaignContribution: Model<ICampaignContribution> =
   mongoose.models.CampaignContribution ||
   mongoose.model<ICampaignContribution>(
      "CampaignContribution",
      CampaignContributionSchema,
   );

export default CampaignContribution;
