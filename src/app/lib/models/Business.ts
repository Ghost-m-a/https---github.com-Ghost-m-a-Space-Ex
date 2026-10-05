import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBusiness extends Document {
   userId: Types.ObjectId;
   name: string;
   initial: string;
   description: string;
   type: string;
   revenue: string;
   migrateFrom: string;
   website: string;
   logoUrl: string;
   industry: {
      businessType: string;
      industryGroup: string;
      industryType: string;
   };

   analyticsPixels: {
      spaceExPixel: boolean;
      googleAnalytics: boolean;
      hyros: boolean;
      meta: boolean;
      tiktok: boolean;
      x: boolean;
      reddit: boolean;
      pinterest: boolean;
      hubspot: boolean;
   };

   notificationPrefs: {
      cardEmails: boolean;
      disputes: boolean;
      failedAdsPayment: boolean;
      joins: boolean;
      payments: boolean;
      paymentsReview: boolean;
      resolutionCenter: boolean;
      supportAllMessages: boolean;
      supportMentionsOnly: boolean;
      waitlists: boolean;
      withdrawals: boolean;
   };

   checkout: {
      paymentOrchestration: boolean;
      successRedirectUrl: string;
      customStatementDescriptor: string;
      appleGooglePayEmbedded: boolean;
      shareDomainsWithConnect: boolean;
      collectPhoneAtCheckout: boolean;
      keepAccessWhilePastDue: boolean;
      cancelSubsAfterFailedPayments: boolean;
      sendTransactionalEmails: boolean;
   };

   checkoutBranding: {
      backgroundColor: string;
      buttonColor: string;
      font: string;
      borderStyle: string;
      previewTheme: "light" | "dark";
   };

   payments: {
      applyForFinancing: boolean;
      maxPrice: number;
      threeDSecure: "mandate" | "if_required" | "frictionless";
      paypalEnabled: boolean;
      disputeFighter: boolean;
      autoRefundBNPL: boolean;
      autoRefundCardBelow: number;
      autoRefundPaypalBelow: number;
      autoRefundMessage: string;
      earlyDisputeAlertBelow: number;
   };

   verification: {
      individual: "none" | "pending" | "verified";
      business: "none" | "pending" | "verified";
      payouts: "inactive" | "active";
      spaceExCard: "inactive" | "active";
      bankDeposits: "inactive" | "active";
      financing: "inactive" | "active";
   };

   invoices: {
      customPrefixEnabled: boolean;
      customPrefix: string;
   };

   legal: {
      termsUrl: string;
      privacyUrl: string;
      returnUrl: string;
      eulaUrl: string;
      requireTermsAcceptance: boolean;
      vatOrTaxId: string;
      supportAddress: string;
      supportName: string;
      supportEmail: string;
   };

   tax: {
      taxCollectionMode: "spaceex_collects" | "self_collects";
      businessAddress: string;
      taxRegistrations: { idType: string; value: string }[];
      taxType: "inclusive" | "exclusive";
      collectVatFromUsers: boolean;
   };

   openGraph: {
      imageUrl: string;
      useLogoAsFallback: boolean;
      mediaUrl: string;
   };

   homePreferences: {
      hideMemberCount: boolean;
      hideMembersCard: boolean;
   };

   createdAt: Date;
   updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      name: { type: String, required: true, trim: true, maxlength: 150 },
      initial: { type: String, required: true, maxlength: 2 },
      description: { type: String, default: "", maxlength: 400 },
      type: { type: String, default: "" },
      revenue: { type: String, default: "" },
      migrateFrom: { type: String, default: "" },
      website: { type: String, default: "" },
      logoUrl: { type: String, default: "" },

      industry: {
         businessType: { type: String, default: "Other" },
         industryGroup: { type: String, default: "Miscellaneous" },
         industryType: { type: String, default: "Other general" },
      },

      analyticsPixels: {
         spaceExPixel: { type: Boolean, default: false },
         googleAnalytics: { type: Boolean, default: false },
         hyros: { type: Boolean, default: false },
         meta: { type: Boolean, default: false },
         tiktok: { type: Boolean, default: false },
         x: { type: Boolean, default: false },
         reddit: { type: Boolean, default: false },
         pinterest: { type: Boolean, default: false },
         hubspot: { type: Boolean, default: false },
      },

      notificationPrefs: {
         cardEmails: { type: Boolean, default: true },
         disputes: { type: Boolean, default: true },
         failedAdsPayment: { type: Boolean, default: true },
         joins: { type: Boolean, default: true },
         payments: { type: Boolean, default: true },
         paymentsReview: { type: Boolean, default: true },
         resolutionCenter: { type: Boolean, default: true },
         supportAllMessages: { type: Boolean, default: true },
         supportMentionsOnly: { type: Boolean, default: false },
         waitlists: { type: Boolean, default: true },
         withdrawals: { type: Boolean, default: true },
      },

      checkout: {
         paymentOrchestration: { type: Boolean, default: true },
         successRedirectUrl: { type: String, default: "" },
         customStatementDescriptor: { type: String, default: "" },
         appleGooglePayEmbedded: { type: Boolean, default: false },
         shareDomainsWithConnect: { type: Boolean, default: false },
         collectPhoneAtCheckout: { type: Boolean, default: false },
         keepAccessWhilePastDue: { type: Boolean, default: false },
         cancelSubsAfterFailedPayments: { type: Boolean, default: true },
         sendTransactionalEmails: { type: Boolean, default: true },
      },

      checkoutBranding: {
         backgroundColor: { type: String, default: "#000000" },
         buttonColor: { type: String, default: "#ffffff" },
         font: { type: String, default: "system" },
         borderStyle: { type: String, default: "rounded" },
         previewTheme: {
            type: String,
            enum: ["light", "dark"],
            default: "dark",
         },
      },

      payments: {
         applyForFinancing: { type: Boolean, default: false },
         maxPrice: { type: Number, default: 2500 },
         threeDSecure: {
            type: String,
            enum: ["mandate", "if_required", "frictionless"],
            default: "frictionless",
         },
         paypalEnabled: { type: Boolean, default: false },
         disputeFighter: { type: Boolean, default: true },
         autoRefundBNPL: { type: Boolean, default: true },
         autoRefundCardBelow: { type: Number, default: 0 },
         autoRefundPaypalBelow: { type: Number, default: 0 },
         autoRefundMessage: {
            type: String,
            default: "Sorry you had a bad experience. Here's a refund.",
         },
         earlyDisputeAlertBelow: { type: Number, default: 500 },
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
         spaceExCard: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
         },
         bankDeposits: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
         },
         financing: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
         },
      },

      invoices: {
         customPrefixEnabled: { type: Boolean, default: false },
         customPrefix: { type: String, default: "" },
      },

      legal: {
         termsUrl: { type: String, default: "" },
         privacyUrl: { type: String, default: "" },
         returnUrl: { type: String, default: "" },
         eulaUrl: { type: String, default: "" },
         requireTermsAcceptance: { type: Boolean, default: false },
         vatOrTaxId: { type: String, default: "" },
         supportAddress: { type: String, default: "" },
         supportName: { type: String, default: "" },
         supportEmail: { type: String, default: "" },
      },

      tax: {
         taxCollectionMode: {
            type: String,
            enum: ["spaceex_collects", "self_collects"],
            default: "spaceex_collects",
         },
         businessAddress: { type: String, default: "" },
         taxRegistrations: [
            {
               idType: { type: String, default: "" },
               value: { type: String, default: "" },
            },
         ],
         taxType: {
            type: String,
            enum: ["inclusive", "exclusive"],
            default: "exclusive",
         },
         collectVatFromUsers: { type: Boolean, default: false },
      },

      openGraph: {
         imageUrl: { type: String, default: "" },
         useLogoAsFallback: { type: Boolean, default: false },
         mediaUrl: { type: String, default: "" },
      },

      homePreferences: {
         hideMemberCount: { type: Boolean, default: false },
         hideMembersCard: { type: Boolean, default: false },
      },
   },
   { timestamps: true },
);

const Business: Model<IBusiness> =
   mongoose.models.Business ||
   mongoose.model<IBusiness>("Business", BusinessSchema);

export default Business;
