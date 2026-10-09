import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInstalledApp extends Document {
   businessId: Types.ObjectId;
   appId: Types.ObjectId;
   appSlug: string;
   installedAt: Date;
   status: "active" | "disabled";
}

const InstalledAppSchema = new Schema<IInstalledApp>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      appId: { type: Schema.Types.ObjectId, ref: "AppListing", required: true },
      appSlug: { type: String, required: true },
      installedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ["active", "disabled"], default: "active" },
   },
   { timestamps: true },
);

InstalledAppSchema.index({ businessId: 1, appSlug: 1 }, { unique: true });

const InstalledApp: Model<IInstalledApp> =
   mongoose.models.InstalledApp ||
   mongoose.model<IInstalledApp>("InstalledApp", InstalledAppSchema);

export default InstalledApp;
