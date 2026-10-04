import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBusiness extends Document {
   userId: Types.ObjectId;
   name: string;
   initial: string;
   type: string;
   revenue: string;
   migrateFrom: string;
   website: string;
   createdAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      name: { type: String, required: true, trim: true, maxlength: 100 },
      initial: { type: String, required: true, maxlength: 2 },
      type: { type: String, default: "" },
      revenue: { type: String, default: "" },
      migrateFrom: { type: String, default: "" },
      website: { type: String, default: "" },
   },
   { timestamps: true },
);

const Business: Model<IBusiness> =
   mongoose.models.Business ||
   mongoose.model<IBusiness>("Business", BusinessSchema);

export default Business;
