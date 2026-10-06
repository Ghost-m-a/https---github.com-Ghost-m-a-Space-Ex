import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAppListing extends Document {
   slug: string;
   name: string;
   tagline: string;
   description: string;
   category: string;
   iconColor: string;
   iconEmoji: string;
   price: number;
   rating: number;
   reviewCount: number;
   installs: number;
   installsRange: string;
   tags: string[];
   createdAt: Date;
}

const AppListingSchema = new Schema<IAppListing>(
   {
      slug: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      tagline: { type: String, required: true },
      description: { type: String, default: "" },
      category: { type: String, required: true, index: true },
      iconColor: { type: String, default: "#3b82f6" },
      iconEmoji: { type: String, default: "📦" },
      price: { type: Number, default: 0 },
      rating: { type: Number, default: 4.5 },
      reviewCount: { type: Number, default: 0 },
      installs: { type: Number, default: 0 },
      installsRange: { type: String, default: "1k+" },
      tags: { type: [String], default: [] },
   },
   { timestamps: true },
);

const AppListing: Model<IAppListing> =
   mongoose.models.AppListing ||
   mongoose.model<IAppListing>("AppListing", AppListingSchema);

export default AppListing;
