import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavedAudience extends Document {
   businessId: Types.ObjectId;
   createdBy: Types.ObjectId;
   name: string;
   description: string;
   countries: string[];
   excludedCountries: string[];
   languages: string[];
   minAge: number;
   maxAge: number;
   interests: string[];
   createdAt: Date;
   updatedAt: Date;
}

const SavedAudienceSchema = new Schema<ISavedAudience>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      description: { type: String, default: "" },
      countries: { type: [String], default: [] },
      excludedCountries: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      minAge: { type: Number, default: 18 },
      maxAge: { type: Number, default: 65 },
      interests: { type: [String], default: [] },
   },
   { timestamps: true },
);

SavedAudienceSchema.index({ businessId: 1, createdAt: -1 });

const SavedAudience: Model<ISavedAudience> =
   mongoose.models.SavedAudience ||
   mongoose.model<ISavedAudience>("SavedAudience", SavedAudienceSchema);

export default SavedAudience;
