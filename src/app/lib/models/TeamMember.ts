import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITeamMember extends Document {
   businessId: Types.ObjectId;
   userId: Types.ObjectId;
   name: string;
   email: string;
   avatar: string;
   role: "owner" | "admin" | "manager" | "support" | "viewer";
   auth: "one-step" | "2fa_required";
   pay: "pay" | "unpaid";
   status: "active" | "invited" | "inactive";
   addedAt: Date;
   createdAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      avatar: { type: String, default: "" },
      role: {
         type: String,
         enum: ["owner", "admin", "manager", "support", "viewer"],
         default: "viewer",
      },
      auth: {
         type: String,
         enum: ["one-step", "2fa_required"],
         default: "one-step",
      },
      pay: { type: String, enum: ["pay", "unpaid"], default: "unpaid" },
      status: {
         type: String,
         enum: ["active", "invited", "inactive"],
         default: "active",
      },
      addedAt: { type: Date, default: Date.now },
   },
   { timestamps: true },
);

TeamMemberSchema.index({ businessId: 1, userId: 1 }, { unique: true });

const TeamMember: Model<ITeamMember> =
   mongoose.models.TeamMember ||
   mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

export default TeamMember;
