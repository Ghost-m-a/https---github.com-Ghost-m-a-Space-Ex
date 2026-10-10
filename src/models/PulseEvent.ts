import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PulseKind =
   | "sale"
   | "signup"
   | "join"
   | "payout"
   | "post"
   | "follow";

export interface IPulseEvent extends Document {
   kind: PulseKind;
   actorId?: Types.ObjectId;
   actorName: string;
   actorAvatar: string;
   businessId?: Types.ObjectId;
   businessName?: string;
   amount?: number;
   message: string;
   location?: string;
   countryCode?: string;
   createdAt: Date;
}

const PulseEventSchema = new Schema<IPulseEvent>(
   {
      kind: {
         type: String,
         enum: ["sale", "signup", "join", "payout", "post", "follow"],
         required: true,
         index: true,
      },
      actorId: { type: Schema.Types.ObjectId, ref: "User" },
      actorName: { type: String, required: true },
      actorAvatar: { type: String, default: "" },
      businessId: { type: Schema.Types.ObjectId, ref: "Business" },
      businessName: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      message: { type: String, required: true },
      location: { type: String, default: "" },
      countryCode: { type: String, default: "" },
   },
   { timestamps: { createdAt: true, updatedAt: false } },
);

PulseEventSchema.index({ createdAt: -1 });

const PulseEvent: Model<IPulseEvent> =
   mongoose.models.PulseEvent ||
   mongoose.model<IPulseEvent>("PulseEvent", PulseEventSchema);

export default PulseEvent;
