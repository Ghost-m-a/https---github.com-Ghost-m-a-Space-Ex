import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWebsite extends Document {
   businessId: Types.ObjectId;
   domain: string;
   name: string;
   status: "live" | "draft" | "building";
   visits: number;
   pageViews: number;
   checkouts: number;
   conversions: number;
   topPages: { path: string; visits: number }[];
   topSources: { source: string; visits: number }[];
   createdAt: Date;
   updatedAt: Date;
}

const WebsiteSchema = new Schema<IWebsite>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      domain: { type: String, required: true, lowercase: true, trim: true },
      name: { type: String, required: true },
      status: {
         type: String,
         enum: ["live", "draft", "building"],
         default: "draft",
      },
      visits: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      checkouts: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      topPages: [
         {
            path: { type: String, default: "" },
            visits: { type: Number, default: 0 },
         },
      ],
      topSources: [
         {
            source: { type: String, default: "" },
            visits: { type: Number, default: 0 },
         },
      ],
   },
   { timestamps: true },
);

const Website: Model<IWebsite> =
   mongoose.models.Website ||
   mongoose.model<IWebsite>("Website", WebsiteSchema);

export default Website;
