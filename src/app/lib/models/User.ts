import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
   name: string;
   email: string;
   passwordHash: string;
   avatarColor: string;
   createdAt: Date;
   updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
   {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         index: true,
      },
      passwordHash: { type: String, required: true },
      avatarColor: { type: String, default: "#3b82f6" },
   },
   { timestamps: true },
);

const User: Model<IUser> =
   mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
