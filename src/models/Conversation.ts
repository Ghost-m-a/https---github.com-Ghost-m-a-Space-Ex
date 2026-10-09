import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConversation extends Document {
   participants: Types.ObjectId[];
   lastMessage: string;
   lastMessageAt: Date;
   unreadCounts: Map<string, number>;
   isRequest: boolean;
   createdAt: Date;
   updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
   {
      participants: [
         { type: Schema.Types.ObjectId, ref: "User", required: true },
      ],
      lastMessage: { type: String, default: "" },
      lastMessageAt: { type: Date, default: Date.now },
      unreadCounts: { type: Map, of: Number, default: {} },
      isRequest: { type: Boolean, default: false },
   },
   { timestamps: true },
);

ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation: Model<IConversation> =
   mongoose.models.Conversation ||
   mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
