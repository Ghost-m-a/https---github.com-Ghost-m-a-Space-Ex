import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICampaignSubmission extends Document {
   campaignId: Types.ObjectId;
   contributionId: Types.ObjectId;
   userId: Types.ObjectId;
   platform: string;
   videoUrl: string;
   views: number;
   credit: number;
   status: "pending" | "approved" | "rejected";
   createdAt: Date;
}

const CampaignSubmissionSchema = new Schema<ICampaignSubmission>(
   {
      campaignId: {
         type: Schema.Types.ObjectId,
         ref: "Campaign",
         required: true,
         index: true,
      },
      contributionId: {
         type: Schema.Types.ObjectId,
         ref: "CampaignContribution",
         required: true,
         index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      platform: { type: String, required: true },
      videoUrl: { type: String, required: true },
      views: { type: Number, default: 0 },
      credit: { type: Number, default: 0 },
      status: {
         type: String,
         enum: ["pending", "approved", "rejected"],
         default: "approved",
      },
   },
   { timestamps: true },
);

const CampaignSubmission: Model<ICampaignSubmission> =
   mongoose.models.CampaignSubmission ||
   mongoose.model<ICampaignSubmission>(
      "CampaignSubmission",
      CampaignSubmissionSchema,
   );

export default CampaignSubmission;
