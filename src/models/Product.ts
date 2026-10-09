import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AccessType = "free" | "paid";
export type PricingType = "one-time" | "recurring";
export type Visibility = "visible" | "hidden" | "archived";
export type DiscoverStatus = "listed" | "unlisted";
export type IncludedApp =
   | "forums"
   | "chat"
   | "courses"
   | "content"
   | "livestreaming"
   | "events";

export interface IProductFAQ {
   question: string;
   answer: string;
}

export interface IProduct extends Document {
   businessId: Types.ObjectId;
   name: string;
   slug: string;
   headline: string;
   description: string;
   bannerImage: string;
   productImage: string;

   labels: string[];
   collectShippingAddress: boolean;

   accessType: AccessType;
   pricingType: PricingType;
   price: number;
   currency: string;
   recurringInterval: "monthly" | "yearly" | "";

   launchAsWaitlist: boolean;
   askQuestionsBeforeCheckout: boolean;

   includedApps: IncludedApp[];
   faqs: IProductFAQ[];

   appearanceColor: string;

   growthTools: {
      showMemberCount: boolean;
   };

   productSettings: {
      purchaseButtonText: string;
      productTaxCode: string;
      productUrl: string;
      addAffiliateRate: boolean;
      affiliateRate: number;
      checkoutRedirect: boolean;
      checkoutRedirectUrl: string;
      visibleOnStorePage: boolean;
   };

   visibility: Visibility;
   discoverStatus: DiscoverStatus;

   stats: {
      allTimeRevenue: number;
      activeUsers: number;
      checkoutConversion: number;
      totalSales: number;
   };

   createdAt: Date;
   updatedAt: Date;
}

const FAQSchema = new Schema<IProductFAQ>(
   {
      question: { type: String, required: true, maxlength: 200 },
      answer: { type: String, default: "", maxlength: 1000 },
   },
   { _id: false },
);

const ProductSchema = new Schema<IProduct>(
   {
      businessId: {
         type: Schema.Types.ObjectId,
         ref: "Business",
         required: true,
         index: true,
      },
      name: { type: String, required: true, trim: true, maxlength: 80 },
      slug: {
         type: String,
         required: true,
         lowercase: true,
         trim: true,
         index: true,
      },
      headline: { type: String, default: "", maxlength: 200 },
      description: { type: String, default: "", maxlength: 1000 },
      bannerImage: { type: String, default: "" },
      productImage: { type: String, default: "" },

      // ✅ Defaults so missing data never crashes the UI
      labels: {
         type: [{ type: String, trim: true, maxlength: 20 }],
         default: [],
      },
      collectShippingAddress: { type: Boolean, default: false },

      accessType: {
         type: String,
         enum: ["free", "paid"],
         default: "free",
      },
      pricingType: {
         type: String,
         enum: ["one-time", "recurring"],
         default: "one-time",
      },
      price: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "USD" },
      recurringInterval: {
         type: String,
         enum: ["monthly", "yearly", ""],
         default: "",
      },

      launchAsWaitlist: { type: Boolean, default: false },
      askQuestionsBeforeCheckout: { type: Boolean, default: false },

      // ✅ Default to empty array
      includedApps: {
         type: [
            {
               type: String,
               enum: [
                  "forums",
                  "chat",
                  "courses",
                  "content",
                  "livestreaming",
                  "events",
               ],
            },
         ],
         default: [],
      },
      faqs: {
         type: [FAQSchema],
         default: [],
      },

      appearanceColor: { type: String, default: "#3b82f6" },

      growthTools: {
         showMemberCount: { type: Boolean, default: true },
      },

      productSettings: {
         purchaseButtonText: { type: String, default: "Join" },
         productTaxCode: { type: String, default: "" },
         productUrl: { type: String, default: "" },
         addAffiliateRate: { type: Boolean, default: true },
         affiliateRate: { type: Number, default: 30, min: 0, max: 100 },
         checkoutRedirect: { type: Boolean, default: false },
         checkoutRedirectUrl: { type: String, default: "" },
         visibleOnStorePage: { type: Boolean, default: true },
      },

      visibility: {
         type: String,
         enum: ["visible", "hidden", "archived"],
         default: "visible",
      },
      discoverStatus: {
         type: String,
         enum: ["listed", "unlisted"],
         default: "unlisted",
      },

      stats: {
         allTimeRevenue: { type: Number, default: 0 },
         activeUsers: { type: Number, default: 0 },
         checkoutConversion: { type: Number, default: 0 },
         totalSales: { type: Number, default: 0 },
      },
   },
   { timestamps: true },
);

ProductSchema.index({ businessId: 1, createdAt: -1 });
ProductSchema.index({ businessId: 1, slug: 1 }, { unique: true });

const Product: Model<IProduct> =
   mongoose.models.Product ||
   mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
