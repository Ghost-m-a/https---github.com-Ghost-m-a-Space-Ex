import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface ICampaignSubmission extends Document {
   campaignId: Types.ObjectId;
   contributionId?: Types.ObjectId;
   userId: Types.ObjectId;
   platform: string;
   videoUrl: string;
   thumbnail: string;
   views: number;
   credit: number;
   status: SubmissionStatus;
   reviewedBy?: Types.ObjectId;
   reviewedAt?: Date;
   reviewNote: string;
   createdAt: Date;
   updatedAt: Date;
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
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      platform: { type: String, default: "tiktok" },
      videoUrl: { type: String, required: true },
      thumbnail: { type: String, default: "" },
      views: { type: Number, default: 0, min: 0 },
      credit: { type: Number, default: 0 },
      status: {
         type: String,
         enum: ["pending", "approved", "rejected"],
         default: "pending",
         index: true,
      },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      reviewNote: { type: String, default: "" },
   },
   { timestamps: true },
);

CampaignSubmissionSchema.index({ campaignId: 1, status: 1, createdAt: -1 });
CampaignSubmissionSchema.index({ userId: 1, createdAt: -1 });

const CampaignSubmission: Model<ICampaignSubmission> =
   mongoose.models.CampaignSubmission ||
   mongoose.model<ICampaignSubmission>(
      "CampaignSubmission",
      CampaignSubmissionSchema,
   );

export default CampaignSubmission;
