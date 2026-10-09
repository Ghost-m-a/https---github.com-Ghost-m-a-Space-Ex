import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILiveEvent extends Document {
   businessId: Types.ObjectId;
   type: "visit" | "signup" | "purchase" | "checkout" | "refund";
   country: string;
   city: string;
   message: string;
   amount?: number;
   createdAt: Date;
}

const LiveEventSchema = new Schema<ILiveEvent>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      type: {
         type: String,
         enum: ["visit", "signup", "purchase", "checkout", "refund"],
         required: true,
      },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      message: { type: String, default: "" },
      amount: { type: Number },
   },
   { timestamps: true },
);

LiveEventSchema.index({ businessId: 1, createdAt: -1 });
// Auto-delete after 24h
LiveEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const LiveEvent: Model<ILiveEvent> =
   mongoose.models.LiveEvent ||
   mongoose.model<ILiveEvent>("LiveEvent", LiveEventSchema);

export default LiveEvent;
