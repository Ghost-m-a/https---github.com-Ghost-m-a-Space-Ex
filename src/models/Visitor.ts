import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVisitor extends Document {
   businessId: Types.ObjectId;
   userId?: Types.ObjectId;
   email: string;
   name: string;
   username: string;
   avatar: string;
   location: string;
   source:
      | "Direct"
      | "Google"
      | "Twitter"
      | "Instagram"
      | "TikTok"
      | "YouTube"
      | "Referral"
      | "Ads";
   utmSource: string;
   eventType: string;
   country: string;
   totalSpend: number;
   purchases: number;
   events: number;
   lastSeen: Date;
   createdAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      email: { type: String, default: "" },
      name: { type: String, required: true },
      username: { type: String, default: "member" },
      avatar: { type: String, default: "" },
      location: { type: String, default: "" },
      source: {
         type: String,
         enum: [
            "Direct",
            "Google",
            "Twitter",
            "Instagram",
            "TikTok",
            "YouTube",
            "Referral",
            "Ads",
         ],
         default: "Direct",
      },
      utmSource: { type: String, default: "" },
      eventType: { type: String, default: "" },
      country: { type: String, default: "" },
      totalSpend: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      lastSeen: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

VisitorSchema.index({ businessId: 1, lastSeen: -1 });

const Visitor: Model<IVisitor> =
   mongoose.models.Visitor ||
   mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
