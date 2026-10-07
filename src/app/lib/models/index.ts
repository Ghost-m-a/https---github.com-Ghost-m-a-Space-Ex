// =========================================
// MODELS — Barrel Export
// Import everything from "@/app/lib/models"
// =========================================

// ============ CORE ============
export { default as User } from "./User";
export type { IUser, ISocialAccount } from "./User";

export { default as Business } from "./Business";
export type { IBusiness } from "./Business";

export { default as Product } from "./Product";
export type {
   IProduct,
   IProductFAQ,
   AccessType,
   PricingType,
   Visibility,
   DiscoverStatus,
   IncludedApp,
} from "./Product";

// ============ MESSAGING ============
export { default as Conversation } from "./Conversation";
export type { IConversation } from "./Conversation";

export { default as Message } from "./Message";
export type { IMessage } from "./Message";

export { default as Notification } from "./Notification";
export type { INotification, NotificationKind } from "./Notification";

// ============ SOCIAL ============
export { default as Post } from "./Post";
export type { IPost, IPostAuthor, IPostMedia } from "./Post";

export { default as Follow } from "./Follow";
export type { IFollow } from "./Follow";

// ============ PAYMENTS & TRANSACTIONS ============
export { default as Payment } from "./Payment";
export type {
   IPayment,
   PaymentStatus,
   PaymentMethod as PaymentMethodType,
} from "./Payment";

export { default as Transaction } from "./Transaction";
export type { ITransaction, TransactionKind } from "./Transaction";

export { default as PaymentMethod } from "./PaymentMethod";
export type { IPaymentMethod } from "./PaymentMethod";

export { default as CheckoutLink } from "./CheckoutLink";
export type {
   ICheckoutLink,
   ICheckoutBranding,
   CheckoutPricingType,
} from "./CheckoutLink";

// ============ CUSTOMERS & MEMBERSHIPS ============
export { default as Customer } from "./Customer";
export type { ICustomer } from "./Customer";

export { default as Membership } from "./Membership";
export type { IMembership } from "./Membership";

export { default as Visitor } from "./Visitor";
export type { IVisitor } from "./Visitor";

// ============ ORDERS & RESOLUTIONS ============
export { default as Order } from "./Order";
export type { IOrder } from "./Order";

export { default as ResolutionCase } from "./ResolutionCase";
export type { IResolutionCase } from "./ResolutionCase";

// ============ TEAM & PARTNERS ============
export { default as TeamInvite } from "./TeamInvite";
export type { ITeamInvite } from "./TeamInvite";

export { default as PartnerRequest } from "./PartnerRequest";
export type { IPartnerRequest } from "./PartnerRequest";

// ============ WEBSITES & ANALYTICS ============
export { default as Website } from "./Website";
export type { IWebsite } from "./Website";

export { default as LiveEvent } from "./LiveEvent";
export type { ILiveEvent } from "./LiveEvent";

// ============ ADS ============
export { default as AdCampaign } from "./AdCampaign";
export type {
   IAdCampaign,
   Platform as AdPlatform,
   Objective as AdObjective,
   CampaignStatus as AdCampaignStatus,
   BudgetControl as AdBudgetControl,
   BidStrategy as AdBidStrategy,
   SpecialCategory as AdSpecialCategory,
   ConversionLocation as AdConversionLocation,
} from "./AdCampaign";

export { default as AdSettings } from "./AdSettings";
export type { IAdSettings } from "./AdSettings";

// ============ CAMPAIGNS (Content Rewards) ============
export { default as Campaign } from "./Campaign";
export type { ICampaign, IPlatformRate, CampaignPlatform } from "./Campaign";

export { default as CampaignContribution } from "./CampaignContribution";
export type { ICampaignContribution } from "./CampaignContribution";

export { default as CampaignSubmission } from "./CampaignSubmission";
export type { ICampaignSubmission } from "./CampaignSubmission";

// ============ AFFILIATES ============
export { default as Affiliate } from "./Affiliate";
export type { IAffiliate } from "./Affiliate";

export { default as AffiliateSignup } from "./AffiliateSignup";
export type { IAffiliateSignup } from "./AffiliateSignup";

export { default as RevenueSharePartner } from "./RevenueSharePartner";
export type { IRevenueSharePartner } from "./RevenueSharePartner";

export { default as AffiliateSettings } from "./AffiliateSettings";
export type { IAffiliateSettings } from "./AffiliateSettings";

// ============ SUPPORT ============
export { default as SupportChat } from "./SupportChat";
export type { ISupportChat, ISupportMessage } from "./SupportChat";

// ============ INVOICES ============
export { default as Invoice } from "./Invoice";
export type { IInvoice, IInvoiceLineItem } from "./Invoice";

// ============ PROMO CODES ============
export { default as PromoCode } from "./PromoCode";
export type { IPromoCode } from "./PromoCode";

// ============ TEAM ============
export { default as TeamMember } from "./TeamMember";
export type { ITeamMember } from "./TeamMember";

// ============ SUB ACCOUNTS ============
export { default as SubAccount } from "./SubAccount";
export type { ISubAccount } from "./SubAccount";

// ============ APP STORE ============
export { default as AppListing } from "./AppListing";
export type { IAppListing } from "./AppListing";

export { default as InstalledApp } from "./InstalledApp";
export type { IInstalledApp } from "./InstalledApp";

// ============ DISCOVER (legacy — kept for backwards compat) ============
export { default as DiscoverCampaign } from "./DiscoverCampaign";
export type { IDiscoverCampaign, SocialPlatform } from "./DiscoverCampaign";
