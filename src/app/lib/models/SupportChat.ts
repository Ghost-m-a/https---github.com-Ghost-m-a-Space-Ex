import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISupportMessage {
   senderId: Types.ObjectId;
   senderName: string;
   senderRole: "member" | "admin";
   text: string;
   createdAt: Date;
}

export interface ISupportChat extends Document {
   businessId: Types.ObjectId;
   memberId: Types.ObjectId;
   memberName: string;
   memberEmail: string;
   memberAvatar: string;
   lastMessage: string;
   lastMessageAt: Date;
   unreadForAdmin: number;
   status: "open" | "closed";
   messages: ISupportMessage[];
   createdAt: Date;
}

const MessageSchema = new Schema<ISupportMessage>(
   {
      senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      senderName: { type: String, required: true },
      senderRole: {
         type: String,
         enum: ["member", "admin"],
         default: "member",
      },
      text: { type: String, required: true, maxlength: 5000 },
      createdAt: { type: Date, default: Date.now },
   },
   { _id: false },
);

const SupportChatSchema = new Schema<ISupportChat>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      memberName: { type: String, required: true },
      memberEmail: { type: String, default: "" },
      memberAvatar: { type: String, default: "" },
      lastMessage: { type: String, default: "" },
      lastMessageAt: { type: Date, default: Date.now },
      unreadForAdmin: { type: Number, default: 0 },
      status: { type: String, enum: ["open", "closed"], default: "open" },
      messages: { type: [MessageSchema], default: [] },
   },
   { timestamps: true },
);

SupportChatSchema.index({ businessId: 1, lastMessageAt: -1 });

const SupportChat: Model<ISupportChat> =
   mongoose.models.SupportChat ||
   mongoose.model<ISupportChat>("SupportChat", SupportChatSchema);

export default SupportChat;
