import {
   // ... existing imports
   BusinessAnalytics,
   BusinessProduct,
   BusinessPayment,
   BusinessCustomer,
   BusinessWebsite,
   BusinessAd,
   WorkforceMember,
   BusinessCard,
   SupportTicket,
} from "./types";
import {
   Conversation,
   Post,
   PopularUser,
   Referral,
   AffiliateProduct,
   DiscoveredBusiness,
   HomeStats,
} from "./types";
import { hashPassword } from "./auth";

// =========================================
// IN-MEMORY DATABASE
// =========================================

// =========================================
// USERS
// =========================================
export interface User {
   id: string;
   name: string;
   email: string;
   passwordHash: string;
   createdAt: number;
}

const users: User[] = [];

// Extend the db object (add these to the existing db object)
// Find `export const db = {` and add these methods:

const conversations: Conversation[] = [
   {
      id: "team-whop",
      name: "Team Whop",
      avatar: "W",
      verified: true,
      lastMessage: "We're excited to see what you build!",
      timestamp: "2 min ago",
      unread: 1,
      messages: [
         {
            id: "m1",
            sender: "them",
            text: `Welcome to Whop!\n\nThousands of internet entrepreneurs like you launch on Whop every day, and you're only 4 steps away from joining them:\n\n1. Add apps to your whop\n2. Design your store page\n3. Set up Whop Payments\n4. Invite your first user`,
            timestamp: "Tuesday 11:06 PM",
         },
         {
            id: "m2",
            sender: "them",
            text: "If you've still got questions, head over to Whop University: https://whop.com/whop/. We run live sessions twice a day where you can drop in and ask anything.",
            timestamp: "Tuesday 11:06 PM",
         },
         {
            id: "m3",
            sender: "them",
            text: "We're excited to see what you build!",
            timestamp: "Tuesday 11:07 PM",
         },
      ],
   },
   {
      id: "sarah-j",
      name: "Sarah Jenkins",
      avatar: "SJ",
      verified: false,
      lastMessage: "Sounds good, let's sync tomorrow",
      timestamp: "1 hour ago",
      unread: 0,
      messages: [
         {
            id: "s1",
            sender: "them",
            text: "Hey! Have you had a chance to review the proposal?",
            timestamp: "Today 9:15 AM",
         },
         {
            id: "s2",
            sender: "me",
            text: "Yes, looks great! Let's discuss tomorrow.",
            timestamp: "Today 9:20 AM",
         },
         {
            id: "s3",
            sender: "them",
            text: "Sounds good, let's sync tomorrow",
            timestamp: "Today 9:22 AM",
         },
      ],
   },
];

const posts: Post[] = [
   {
      id: "p1",
      author: { name: "Vonn5", handle: "@vonn5", avatar: "V", verified: true },
      forum: "Public forum",
      content: "Like, Share & Comment on Vonn.5 Post (US Only)",
      price: 0.14,
      isOpen: true,
      stats: { comments: 1, likes: 4, views: 905 },
      timestamp: "1h",
   },
   {
      id: "p2",
      author: {
         name: "Jalaj Aldershof",
         handle: "@jash-works",
         avatar: "JA",
         verified: true,
      },
      forum: "$1K Income Machine",
      content:
         "Find the right prospects, start the right conversations, make the right offer — and get your first customer.",
      stats: { comments: 8, likes: 24, views: 1240 },
      timestamp: "7h",
   },
];

const popularUsers: PopularUser[] = [
   {
      id: "u1",
      name: "Tiana",
      avatar: "T",
      bio: "Creator of Whop University + 17 more",
      followers: 12400,
      isFollowing: false,
   },
   {
      id: "u2",
      name: "QTT",
      avatar: "Q",
      bio: "Creator of Clip Labs + 3 more",
      followers: 8900,
      isFollowing: false,
   },
   {
      id: "u3",
      name: "Trustmysystem",
      avatar: "TM",
      bio: "Creator of Trust My System + 2 more",
      followers: 21000,
      isFollowing: false,
   },
   {
      id: "u4",
      name: "ClipHouse",
      avatar: "CH",
      bio: "Creator of ClipHouse + 1 more",
      followers: 5400,
      isFollowing: false,
   },
   {
      id: "u5",
      name: "Nathan",
      avatar: "N",
      bio: "Creator of TaskBoard",
      followers: 3200,
      isFollowing: true,
   },
   {
      id: "u6",
      name: "Jonathan Lee",
      avatar: "JL",
      bio: "Creator of Whop Workforce + 9 more",
      followers: 15600,
      isFollowing: false,
   },
   {
      id: "u7",
      name: "BeezoWins VIP Picks",
      avatar: "BW",
      bio: "Creator of BeezoWins + 1 more",
      followers: 4200,
      isFollowing: false,
   },
   {
      id: "u8",
      name: "Jynx Picks",
      avatar: "JP",
      bio: "Creator of Jynx Picks",
      followers: 2800,
      isFollowing: false,
   },
   {
      id: "u9",
      name: "gabrielinfluence",
      avatar: "G",
      bio: "Creator of Clip Influence + 4 more",
      followers: 9800,
      isFollowing: false,
   },
   {
      id: "u10",
      name: "Laura Egocheaga",
      avatar: "LE",
      bio: "Creator of Viral Growth Media",
      followers: 6700,
      isFollowing: false,
   },
];

