import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialAccount {
   connected: boolean;
   username?: string;
}

export interface IUser extends Document {
   name: string;
   email: string;
   username: string;
   passwordHash: string;
   bio: string;
   dateOfBirth: string;
   location: string;
   avatarUrl: string;
   avatarColor: string;

   privacy: {
      totalEarned: boolean;
      location: boolean;
      ownedWhops: boolean;
      joinedWhops: boolean;
   };

   socialAccounts: {
      x: ISocialAccount;
      instagram: ISocialAccount;
      discord: ISocialAccount;
      telegram: ISocialAccount;
      tradingview: ISocialAccount;
      youtube: ISocialAccount;
      tiktok: ISocialAccount;
      linkedin: ISocialAccount;
   };

   notificationPrefs: {
      popup: boolean;
      sound: boolean;
      activity: {
         aiChatMessage: boolean;
         aiChatQuestion: boolean;
         bountyClaimed: boolean;
         newFollower: boolean;
         paymentFailed: boolean;
         upcomingPaymentReminders: boolean;
         withdrawalStatusChange: boolean;
         transferReceived: boolean;
      };
   };

   twoFactor: {
      enabled: boolean;
      method: "authenticator" | "sms" | null;
   };

   wallet: {
      address: string;
      balance: number;
      exported: boolean;
   };

   verification: {
      individual: "none" | "pending" | "verified";
      business: "none" | "pending" | "verified";
      payouts: "inactive" | "active";
      bankDeposits: "inactive" | "active";
   };

   createdAt: Date;
   updatedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
   { connected: { type: Boolean, default: false }, username: String },
   { _id: false },
);

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
      username: {
         type: String,
         trim: true,
         lowercase: true,
         sparse: true,
         unique: true,
         maxlength: 30,
      },
      passwordHash: { type: String, required: true },
      bio: { type: String, default: "", maxlength: 500 },
      dateOfBirth: { type: String, default: "" },
      location: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      avatarColor: { type: String, default: "#3b82f6" },

      privacy: {
         totalEarned: { type: Boolean, default: true },
         location: { type: Boolean, default: true },
         ownedWhops: { type: Boolean, default: true },
         joinedWhops: { type: Boolean, default: true },
      },

      socialAccounts: {
         x: { type: SocialAccountSchema, default: () => ({}) },
         instagram: { type: SocialAccountSchema, default: () => ({}) },
         discord: { type: SocialAccountSchema, default: () => ({}) },
         telegram: { type: SocialAccountSchema, default: () => ({}) },
         tradingview: { type: SocialAccountSchema, default: () => ({}) },
         youtube: { type: SocialAccountSchema, default: () => ({}) },
         tiktok: { type: SocialAccountSchema, default: () => ({}) },
         linkedin: { type: SocialAccountSchema, default: () => ({}) },
      },

      notificationPrefs: {
         popup: { type: Boolean, default: true },
         sound: { type: Boolean, default: true },
         activity: {
            aiChatMessage: { type: Boolean, default: true },
            aiChatQuestion: { type: Boolean, default: true },
            bountyClaimed: { type: Boolean, default: true },
            newFollower: { type: Boolean, default: true },
            paymentFailed: { type: Boolean, default: true },
            upcomingPaymentReminders: { type: Boolean, default: true },
            withdrawalStatusChange: { type: Boolean, default: true },
            transferReceived: { type: Boolean, default: true },
         },
      },

      twoFactor: {
         enabled: { type: Boolean, default: false },
         method: {
            type: String,
            enum: ["authenticator", "sms", null],
            default: null,
         },
      },

      wallet: {
         address: { type: String, default: "" },
         balance: { type: Number, default: 0 },
         exported: { type: Boolean, default: false },
      },

      verification: {
         individual: {
            type: String,
            enum: ["none", "pending", "verified"],
            default: "none",
         },
         business: {
            type: String,
            enum: ["none", "pending", "verified"],
            default: "none",
         },
         payouts: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
         },
         bankDeposits: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
         },
      },
   },
   { timestamps: true },
);

const User: Model<IUser> =
   mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
