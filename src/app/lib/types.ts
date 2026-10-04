export interface Conversation {
   id: string;
   name: string;
   avatar: string;
   verified: boolean;
   lastMessage: string;
   timestamp: string;
   unread: number;
   messages: Message[];
}

export interface Message {
   id: string;
   sender: "me" | "them";
   text: string;
   timestamp: string;
   avatar?: string;
}

export interface Post {
   id: string;
   author: {
      name: string;
      handle: string;
      avatar: string;
      verified: boolean;
   };
   forum: string;
   content: string;
   image?: string;
   price?: number;
   isOpen?: boolean;
   stats: { comments: number; likes: number; views: number };
   timestamp: string;
}

export interface PopularUser {
   id: string;
   name: string;
   avatar: string;
   bio: string;
   followers: number;
   isFollowing: boolean;
}

export interface Referral {
   id: string;
   business: string;
   volume: number;
   earnings: number;
   referredUser: string;
   joinedOn: string;
}

export interface AffiliateProduct {
   id: string;
   name: string;
   category: string;
   commission: number;
   epc: number;
   image: string;
}

export interface DiscoveredBusiness {
   id: string;
   name: string;
   description: string;
   image: string;
   rating: number;
   users: number;
   views: number;
   launchedAgo: string;
   verified: boolean;
}

export interface HomeStats {
   totalBalance: number;
   chartData: { date: string; value: number }[];
   pulse: { id: string; text: string; timestamp: string }[];
}
// =========================================
// BUSINESS TYPES
// =========================================

export interface BusinessAnalytics {
   totalRevenue: number;
   revenueChange: number;
   totalOrders: number;
   ordersChange: number;
   conversionRate: number;
   conversionChange: number;
   activeSubscriptions: number;
   chartData: { date: string; revenue: number; orders: number }[];
}

export interface BusinessProduct {
   id: string;
   name: string;
   description: string;
   price: number;
   type: "one-time" | "subscription" | "renewal";
   status: "active" | "draft" | "archived";
   sales: number;
   revenue: number;
   image: string;
}

export interface BusinessPayment {
   id: string;
   customer: string;
   product: string;
   amount: number;
   status: "succeeded" | "pending" | "failed" | "refunded";
   method: string;
   date: string;
}

export interface BusinessCustomer {
   id: string;
   name: string;
   email: string;
   avatar: string;
   spent: number;
   orders: number;
   joinedOn: string;
   status: "active" | "churned" | "trial";
}

export interface BusinessWebsite {
   id: string;
   domain: string;
   name: string;
   visits: number;
   conversion: number;
   status: "live" | "draft" | "building";
}

export interface BusinessAd {
   id: string;
   name: string;
   platform: "meta" | "tiktok" | "google" | "youtube";
   spend: number;
   impressions: number;
   clicks: number;
   conversions: number;
   cpc: number;
   roas: number;
   status: "active" | "paused" | "ended";
}

export interface WorkforceMember {
   id: string;
   name: string;
   role: string;
   avatar: string;
   email: string;
   status: "active" | "invited" | "inactive";
   joinedOn: string;
}

export interface BusinessCard {
   id: string;
   last4: string;
   brand: string;
   holder: string;
   expiry: string;
   balance: number;
   status: "active" | "frozen";
}

export interface SupportTicket {
   id: string;
   subject: string;
   customer: string;
   priority: "low" | "medium" | "high";
   status: "open" | "pending" | "resolved";
   createdAt: string;
}
