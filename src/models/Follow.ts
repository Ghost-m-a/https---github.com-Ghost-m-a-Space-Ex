import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFollow extends Document {
   followerId: Types.ObjectId;
   followingId: Types.ObjectId;
   createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
   {
      followerId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      followingId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
   },
   { timestamps: true },
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow: Model<IFollow> =
   mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
