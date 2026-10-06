import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPostAuthor {
   id: Types.ObjectId;
   name: string;
   username: string;
   avatar: string;
   verified: boolean;
   businessId?: Types.ObjectId;
   businessName?: string;
}

export interface IPostMedia {
   type: "image" | "link" | "video";
   url: string;
   title?: string;
   description?: string;
   price?: number;
   isOpen?: boolean;
   rating?: number;
   reviewCount?: number;
}

export interface IPost extends Document {
   author: IPostAuthor;
   forum: string;
   forumId?: Types.ObjectId;
   content: string;
   media?: IPostMedia;
   stats: {
      comments: number;
      likes: number;
      views: number;
      shares: number;
   };
   likedBy: Types.ObjectId[];
   visibility: "public" | "private";
   createdAt: Date;
   updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
   {
      author: {
         id: { type: Schema.Types.ObjectId, ref: "User", required: true },
         name: { type: String, required: true },
         username: { type: String, required: true },
         avatar: { type: String, default: "" },
         verified: { type: Boolean, default: false },
         businessId: { type: Schema.Types.ObjectId, ref: "Business" },
         businessName: { type: String, default: "" },
      },
      forum: { type: String, default: "Public forum" },
      forumId: { type: Schema.Types.ObjectId },
      content: { type: String, required: true, maxlength: 5000 },
      media: {
         type: {
            type: String,
            enum: ["image", "link", "video"],
         },
         url: { type: String, default: "" },
         title: { type: String, default: "" },
         description: { type: String, default: "" },
         price: { type: Number },
         isOpen: { type: Boolean },
         rating: { type: Number },
         reviewCount: { type: Number },
      },
      stats: {
         comments: { type: Number, default: 0 },
         likes: { type: Number, default: 0 },
         views: { type: Number, default: 0 },
         shares: { type: Number, default: 0 },
      },
      likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      visibility: {
         type: String,
         enum: ["public", "private"],
         default: "public",
      },
   },
   { timestamps: true },
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ "author.id": 1 });

const Post: Model<IPost> =
   mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
