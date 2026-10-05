import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITeamInvite extends Document {
   userId: Types.ObjectId;
   companyName: string;
   companyAvatar: string;
   invitedBy: string;
   role: string;
   status: "pending" | "accepted" | "declined";
   createdAt: Date;
}

const TeamInviteSchema = new Schema<ITeamInvite>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      companyName: { type: String, required: true },
      companyAvatar: { type: String, default: "" },
      invitedBy: { type: String, default: "" },
      role: { type: String, default: "Member" },
      status: {
         type: String,
         enum: ["pending", "accepted", "declined"],
         default: "pending",
      },
   },
   { timestamps: true },
);

const TeamInvite: Model<ITeamInvite> =
   mongoose.models.TeamInvite ||
   mongoose.model<ITeamInvite>("TeamInvite", TeamInviteSchema);

export default TeamInvite;