const referrals: Referral[] = [];
// Add sample referrals
for (let i = 0; i < 3; i++) {
   referrals.push({
      id: `r${i + 1}`,
      business: ["Nova Labs", "Apex Fitness", "Bloom Studio"][i],
      volume: Math.floor(Math.random() * 50000),
      earnings: Math.floor(Math.random() * 2000),
      referredUser: ["john@example.com", "sarah@test.com", "mike@demo.io"][i],
      joinedOn: ["Jan 15, 2025", "Feb 3, 2025", "Mar 22, 2025"][i],
   });
}

const affiliateProducts: AffiliateProduct[] = [
   {
      id: "a1",
      name: "PokePings",
      category: "Retail Arbitrage",
      commission: 50,
      epc: 0.28,
      image: "PP",
   },
   {
      id: "a2",
      name: "DEAL SOLDIER",
      category: "Retail Arbitrage",
      commission: 30,
      epc: 0.12,
      image: "DS",
   },
   {
      id: "a3",
      name: "Skylit",
      category: "Options Trading",
      commission: 15,
      epc: 19.36,
      image: "SK",
   },
   {
      id: "a4",
      name: "PokeNotify App",
      category: "Resale Arbitrage",
      commission: 40,
      epc: 0.0,
      image: "PN",
   },
];

const discoveredBusinesses: DiscoveredBusiness[] = [
   {
      id: "d1",
      name: "WhopX",
      description: "A private network for Whop entrepreneurs.",
      image: "WX",
      rating: 4.9,
      users: 8100,
      views: 32700,
      launchedAgo: "4mo ago",
      verified: true,
   },
   {
      id: "d2",
      name: "Skinramp",
      description:
         "Marketplace to list and buy gaming skins. Reach active buyers and start selling today.",
      image: "SR",
      rating: 4.7,
      users: 17600,
      views: 17600,
      launchedAgo: "11mo ago",
      verified: true,
   },
   {
      id: "d3",
      name: "Icybox",
      description:
         "Open digital boxes to reveal luxury items from Rolex, Patek Philippe, Audemars Piguet.",
      image: "IB",
      rating: 4.8,
      users: 3700,
      views: 14900,
      launchedAgo: "2mo ago",
      verified: true,
   },
];

const homeStats: HomeStats = {
   totalBalance: 0,
   chartData: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      value: 0,
   })),
   pulse: [],
};

// =========================================
// DATA ACCESS FUNCTIONS (acts like a DB API)
// =========================================

export const db = {
   // Home
   getHomeStats: () => homeStats,

   // Messages
   getConversations: () => conversations,
   getConversation: (id: string) => conversations.find((c) => c.id === id),
   addMessage: (conversationId: string, text: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return null;
      const newMessage = {
         id: `m-${Date.now()}`,
         sender: "me" as const,
         text,
         timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
         }),
      };
      conv.messages.push(newMessage);
      conv.lastMessage = text;
      conv.timestamp = "just now";
      return newMessage;
   }, // Users
   findUserByEmail: (email: string) =>
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
   findUserById: (id: string) => users.find((u) => u.id === id),
   createUser: (name: string, email: string, password: string): User | null => {
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
         return null;
      const user: User = {
         id: `user-${Date.now()}`,
         name,
         email,
         passwordHash: hashPassword(password),
         createdAt: Date.now(),
      };
      users.push(user);
      return user;
   },

   // Townhall
   getPosts: () => posts,
   addPost: (
      content: string,
      author = {
         name: "Dr. Zakarinović",
         handle: "@dr-zak",
         avatar: "DZ",
         verified: true,
      },
   ) => {
      const newPost: Post = {
         id: `p-${Date.now()}`,
         author,
         forum: "Public forum",
         content,
         stats: { comments: 0, likes: 0, views: 0 },
         timestamp: "just now",
      };
      posts.unshift(newPost);
      return newPost;
   },
   getPopularUsers: () => popularUsers,
   toggleFollow: (userId: string) => {
      const user = popularUsers.find((u) => u.id === userId);
      if (user) user.isFollowing = !user.isFollowing;
      return user;
   },

   // Partners
   getReferrals: () => referrals,

   // Affiliates
   getAffiliateProducts: () => affiliateProducts,

   // Discover
   getDiscoveredBusinesses: () => discoveredBusinesses,
};

