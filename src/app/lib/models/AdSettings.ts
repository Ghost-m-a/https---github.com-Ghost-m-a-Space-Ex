import mongoose, { Schema, Document, Model, Types } from "mongoose";

// =========================================
// TYPES
// =========================================
export interface IAdSettings extends Document {
   businessId: Types.ObjectId;
   reportingCurrency: string;
   accountTimezone: string;
   prescriptionDrugCertified: boolean;
   customerLists: { id: string; name: string; size: number }[];
   engagementAudiences: { id: string; name: string; source: string }[];
   lookalikeAudiences: { id: string; name: string; size: number }[];
   tripleWhaleApiKey: string;
   shopDomain: string;
   metaFacebookPage: string;
   metaInstagramAccount: string;
   metaPixelId: string;
   createdAt: Date;
   updatedAt: Date;
}

// =========================================
// SCHEMA
// =========================================
const AdSettingsSchema = new Schema<IAdSettings>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         unique: true,
         index: true,
      },
      reportingCurrency: { type: String, default: "USD" },
      accountTimezone: { type: String, default: "America/New_York" },
      prescriptionDrugCertified: { type: Boolean, default: false },
      customerLists: [
         {
            id: { type: String, default: "" },
            name: { type: String, default: "" },
            size: { type: Number, default: 0 },
         },
      ],
      engagementAudiences: [
         {
            id: { type: String, default: "" },
            name: { type: String, default: "" },
            source: { type: String, default: "" },
         },
      ],
      lookalikeAudiences: [
         {
            id: { type: String, default: "" },
            name: { type: String, default: "" },
            size: { type: Number, default: 0 },
         },
      ],
      tripleWhaleApiKey: { type: String, default: "" },
      shopDomain: { type: String, default: "" },
      metaFacebookPage: { type: String, default: "" },
      metaInstagramAccount: { type: String, default: "" },
      metaPixelId: { type: String, default: "" },
   },
   { timestamps: true },
);

// =========================================
// MODEL
// =========================================
const AdSettings: Model<IAdSettings> =
   mongoose.models.AdSettings ||
   mongoose.model<IAdSettings>("AdSettings", AdSettingsSchema);

export default AdSettings;
