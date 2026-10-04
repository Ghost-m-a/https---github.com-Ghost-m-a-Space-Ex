import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationKind =
   | "mention"
   | "like"
   | "follow"
   | "comment"
   | "system";

export interface INotification extends Document {
   userId: Types.ObjectId;
   kind: NotificationKind;
   title: string;
   body: string;
   href: string;
   read: boolean;
   actorId?: Types.ObjectId;
   createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      kind: {
         type: String,
         enum: ["mention", "like", "follow", "comment", "system"],
         default: "system",
      },
      title: { type: String, required: true },
      body: { type: String, default: "" },
      href: { type: String, default: "" },
      read: { type: Boolean, default: false },
      actorId: { type: Schema.Types.ObjectId, ref: "User" },
   },
   { timestamps: true },
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
   mongoose.models.Notification ||
   mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
