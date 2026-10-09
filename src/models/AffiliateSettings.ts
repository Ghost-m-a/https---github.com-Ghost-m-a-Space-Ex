import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAffiliateSettings extends Document {
   businessId: Types.ObjectId;
   defaultCommission: number;
   portalLink: string;
   waitlistEnabled: boolean;
   defaultProductCommission: number;
   createdAt: Date;
   updatedAt: Date;
}

const AffiliateSettingsSchema = new Schema<IAffiliateSettings>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         unique: true,
         index: true,
      },
      defaultCommission: { type: Number, default: 30, min: 0, max: 100 },
      portalLink: { type: String, default: "" },
      waitlistEnabled: { type: Boolean, default: false },
      defaultProductCommission: { type: Number, default: 30 },
   },
   { timestamps: true },
);

const AffiliateSettings: Model<IAffiliateSettings> =
   mongoose.models.AffiliateSettings ||
   mongoose.model<IAffiliateSettings>(
      "AffiliateSettings",
      AffiliateSettingsSchema,
   );

export default AffiliateSettings;