// =========================================
// BUSINESS DATA
// =========================================

const businessAnalytics: BusinessAnalytics = {
   totalRevenue: 128450.75,
   revenueChange: 12.4,
   totalOrders: 3421,
   ordersChange: 8.2,
   conversionRate: 3.8,
   conversionChange: -1.2,
   activeSubscriptions: 892,
   chartData: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.floor(2000 + Math.random() * 4000),
      orders: Math.floor(80 + Math.random() * 120),
   })),
};

const businessProducts: BusinessProduct[] = [
   {
      id: "bp1",
      name: "Pro Membership",
      description: "Monthly access to premium content",
      price: 49,
      type: "subscription",
      status: "active",
      sales: 842,
      revenue: 41258,
      image: "PM",
   },
   {
      id: "bp2",
      name: "Starter Course",
      description: "Beginner-friendly course bundle",
      price: 99,
      type: "one-time",
      status: "active",
      sales: 231,
      revenue: 22869,
      image: "SC",
   },
   {
      id: "bp3",
      name: "VIP Coaching",
      description: "1-on-1 coaching sessions",
      price: 499,
      type: "one-time",
      status: "active",
      sales: 42,
      revenue: 20958,
      image: "VC",
   },
   {
      id: "bp4",
      name: "Template Pack",
      description: "Ready-to-use templates",
      price: 29,
      type: "one-time",
      status: "draft",
      sales: 0,
      revenue: 0,
      image: "TP",
   },
];

const businessPayments: BusinessPayment[] = [
   {
      id: "pay1",
      customer: "John Smith",
      product: "Pro Membership",
      amount: 49,
      status: "succeeded",
      method: "Visa ••• 4242",
      date: "2 min ago",
   },
   {
      id: "pay2",
      customer: "Sarah J.",
      product: "Starter Course",
      amount: 99,
      status: "succeeded",
      method: "Mastercard ••• 5555",
      date: "1 hr ago",
   },
   {
      id: "pay3",
      customer: "Mike Chen",
      product: "Pro Membership",
      amount: 49,
      status: "pending",
      method: "PayPal",
      date: "3 hr ago",
   },
   {
      id: "pay4",
      customer: "Emma W.",
      product: "VIP Coaching",
      amount: 499,
      status: "failed",
      method: "Amex ••• 0005",
      date: "5 hr ago",
   },
   {
      id: "pay5",
      customer: "David Lee",
      product: "Starter Course",
      amount: 99,
      status: "refunded",
      method: "Visa ••• 1234",
      date: "Yesterday",
   },
];

const businessCustomers: BusinessCustomer[] = [
   {
      id: "c1",
      name: "John Smith",
      email: "john@example.com",
      avatar: "JS",
      spent: 294,
      orders: 6,
      joinedOn: "Jan 12, 2025",
      status: "active",
   },
   {
      id: "c2",
      name: "Sarah Jenkins",
      email: "sarah@test.com",
      avatar: "SJ",
      spent: 198,
      orders: 3,
      joinedOn: "Feb 3, 2025",
      status: "active",
   },
   {
      id: "c3",
      name: "Mike Chen",
      email: "mike@demo.io",
      avatar: "MC",
      spent: 147,
      orders: 3,
      joinedOn: "Mar 22, 2025",
      status: "trial",
   },
   {
      id: "c4",
      name: "Emma Watson",
      email: "emma@mail.com",
      avatar: "EW",
      spent: 0,
      orders: 0,
      joinedOn: "Apr 1, 2025",
      status: "churned",
   },
];

const businessWebsites: BusinessWebsite[] = [
   {
      id: "w1",
      domain: "spaceex.com",
      name: "Main Store",
      visits: 125400,
      conversion: 3.2,
      status: "live",
   },
   {
      id: "w2",
      domain: "shop.spaceex.com",
      name: "Product Store",
      visits: 45210,
      conversion: 4.8,
      status: "live",
   },
   {
      id: "w3",
      domain: "blog.spaceex.com",
      name: "Blog",
      visits: 8920,
      conversion: 1.1,
      status: "draft",
   },
];

