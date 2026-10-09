import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
   conversationId: Types.ObjectId;
   senderId: Types.ObjectId;
   text: string;
   readAt: Date | null;
   createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
   {
      conversationId: {
         type: Schema.Types.ObjectId,
         ref: "Conversation",
         required: true,
         index: true,
      },
      senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      text: { type: String, required: true, maxlength: 5000 },
      readAt: { type: Date, default: null },
   },
   { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> =
   mongoose.models.Message ||
   mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
