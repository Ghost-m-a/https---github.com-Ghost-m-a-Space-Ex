import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IResolutionCase extends Document {
   userId: Types.ObjectId;
   product: string;
   amount: number;
   dueDate: string;
   status: "open" | "resolved" | "closed";
   description: string;
   createdAt: Date;
}

const ResolutionCaseSchema = new Schema<IResolutionCase>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      product: { type: String, required: true },
      amount: { type: Number, default: 0 },
      dueDate: { type: String, default: "" },
      status: {
         type: String,
         enum: ["open", "resolved", "closed"],
         default: "open",
      },
      description: { type: String, default: "" },
   },
   { timestamps: true },
);

const ResolutionCase: Model<IResolutionCase> =
   mongoose.models.ResolutionCase ||
   mongoose.model<IResolutionCase>("ResolutionCase", ResolutionCaseSchema);

export default ResolutionCase;