const businessAds: BusinessAd[] = [
   {
      id: "ad1",
      name: "Summer Sale",
      platform: "meta",
      spend: 4820,
      impressions: 892000,
      clicks: 12400,
      conversions: 342,
      cpc: 0.39,
      roas: 4.2,
      status: "active",
   },
   {
      id: "ad2",
      name: "Retarget VIP",
      platform: "tiktok",
      spend: 2140,
      impressions: 412000,
      clicks: 6800,
      conversions: 198,
      cpc: 0.31,
      roas: 3.8,
      status: "active",
   },
   {
      id: "ad3",
      name: "Brand Awareness",
      platform: "google",
      spend: 1560,
      impressions: 234000,
      clicks: 3200,
      conversions: 84,
      cpc: 0.49,
      roas: 2.1,
      status: "paused",
   },
];

const workforceMembers: WorkforceMember[] = [
   {
      id: "wm1",
      name: "Sarah Jenkins",
      role: "Marketing Lead",
      avatar: "SJ",
      email: "sarah@spaceex.com",
      status: "active",
      joinedOn: "Jan 15, 2025",
   },
   {
      id: "wm2",
      name: "Mike Chen",
      role: "Support Agent",
      avatar: "MC",
      email: "mike@spaceex.com",
      status: "active",
      joinedOn: "Feb 20, 2025",
   },
   {
      id: "wm3",
      name: "Emma Watson",
      role: "Content Creator",
      avatar: "EW",
      email: "emma@spaceex.com",
      status: "invited",
      joinedOn: "—",
   },
];

const businessCards: BusinessCard[] = [
   {
      id: "card1",
      last4: "4242",
      brand: "Visa",
      holder: "Dr. Zakarinović",
      expiry: "12/27",
      balance: 12480.5,
      status: "active",
   },
   {
      id: "card2",
      last4: "8888",
      brand: "Mastercard",
      holder: "Space/Ex Inc.",
      expiry: "08/26",
      balance: 3420.0,
      status: "frozen",
   },
];

const supportTickets: SupportTicket[] = [
   {
      id: "t1",
      subject: "Cannot access course",
      customer: "john@example.com",
      priority: "high",
      status: "open",
      createdAt: "10 min ago",
   },
   {
      id: "t2",
      subject: "Billing question",
      customer: "sarah@test.com",
      priority: "medium",
      status: "pending",
      createdAt: "2 hr ago",
   },
   {
      id: "t3",
      subject: "Feature request",
      customer: "mike@demo.io",
      priority: "low",
      status: "resolved",
      createdAt: "1 day ago",
   },
];

// Add these to your existing `db` object:
export const businessDb = {
   getAnalytics: () => businessAnalytics,
   getProducts: () => businessProducts,
   addProduct: (p: Omit<BusinessProduct, "id" | "sales" | "revenue">) => {
      const np = { ...p, id: `bp-${Date.now()}`, sales: 0, revenue: 0 };
      businessProducts.unshift(np);
      return np;
   },
   toggleProductStatus: (id: string) => {
      const p = businessProducts.find((x) => x.id === id);
      if (p) p.status = p.status === "active" ? "archived" : "active";
      return p;
   },
   getPayments: () => businessPayments,
   getCustomers: () => businessCustomers,
   getWebsites: () => businessWebsites,
   getAds: () => businessAds,
   toggleAdStatus: (id: string) => {
      const a = businessAds.find((x) => x.id === id);
      if (a) a.status = a.status === "active" ? "paused" : "active";
      return a;
   },
   getWorkforce: () => workforceMembers,
   inviteMember: (email: string, role: string) => {
      const m: WorkforceMember = {
         id: `wm-${Date.now()}`,
         name: email.split("@")[0],
         email,
         role,
         avatar: email.charAt(0).toUpperCase(),
         status: "invited",
         joinedOn: "—",
      };
      workforceMembers.push(m);
      return m;
   },
   getCards: () => businessCards,
   toggleCardStatus: (id: string) => {
      const c = businessCards.find((x) => x.id === id);
      if (c) c.status = c.status === "active" ? "frozen" : "active";
      return c;
   },
   getTickets: () => supportTickets,
   updateTicketStatus: (id: string, status: SupportTicket["status"]) => {
      const t = supportTickets.find((x) => x.id === id);
      if (t) t.status = status;
      return t;
   },
};
