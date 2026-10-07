import mongoose from "mongoose";
import crypto from "crypto";
import User from "../src/app/lib/models/User";
import Conversation from "../src/app/lib/models/Conversation";
import Message from "../src/app/lib/models/Message";
import Notification from "../src/app/lib/models/Notification";
import Business from "../src/app/lib/models/Business";
import Order from "../src/app/lib/models/Order";
import TeamInvite from "../src/app/lib/models/TeamInvite";
import PartnerRequest from "../src/app/lib/models/PartnerRequest";
import PaymentMethod from "../src/app/lib/models/PaymentMethod";
import ResolutionCase from "../src/app/lib/models/ResolutionCase";
import Transaction from "../src/app/lib/models/Transaction";
import Website from "../src/app/lib/models/Website";
import LiveEvent from "../src/app/lib/models/LiveEvent";
import Product from "../src/app/lib/models/Product";
import Post from "../src/app/lib/models/Post";
import Follow from "../src/app/lib/models/Follow";
import Payment from "../src/app/lib/models/Payment";
import CheckoutLink from "../src/app/lib/models/CheckoutLink";
import Campaign from "../src/app/lib/models/Campaign";
import AdSettings from "../src/app/lib/models/AdSettings";
import Affiliate from "../src/app/lib/models/Affiliate";
import AffiliateSignup from "../src/app/lib/models/AffiliateSignup";
import RevenueSharePartner from "../src/app/lib/models/RevenueSharePartner";
import AffiliateSettings from "../src/app/lib/models/AffiliateSettings";
import SupportChat from "../src/app/lib/models/SupportChat";
import Invoice from "../src/app/lib/models/Invoice";
import PromoCode from "../src/app/lib/models/PromoCode";
import TeamMember from "../src/app/lib/models/TeamMember";
import SubAccount from "../src/app/lib/models/SubAccount";
import AppListing from "../src/app/lib/models/AppListing";
import InstalledApp from "../src/app/lib/models/InstalledApp";
import DiscoverCampaign from "../src/app/lib/models/DiscoverCampaign";
import Customer from "../src/app/lib/models/Customer";
import Membership from "../src/app/lib/models/Membership";
import Visitor from "../src/app/lib/models/Visitor";

function hashPassword(password: string): string {
   const salt = crypto.randomBytes(16).toString("hex");
   const hash = crypto.scryptSync(password, salt, 64).toString("hex");
   return `${salt}:${hash}`;
}

async function seed() {
   const uri = process.env.MONGODB_URI;

   if (!uri) {
      console.error("❌ MONGODB_URI is not defined");
      console.error("   Add it to .env.local and run with: npm run seed");
      process.exit(1);
   }

   console.log("🔌 Connecting to MongoDB...");
   await mongoose.connect(uri);
   console.log("✅ Connected");

   // =========================================
   // CLEAR EXISTING DATA
   // =========================================
   console.log("🧹 Clearing existing data...");
   await Promise.all([
      User.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Business.deleteMany({}),
      Order.deleteMany({}),
      TeamInvite.deleteMany({}),
      PartnerRequest.deleteMany({}),
      PaymentMethod.deleteMany({}),
      ResolutionCase.deleteMany({}),
      Transaction.deleteMany({}),
      Website.deleteMany({}),
      LiveEvent.deleteMany({}),
      Product.deleteMany({}),
      Post.deleteMany({}),
      Follow.deleteMany({}),
      Payment.deleteMany({}),
      CheckoutLink.deleteMany({}),
      Campaign.deleteMany({}),
      AdSettings.deleteMany({}),
      Affiliate.deleteMany({}),
      AffiliateSignup.deleteMany({}),
      RevenueSharePartner.deleteMany({}),
      AffiliateSettings.deleteMany({}),
      SupportChat.deleteMany({}),
      Invoice.deleteMany({}),
      PromoCode.deleteMany({}),
      TeamMember.deleteMany({}),
      SubAccount.deleteMany({}),
      AppListing.deleteMany({}),
      InstalledApp.deleteMany({}),
      DiscoverCampaign.deleteMany({}),
      Customer.deleteMany({}),
      Membership.deleteMany({}),
      Visitor.deleteMany({}),
   ]);
   console.log("✅ Data cleared");

   // =========================================
   // CREATE USERS
   // =========================================
   console.log("👤 Creating users...");

   const dr = await User.create({
      name: "Dr. Zakarinović",
      email: "dr@spaceex.com",
      username: "wwwlord",
      passwordHash: hashPassword("password123"),
      bio: "Building the future of work with Space-Ex.",
      dateOfBirth: "1990-05-15",
      location: "Dubai, UAE",
      avatarColor: "#3b82f6",
      privacy: {
         totalEarned: true,
         location: true,
         ownedWhops: true,
         joinedWhops: true,
      },
      socialAccounts: {
         x: { connected: false },
         instagram: { connected: false },
         discord: { connected: false },
         telegram: { connected: false },
         tradingview: { connected: false },
         youtube: { connected: false },
         tiktok: { connected: false },
         linkedin: { connected: false },
      },
      notificationPrefs: {
         popup: true,
         sound: true,
         activity: {
            aiChatMessage: true,
            aiChatQuestion: true,
            bountyClaimed: true,
            newFollower: true,
            paymentFailed: true,
            upcomingPaymentReminders: true,
            withdrawalStatusChange: true,
            transferReceived: true,
         },
      },
      twoFactor: { enabled: false, method: null },
      wallet: { address: "", balance: 0, exported: false },
      verification: {
         individual: "none",
         business: "none",
         payouts: "inactive",
         bankDeposits: "inactive",
      },
   });

   const spaceExTeam = await User.create({
      name: "Space-Ex Team",
      email: "team@space-ex.com",
      username: "spaceex",
      passwordHash: hashPassword("randompassword"),
      bio: "Official Space-Ex support team. We're here to help 24/7.",
      avatarColor: "#3b82f6",
   });

   const sarah = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@test.com",
      username: "sarahj",
      passwordHash: hashPassword("randompassword"),
      bio: "Marketing consultant & business strategist.",
      location: "London, UK",
      avatarColor: "#ec4899",
   });

   const alex = await User.create({
      name: "Alex Ventures",
      email: "alex@ventures.com",
      username: "alexv",
      passwordHash: hashPassword("randompassword"),
      bio: "Investor. Partner at ventures.io",
      avatarColor: "#10b981",
   });

   console.log("✅ Users created");

   // =========================================
   // CREATE BUSINESSES
   // =========================================
   console.log("🏢 Creating businesses...");

   const spaceExBiz = await Business.create({
      userId: dr._id,
      name: "Space/Ex",
      initial: "S",
      description: "Building the future of work with Space-Ex.",
      type: "Software",
      revenue: "$50-$250k",
      migrateFrom: "Not migrating",
      website: "space-ex.com",
      logoUrl: "",
      balance: 0,
      economicIntelligence: false,
      weeklyCardSpend: [0, 0, 0, 0, 0, 0, 0],
      industry: {
         businessType: "Software",
         industryGroup: "Technology",
         industryType: "SaaS",
      },
      analyticsPixels: {
         spaceExPixel: true,
         googleAnalytics: false,
         hyros: false,
         meta: false,
         tiktok: false,
         x: false,
         reddit: false,
         pinterest: false,
         hubspot: false,
      },
      notificationPrefs: {
         cardEmails: true,
         disputes: true,
         failedAdsPayment: true,
         joins: true,
         payments: true,
         paymentsReview: true,
         resolutionCenter: true,
         supportAllMessages: true,
         supportMentionsOnly: false,
         waitlists: true,
         withdrawals: true,
      },
      checkout: {
         paymentOrchestration: true,
         successRedirectUrl: "",
         customStatementDescriptor: "",
         appleGooglePayEmbedded: false,
         shareDomainsWithConnect: false,
         collectPhoneAtCheckout: false,
         keepAccessWhilePastDue: false,
         cancelSubsAfterFailedPayments: true,
         sendTransactionalEmails: true,
      },
      checkoutBranding: {
         backgroundColor: "#000000",
         buttonColor: "#ffffff",
         font: "system",
         borderStyle: "rounded",
         previewTheme: "dark",
      },
      payments: {
         applyForFinancing: false,
         maxPrice: 2500,
         threeDSecure: "frictionless",
         paypalEnabled: false,
         disputeFighter: true,
         autoRefundBNPL: true,
         autoRefundCardBelow: 0,
         autoRefundPaypalBelow: 0,
         autoRefundMessage: "Sorry you had a bad experience. Here's a refund.",
         earlyDisputeAlertBelow: 500,
      },
      verification: {
         individual: "none",
         business: "none",
         payouts: "inactive",
         spaceExCard: "inactive",
         bankDeposits: "inactive",
         financing: "inactive",
      },
      invoices: { customPrefixEnabled: false, customPrefix: "" },
      legal: {
         termsUrl: "",
         privacyUrl: "",
         returnUrl: "",
         eulaUrl: "",
         requireTermsAcceptance: false,
         vatOrTaxId: "",
         supportAddress: "",
         supportName: "",
         supportEmail: "",
      },
      tax: {
         taxCollectionMode: "spaceex_collects",
         businessAddress: "",
         taxRegistrations: [],
         taxType: "exclusive",
         collectVatFromUsers: false,
      },
      openGraph: {
         imageUrl: "",
         useLogoAsFallback: false,
         mediaUrl: "",
      },
      homePreferences: {
         hideMemberCount: false,
         hideMembersCard: false,
      },
   });

   console.log("✅ Businesses created");

   // =========================================
   // CREATE PRODUCTS
   // =========================================
   console.log("📦 Creating products...");

   await Product.create([
      {
         businessId: spaceExBiz._id,
         name: "Pro Membership",
         slug: "pro-membership",
         headline: "Unlock all premium features and exclusive content.",
         description:
            "Get full access to our course library, weekly live Q&A sessions, and a private community of like-minded entrepreneurs.",
         accessType: "paid",
         pricingType: "recurring",
         price: 49,
         currency: "USD",
         recurringInterval: "monthly",
         includedApps: ["forums", "chat", "courses", "content"],
         appearanceColor: "#3b82f6",
         visibility: "visible",
         discoverStatus: "listed",
         productSettings: {
            purchaseButtonText: "Join",
            productTaxCode: "digital",
            productUrl: "space-ex.com/space-ex/pro-membership",
            addAffiliateRate: true,
            affiliateRate: 30,
            checkoutRedirect: false,
            checkoutRedirectUrl: "",
            visibleOnStorePage: true,
         },
         stats: {
            allTimeRevenue: 41258,
            activeUsers: 842,
            checkoutConversion: 4.2,
            totalSales: 842,
         },
      },
      {
         businessId: spaceExBiz._id,
         name: "Starter Course",
         slug: "starter-course",
         headline: "Everything you need to launch your first digital product.",
         description: "A 6-week step-by-step program.",
         accessType: "paid",
         pricingType: "one-time",
         price: 99,
         currency: "USD",
         recurringInterval: "",
         includedApps: ["courses", "content"],
         appearanceColor: "#8b5cf6",
         visibility: "visible",
         discoverStatus: "listed",
         productSettings: {
            purchaseButtonText: "Buy now",
            productTaxCode: "digital",
            productUrl: "space-ex.com/space-ex/starter-course",
            addAffiliateRate: true,
            affiliateRate: 25,
            checkoutRedirect: false,
            checkoutRedirectUrl: "",
            visibleOnStorePage: true,
         },
         stats: {
            allTimeRevenue: 22869,
            activeUsers: 231,
            checkoutConversion: 6.8,
            totalSales: 231,
         },
      },
      {
         businessId: spaceExBiz._id,
         name: "Free Community",
         slug: "free-community",
         headline: "Join 5,000+ entrepreneurs in our free public forum.",
         description:
            "Ask questions, share wins, and connect with other founders.",
         accessType: "free",
         pricingType: "one-time",
         price: 0,
         currency: "USD",
         recurringInterval: "",
         includedApps: ["forums", "chat"],
         appearanceColor: "#10b981",
         visibility: "visible",
         discoverStatus: "listed",
         productSettings: {
            purchaseButtonText: "Join",
            productTaxCode: "",
            productUrl: "space-ex.com/space-ex/free-community",
            addAffiliateRate: false,
            affiliateRate: 0,
            checkoutRedirect: false,
            checkoutRedirectUrl: "",
            visibleOnStorePage: true,
         },
         stats: {
            allTimeRevenue: 0,
            activeUsers: 5124,
            checkoutConversion: 12.4,
            totalSales: 5124,
         },
      },
      {
         businessId: spaceExBiz._id,
         name: "VIP Coaching",
         slug: "vip-coaching",
         headline: "1-on-1 coaching with Dr. Zakarinović.",
         description:
            "12 weeks of personalized coaching. Limited to 5 spots per quarter.",
         accessType: "paid",
         pricingType: "one-time",
         price: 4999,
         currency: "USD",
         recurringInterval: "",
         includedApps: ["content", "events"],
         appearanceColor: "#f59e0b",
         visibility: "hidden",
         discoverStatus: "unlisted",
         productSettings: {
            purchaseButtonText: "Get access",
            productTaxCode: "services",
            productUrl: "space-ex.com/space-ex/vip-coaching",
            addAffiliateRate: false,
            affiliateRate: 0,
            checkoutRedirect: false,
            checkoutRedirectUrl: "",
            visibleOnStorePage: false,
         },
         stats: {
            allTimeRevenue: 49990,
            activeUsers: 10,
            checkoutConversion: 42.1,
            totalSales: 10,
         },
      },
   ]);

   console.log("✅ Products created");

   // =========================================
   // CREATE CUSTOMERS, MEMBERSHIPS, PEOPLE
   // =========================================
   console.log("👥 Creating customers, memberships, people...");

   await Customer.create([
      {
         businessId: spaceExBiz._id,
         userId: dr._id,
         email: "www.lord5566@gmail.com",
         name: "Dr. Zakarinović",
         username: "member",
         avatar: "DZ",
         status: "joined",
         country: "Egypt",
         state: "Cairo",
         city: "Al Mansurah",
         totalSpend: 0,
         joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
         lastAccessed: new Date(Date.now() - 7 * 60 * 1000),
      },
      {
         businessId: spaceExBiz._id,
         userId: sarah._id,
         email: "sarah@test.com",
         name: "Sarah Jenkins",
         username: "sarahj",
         avatar: "SJ",
         status: "joined",
         country: "United Kingdom",
         state: "England",
         city: "London",
         totalSpend: 148,
         joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
         lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
         businessId: spaceExBiz._id,
         userId: alex._id,
         email: "alex@ventures.com",
         name: "Alex Ventures",
         username: "alexv",
         avatar: "AV",
         status: "invited",
         country: "United States",
         state: "California",
         city: "San Francisco",
         totalSpend: 0,
         joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
         lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
   ]);

   await Membership.create([
      {
         businessId: spaceExBiz._id,
         userId: sarah._id,
         productId: spaceExBiz._id,
         productName: "Pro Membership",
         email: "sarah@test.com",
         name: "Sarah Jenkins",
         avatar: "SJ",
         status: "active",
         totalSpend: 147,
      },
      {
         businessId: spaceExBiz._id,
         userId: alex._id,
         productId: spaceExBiz._id,
         productName: "Starter Course",
         email: "alex@ventures.com",
         name: "Alex Ventures",
         avatar: "AV",
         status: "inactive",
         totalSpend: 99,
         canceledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
         cancelReason: "Too expensive",
      },
   ]);

   await Visitor.create([
      {
         businessId: spaceExBiz._id,
         userId: dr._id,
         email: "www.lord5566@gmail.com",
         name: "Dr. Zakarinović",
         username: "member",
         avatar: "DZ",
         location: "Al Mansurah, EG",
         source: "Direct",
         utmSource: "",
         eventType: "visit",
         country: "Egypt",
         totalSpend: 0,
         purchases: 0,
         events: 20,
         lastSeen: new Date(Date.now() - 7 * 60 * 1000),
      },
      {
         businessId: spaceExBiz._id,
         userId: sarah._id,
         email: "sarah@test.com",
         name: "Sarah Jenkins",
         username: "sarahj",
         avatar: "SJ",
         location: "London, UK",
         source: "Google",
         utmSource: "google_ads",
         eventType: "purchase",
         country: "United Kingdom",
         totalSpend: 148,
         purchases: 3,
         events: 45,
         lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      },
   ]);

   console.log("✅ Customers, memberships, people created");

   // =========================================
   // CREATE TRANSACTIONS
   // =========================================
   console.log("💸 Creating transactions...");

   const txNow = Date.now();
   const txDay = 24 * 60 * 60 * 1000;

   await Transaction.create([
      {
         businessId: spaceExBiz._id,
         kind: "deposit",
         amount: 500,
         status: "completed",
         description: "Initial funding",
         metadata: { method: "bank_transfer" },
         createdAt: new Date(txNow - 10 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "payment",
         amount: 49,
         status: "completed",
         description: "Pro Membership",
         counterparty: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "JS",
         },
         createdAt: new Date(txNow - 8 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "payment",
         amount: 99,
         status: "completed",
         description: "Starter Course",
         counterparty: {
            name: "Sarah Jenkins",
            email: "sarah@test.com",
            avatar: "SJ",
         },
         createdAt: new Date(txNow - 5 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "card_spend",
         amount: 12.4,
         status: "completed",
         description: "Figma subscription",
         createdAt: new Date(txNow - 3 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "ad_spend",
         amount: 85.0,
         status: "completed",
         description: "Meta Ads campaign",
         createdAt: new Date(txNow - 2 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "refund",
         amount: 49,
         status: "completed",
         description: "Refund for duplicate charge",
         counterparty: {
            name: "John Smith",
            email: "john@example.com",
            avatar: "JS",
         },
         createdAt: new Date(txNow - 1 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         kind: "payment",
         amount: 199,
         status: "completed",
         description: "VIP Coaching",
         counterparty: {
            name: "Michael Chen",
            email: "mike@demo.io",
            avatar: "MC",
         },
         createdAt: new Date(txNow - 3 * 60 * 60 * 1000),
      },
      {
         businessId: spaceExBiz._id,
         kind: "payment",
         amount: 29,
         status: "completed",
         description: "Template Pack",
         counterparty: {
            name: "Emma Watson",
            email: "emma@mail.com",
            avatar: "EW",
         },
         createdAt: new Date(txNow - 1 * 60 * 60 * 1000),
      },
   ]);

   const allTx = await Transaction.find({ businessId: spaceExBiz._id });
   let balance = 0;
   allTx.forEach((t) => {
      if (["deposit", "payment"].includes(t.kind)) balance += t.amount;
      if (
         ["send", "refund", "withdrawal", "card_spend", "ad_spend"].includes(
            t.kind,
         )
      ) {
         balance -= t.amount;
      }
   });

   spaceExBiz.balance = balance;
   spaceExBiz.economicIntelligence = true;
   spaceExBiz.weeklyCardSpend = [12.4, 0, 0, 0, 85, 0, 0];
   await spaceExBiz.save();

   console.log("✅ Transactions created");
   console.log(`   💰 Business balance: $${balance.toFixed(2)}`);

   // =========================================
   // CREATE PAYMENTS
   // =========================================
   console.log("💳 Creating payments...");

   await Payment.create([
      {
         businessId: spaceExBiz._id,
         amount: 49,
         currency: "USD",
         status: "succeeded",
         product: "Pro Membership",
         plan: "Monthly",
         method: "card",
         methodLast4: "4242",
         email: "john@example.com",
         customerName: "John Smith",
         reason: "",
         promoCode: "WELCOME10",
         userAvatar: "JS",
         refunded: false,
         createdAt: new Date(txNow - 8 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         amount: 99,
         currency: "USD",
         status: "succeeded",
         product: "Starter Course",
         plan: "One-time",
         method: "paypal",
         email: "sarah@test.com",
         customerName: "Sarah Jenkins",
         reason: "",
         promoCode: "",
         userAvatar: "SJ",
         refunded: false,
         createdAt: new Date(txNow - 5 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         amount: 199,
         currency: "USD",
         status: "needs_review",
         product: "VIP Coaching",
         plan: "One-time",
         method: "card",
         methodLast4: "5555",
         email: "mike@demo.io",
         customerName: "Michael Chen",
         reason: "Unusual location",
         promoCode: "",
         userAvatar: "MC",
         refunded: false,
         createdAt: new Date(txNow - 3 * 60 * 60 * 1000),
      },
      {
         businessId: spaceExBiz._id,
         amount: 29,
         currency: "USD",
         status: "failed",
         product: "Template Pack",
         plan: "One-time",
         method: "card",
         methodLast4: "0005",
         email: "emma@mail.com",
         customerName: "Emma Watson",
         reason: "Insufficient funds",
         promoCode: "",
         userAvatar: "EW",
         refunded: false,
         createdAt: new Date(txNow - 1 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         amount: 49,
         currency: "USD",
         status: "disputed",
         product: "Pro Membership",
         plan: "Monthly",
         method: "card",
         methodLast4: "4242",
         email: "john@example.com",
         customerName: "John Smith",
         reason: "Duplicate charge",
         promoCode: "",
         userAvatar: "JS",
         refunded: true,
         createdAt: new Date(txNow - 2 * txDay),
      },
      {
         businessId: spaceExBiz._id,
         amount: 499,
         currency: "USD",
         status: "pending",
         product: "Pro Membership",
         plan: "Yearly",
         method: "card",
         methodLast4: "1111",
         email: "pending@example.com",
         customerName: "Pending User",
         reason: "",
         promoCode: "SAVE20",
         refunded: false,
         createdAt: new Date(txNow - 30 * 60 * 1000),
      },
   ]);

   console.log("✅ Payments created");

   // =========================================
   // CREATE CHECKOUT LINKS
   // =========================================
   console.log("🔗 Creating checkout links...");

   await CheckoutLink.create([
      {
         businessId: spaceExBiz._id,
         createdBy: dr._id,
         productName: "Premium Membership",
         headline: "How to Build a Viral App: $0 to $100k/mo",
         description: "Get access to all premium courses and templates.",
         includedApps: ["forums"],
         pricingType: "one-time",
         price: 10,
         currency: "USD",
         recurringInterval: "",
         amountPresets: [50, 100, 250],
         advancedOptions: false,
         acceptLocalCurrencies: true,
         customizePaymentMethods: false,
         checkoutBranding: {
            backgroundColor: "#000000",
            buttonColor: "#ffffff",
            font: "global",
            borderStyle: "global",
         },
         slug: "premium-membership",
         url: "space-ex.com/s/premium-membership",
      },
   ]);

   console.log("✅ Checkout links created");

   // =========================================
   // CREATE WEBSITES
   // =========================================
   console.log("🌐 Creating websites...");

   await Website.create([
      {
         businessId: spaceExBiz._id,
         domain: "space-ex.com",
         name: "Space-Ex",
         status: "live",
         visits: 1240,
         pageViews: 3820,
         checkouts: 42,
         conversions: 18,
         topSources: [
            { source: "Google", visits: 520 },
            { source: "Twitter", visits: 380 },
            { source: "Direct", visits: 340 },
         ],
         topPages: [
            { path: "/", visits: 890 },
            { path: "/pricing", visits: 420 },
            { path: "/about", visits: 180 },
            { path: "/blog", visits: 140 },
         ],
      },
   ]);

   console.log("✅ Websites created");

   // =========================================
   // CREATE LIVE EVENTS
   // =========================================
   console.log("📡 Creating live events...");

   await LiveEvent.create([
      {
         businessId: spaceExBiz._id,
         type: "purchase",
         country: "United States",
         city: "New York",
         message: "Purchase of $199 (VIP Coaching)",
         amount: 199,
      },
      {
         businessId: spaceExBiz._id,
         type: "visit",
         country: "United Kingdom",
         city: "London",
         message: "New visitor from Google",
      },
      {
         businessId: spaceExBiz._id,
         type: "signup",
         country: "Germany",
         city: "Berlin",
         message: "New member joined Space-Ex",
      },
      {
         businessId: spaceExBiz._id,
         type: "purchase",
         country: "Japan",
         city: "Tokyo",
         message: "Purchase of $29 (Template Pack)",
         amount: 29,
      },
      {
         businessId: spaceExBiz._id,
         type: "checkout",
         country: "France",
         city: "Paris",
         message: "Checkout started",
      },
   ]);

   console.log("✅ Live events created");

   // =========================================
   // CREATE AD SETTINGS + CAMPAIGNS
   // =========================================
   console.log("📢 Creating ad settings + campaigns...");

   await AdSettings.create({
      businessId: spaceExBiz._id,
      reportingCurrency: "USD",
      accountTimezone: "America/New_York",
   });

   await Campaign.create([
      {
         businessId: spaceExBiz._id,
         createdBy: dr._id,
         platform: "facebook",
         objective: "sales",
         title: "space-ex",
         budgetType: "daily",
         budgetAmount: 200,
         budgetControl: "campaign",
         bidStrategy: "highest_volume",
         specialAdCategory: "none",
         status: "active",
         onOff: true,
         conversionLocation: "website",
         conversionEvent: "Purchase",
         advantagePlacements: true,
         advantageAudience: true,
         minAge: 18,
         countries: ["United States"],
         performanceGoal: "maximize_conversions",
         startDate: new Date(),
         stats: {
            spent: 420.5,
            impressions: 128400,
            clicks: 2140,
            results: 42,
            roas: 3.2,
            revenue: 1345.6,
         },
      },
      {
         businessId: spaceExBiz._id,
         createdBy: dr._id,
         platform: "tiktok",
         objective: "engagement",
         title: "Spring promo · TikTok",
         budgetType: "daily",
         budgetAmount: 100,
         budgetControl: "campaign",
         bidStrategy: "highest_volume",
         specialAdCategory: "none",
         status: "paused",
         onOff: false,
         conversionLocation: "website",
         conversionEvent: "Add to cart",
         advantagePlacements: true,
         advantageAudience: false,
         minAge: 21,
         countries: ["United Kingdom", "United States"],
         performanceGoal: "maximize_conversions",
         startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
         stats: {
            spent: 215.3,
            impressions: 45200,
            clicks: 890,
            results: 12,
            roas: 1.8,
            revenue: 387.5,
         },
      },
      {
         businessId: spaceExBiz._id,
         createdBy: dr._id,
         platform: "google",
         objective: "traffic",
         title: "Brand awareness Q4",
         budgetType: "lifetime",
         budgetAmount: 5000,
         budgetControl: "campaign",
         bidStrategy: "cost_cap",
         specialAdCategory: "none",
         status: "draft",
         onOff: false,
         conversionLocation: "website",
         conversionEvent: "View content",
         advantagePlacements: false,
         advantageAudience: true,
         minAge: 25,
         countries: ["United States"],
         performanceGoal: "maximize_conversions",
         startDate: null,
         stats: {
            spent: 0,
            impressions: 0,
            clicks: 0,
            results: 0,
            roas: 0,
            revenue: 0,
         },
      },
   ]);

   console.log("✅ Ad settings + campaigns created");

   // =========================================
   // CREATE AFFILIATES + SETTINGS
   // =========================================
   console.log("🤝 Creating affiliates...");

   await AffiliateSettings.create({
      businessId: spaceExBiz._id,
      defaultCommission: 30,
      portalLink: "space-ex.com/s/affiliates",
      waitlistEnabled: false,
   });

   await Affiliate.create([
      {
         businessId: spaceExBiz._id,
         userId: sarah._id,
         name: "Sarah Jenkins",
         email: "sarah@test.com",
         username: "sarahj",
         avatar: "S",
         referralCode: "SARAH2024",
         commissionRate: 30,
         status: "active",
         referrals: 24,
         rewardsEarned: 842.5,
         retention: 68,
      },
      {
         businessId: spaceExBiz._id,
         userId: alex._id,
         name: "Alex Ventures",
         email: "alex@ventures.com",
         username: "alexv",
         avatar: "A",
         referralCode: "ALEXV55",
         commissionRate: 25,
         status: "active",
         referrals: 12,
         rewardsEarned: 381.0,
         retention: 55,
      },
   ]);

   console.log("✅ Affiliates created");

   // =========================================
   // CREATE FOLLOWS + POSTS
   // =========================================
   console.log("👥 Creating follows + posts...");

   await Follow.create([
      { followerId: dr._id, followingId: sarah._id },
      { followerId: dr._id, followingId: spaceExTeam._id },
      { followerId: sarah._id, followingId: alex._id },
      { followerId: alex._id, followingId: sarah._id },
   ]);

   const postNow = Date.now();
   const postMinute = 60 * 1000;
   const postHour = 60 * postMinute;
   const postDay = 24 * postHour;

   await Post.create([
      {
         author: {
            id: sarah._id,
            name: sarah.name,
            username: "sarahj",
            avatar: "S",
            verified: true,
         },
         forum: "Public forum",
         content:
            "Just wrapped a $50k launch using the Economic Intelligence playbook. The 3x-faster pipeline strategy is real — happy to share details if anyone's interested 👇",
         stats: { comments: 24, likes: 156, views: 12400, shares: 12 },
         likedBy: [dr._id],
         createdAt: new Date(postNow - 45 * postMinute),
      },
      {
         author: {
            id: spaceExTeam._id,
            name: spaceExTeam.name,
            username: "spaceex",
            avatar: "S",
            verified: true,
         },
         forum: "Space-Ex Team",
         content:
            "🚀 New feature alert: You can now accept payments in 135+ currencies with automatic conversion. No more juggling Stripe accounts.",
         stats: { comments: 48, likes: 892, views: 45200, shares: 67 },
         likedBy: [],
         createdAt: new Date(postNow - 2 * postHour),
      },
      {
         author: {
            id: alex._id,
            name: alex.name,
            username: "alexv",
            avatar: "A",
            verified: false,
         },
         forum: "Public forum",
         content:
            "Reminder: Most founders don't fail because of bad products. They fail because of bad distribution. Focus 80% of your time on getting your first 100 users before polishing anything else.",
         media: {
            type: "link",
            url: "space-ex.com/blog/distribution-first",
            title: "The Distribution-First Playbook",
            description:
               "How to get your first 100 users without spending a dollar on ads. A step-by-step guide covering SEO, communities, and partnerships.",
            price: 0,
            isOpen: true,
            rating: 4.8,
            reviewCount: 12,
         },
         stats: { comments: 8, likes: 234, views: 8900, shares: 41 },
         likedBy: [],
         createdAt: new Date(postNow - 5 * postHour),
      },
      {
         author: {
            id: sarah._id,
            name: sarah.name,
            username: "sarahj",
            avatar: "S",
            verified: true,
         },
         forum: "Public forum",
         content:
            "Reading through the Space-Ex analytics and noticed my conversion rate jumped 3.2% after adding the checkout branding. Small tweaks, big returns.",
         stats: { comments: 3, likes: 47, views: 1200, shares: 2 },
         likedBy: [],
         createdAt: new Date(postNow - postDay),
      },
   ]);

   console.log("✅ Follows + posts created");

   // =========================================
   // CREATE CONVERSATIONS
   // =========================================
   console.log("💬 Creating conversations...");

   const conv1 = await Conversation.create({
      participants: [dr._id, spaceExTeam._id],
      lastMessage: "We're excited to see what you build! ✨",
      lastMessageAt: new Date(),
      unreadCounts: { [dr._id.toString()]: 1 },
   });

   const conv2 = await Conversation.create({
      participants: [dr._id, sarah._id],
      lastMessage: "Sounds good, let's sync tomorrow",
      lastMessageAt: new Date(Date.now() - 3600000),
      unreadCounts: { [dr._id.toString()]: 0 },
   });

   console.log("✅ Conversations created");

   // =========================================
   // CREATE MESSAGES
   // =========================================
   console.log("📨 Creating messages...");

   await Message.create([
      {
         conversationId: conv1._id,
         senderId: spaceExTeam._id,
         text: "Welcome to Space-Ex! 🚀\n\nYou're only 4 steps away from launching your first business:\n\n1. Create your business profile\n2. Set up your products\n3. Configure payments\n4. Invite your first customer",
      },
      {
         conversationId: conv1._id,
         senderId: spaceExTeam._id,
         text: "Need help getting started? Just reply to this chat and our team will assist you. We typically respond within minutes.",
      },
      {
         conversationId: conv1._id,
         senderId: spaceExTeam._id,
         text: "We're excited to see what you build! ✨",
      },
      {
         conversationId: conv2._id,
         senderId: sarah._id,
         text: "Hey! Have you had a chance to review the proposal?",
      },
      {
         conversationId: conv2._id,
         senderId: dr._id,
         text: "Yes, looks great! Let's discuss tomorrow.",
      },
      {
         conversationId: conv2._id,
         senderId: sarah._id,
         text: "Sounds good, let's sync tomorrow",
      },
   ]);

   console.log("✅ Messages created");

   // =========================================
   // CREATE SUPPORT CHATS
   // =========================================
   console.log("💬 Creating support chats...");

   await SupportChat.create([
      {
         businessId: spaceExBiz._id,
         memberId: sarah._id,
         memberName: "Sarah Jenkins",
         memberEmail: "sarah@test.com",
         memberAvatar: "S",
         lastMessage: "Thanks for the quick reply!",
         lastMessageAt: new Date(Date.now() - 10 * 60 * 1000),
         unreadForAdmin: 1,
         status: "open",
         messages: [
            {
               senderId: sarah._id,
               senderName: "Sarah Jenkins",
               senderRole: "member",
               text: "Hi, I have a question about my Pro membership renewal.",
               createdAt: new Date(Date.now() - 30 * 60 * 1000),
            },
            {
               senderId: dr._id,
               senderName: "Admin",
               senderRole: "admin",
               text: "Sure! What would you like to know?",
               createdAt: new Date(Date.now() - 20 * 60 * 1000),
            },
            {
               senderId: sarah._id,
               senderName: "Sarah Jenkins",
               senderRole: "member",
               text: "Thanks for the quick reply!",
               createdAt: new Date(Date.now() - 10 * 60 * 1000),
            },
         ],
      },
      {
         businessId: spaceExBiz._id,
         memberId: alex._id,
         memberName: "Alex Ventures",
         memberEmail: "alex@ventures.com",
         memberAvatar: "A",
         lastMessage: "Can you help me with the checkout flow?",
         lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
         unreadForAdmin: 0,
         status: "open",
         messages: [
            {
               senderId: alex._id,
               senderName: "Alex Ventures",
               senderRole: "member",
               text: "Can you help me with the checkout flow?",
               createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
         ],
      },
   ]);

   console.log("✅ Support chats created");

   // =========================================
   // CREATE NOTIFICATIONS
   // =========================================
   console.log("🔔 Creating notifications...");

   await Notification.create([
      {
         userId: dr._id,
         kind: "system",
         title: "Welcome to Space-Ex! 🎉",
         body: "Your account is ready. Start by creating your first business.",
         href: "/business",
         read: false,
      },
      {
         userId: dr._id,
         kind: "follow",
         title: "Sarah Jenkins followed you",
         body: "Sarah Jenkins is now following your activity on Space-Ex.",
         href: "/profile/sarahj",
         read: true,
         actorId: sarah._id,
      },
      {
         userId: dr._id,
         kind: "system",
         title: "Your business is live 🚀",
         body: "Space/Ex is now visible on the marketplace.",
         href: "/business",
         read: true,
      },
   ]);

   console.log("✅ Notifications created");

   // =========================================
   // CREATE ORDERS
   // =========================================
   console.log("📦 Creating orders...");

   await Order.create([
      {
         userId: dr._id,
         productName: "Economic Intelligence Early Access",
         productImage: "EI",
         amount: 0,
         currency: "USD",
         status: "completed",
         isWaitlist: true,
         notes: "Free · Joined " + new Date().toLocaleDateString(),
      },
      {
         userId: dr._id,
         productName: "Space-Ex Pro Membership",
         productImage: "SP",
         amount: 49,
         currency: "USD",
         status: "completed",
         isWaitlist: false,
         notes: "Monthly subscription",
      },
   ]);

   console.log("✅ Orders created");

   // =========================================
   // CREATE PARTNER REQUESTS
   // =========================================
   console.log("🤝 Creating partner requests...");

   await PartnerRequest.create([
      {
         userId: dr._id,
         partnerName: "Alex Ventures",
         partnerAvatar: "AV",
         message:
            "Hey! I referred you to Space-Ex. Would love to be your partner.",
         status: "pending",
      },
      {
         userId: dr._id,
         partnerName: "Growth Labs",
         partnerAvatar: "GL",
         message: "We'd love to collaborate on a joint campaign.",
         status: "declined",
      },
   ]);

   console.log("✅ Partner requests created");

   // =========================================
   // CREATE TEAM INVITES
   // =========================================
   console.log("📬 Creating team invites...");

   await TeamInvite.create([
      {
         userId: dr._id,
         companyName: "Nova Labs",
         companyAvatar: "NL",
         invitedBy: "Sarah Jenkins",
         role: "Admin",
         status: "pending",
      },
      {
         userId: dr._id,
         companyName: "Apex Studio",
         companyAvatar: "AS",
         invitedBy: "Michael Chen",
         role: "Member",
         status: "pending",
      },
   ]);

   console.log("✅ Team invites created");

   // =========================================
   // CREATE TEAM MEMBERS
   // =========================================
   console.log("👥 Creating team members...");

   await TeamMember.create([
      {
         businessId: spaceExBiz._id,
         userId: dr._id,
         name: "Dr. Zakarinović",
         email: "www.lord5566@gmail.com",
         avatar: "DZ",
         role: "owner",
         auth: "one-step",
         pay: "pay",
         status: "active",
      },
   ]);

   console.log("✅ Team members created");

   // =========================================
   // CREATE PAYMENT METHODS
   // =========================================
   console.log("💳 Creating payment methods...");

   await PaymentMethod.create([
      {
         userId: dr._id,
         brand: "Visa",
         last4: "4242",
         expiry: "12/27",
         holderName: "Dr. Zakarinović",
         country: "United Arab Emirates",
         addressLine1: "123 Marina Walk",
         isDefault: true,
      },
      {
         userId: dr._id,
         brand: "Mastercard",
         last4: "8888",
         expiry: "08/26",
         holderName: "Dr. Zakarinović",
         country: "United Arab Emirates",
         addressLine1: "123 Marina Walk",
         isDefault: false,
      },
   ]);

   console.log("✅ Payment methods created");

   // =========================================
   // CREATE RESOLUTION CASES
   // =========================================
   console.log("🎫 Creating resolution cases...");

   await ResolutionCase.create([
      {
         userId: dr._id,
         product: "Space-Ex Pro Membership",
         amount: 49,
         dueDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
         ).toLocaleDateString(),
         status: "open",
         description: "Customer reported a duplicate charge",
      },
      {
         userId: dr._id,
         product: "Starter Course",
         amount: 99,
         dueDate: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
         ).toLocaleDateString(),
         status: "resolved",
         description: "Refund processed successfully",
      },
   ]);

   console.log("✅ Resolution cases created");

   // =========================================
   // CREATE INVOICES
   // =========================================
   console.log("📄 Creating invoices...");

   await Invoice.create([
      {
         businessId: spaceExBiz._id,
         createdBy: dr._id,
         number: "INV-000001",
         customerName: "John Smith",
         customerEmail: "john@example.com",
         product: "Pro Membership",
         pricingType: "one-time",
         price: 49,
         currency: "USD",
         status: "sent",
         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
         description: "Monthly Pro Membership",
         subtotal: 49,
         total: 49,
      },
   ]);

   console.log("✅ Invoices created");

   // =========================================
   // CREATE PROMO CODES
   // =========================================
   console.log("🎫 Creating promo codes...");

   await PromoCode.create([
      {
         businessId: spaceExBiz._id,
         code: "WELCOME10",
         discount: 10,
         discountType: "percentage",
         discountDuration: "once",
         eligibleUsers: "new_customers",
         status: "active",
         onePerUser: true,
         uses: 12,
      },
      {
         businessId: spaceExBiz._id,
         code: "SUMMER_SALE",
         discount: 25,
         discountType: "percentage",
         discountDuration: "forever",
         eligibleUsers: "everyone",
         status: "active",
         onePerUser: true,
         uses: 34,
      },
   ]);

   console.log("✅ Promo codes created");

   // =========================================
   // CREATE SUB ACCOUNTS
   // =========================================
   console.log("🏢 Creating sub accounts...");

   await SubAccount.create([
      {
         parentBusinessId: spaceExBiz._id,
         createdBy: dr._id,
         accountName: "Acme Trading",
         email: "seller@example.com",
         kind: "marketplace_sellers",
         status: "pending",
         kycStatus: "not_started",
      },
   ]);

   console.log("✅ Sub accounts created");

   // =========================================
   // APP STORE LISTINGS
   // =========================================
   console.log("🏪 Creating app store listings...");

   await AppListing.create([
      {
         slug: "digital-products-ai",
         name: "Digital Products AI",
         tagline: "Create your entire offer & product in less than 10 minutes.",
         description: "AI-powered product creation",
         category: "ecommerce",
         iconColor: "#f97316",
         iconEmoji: "🧠",
         price: 0,
         rating: 5,
         reviewCount: 35,
         installs: 3200,
         installsRange: "3.2k+",
      },
      {
         slug: "dashboard-agent",
         name: "Dashboard Agent",
         tagline: "An AI agent for managing your Whop business.",
         description: "AI agent management",
         category: "ai",
         iconColor: "#ef4444",
         iconEmoji: "🤖",
         price: 0,
         rating: 5,
         reviewCount: 18,
         installs: 1800,
         installsRange: "1.8k+",
      },
      {
         slug: "email-marketing",
         name: "Email Marketing & Automations",
         tagline:
            "Recover failed payments, win back cancelled members, and email.",
         description: "Email automations",
         category: "marketing",
         iconColor: "#3b82f6",
         iconEmoji: "📧",
         price: 0,
         rating: 5,
         reviewCount: 9,
         installs: 41200,
         installsRange: "41.2k+",
      },
      {
         slug: "post-purchase-upsell",
         name: "Post Purchase Upsell",
         tagline: "Increase AOV with One-Click upsells",
         description: "Upsell builder",
         category: "sales-crm",
         iconColor: "#f43f5e",
         iconEmoji: "🛒",
         price: 0,
         rating: 5,
         reviewCount: 1,
         installs: 890,
         installsRange: "890+",
      },
      {
         slug: "automations",
         name: "Automations",
         tagline: "Send emails and create workflows (replaces Zapier and N8N)",
         description: "No-code workflows",
         category: "business",
         iconColor: "#6366f1",
         iconEmoji: "⚙️",
         price: 0,
         rating: 5,
         reviewCount: 14,
         installs: 2400,
         installsRange: "2.4k+",
      },
      {
         slug: "drops",
         name: "Drops - Instant Paid Links",
         tagline: "Turn posts into paid links",
         description: "Instant paid links",
         category: "marketing",
         iconColor: "#eab308",
         iconEmoji: "⚡",
         price: 0,
         rating: 5,
         reviewCount: 7,
         installs: 1400,
         installsRange: "1.4k+",
      },
      {
         slug: "sendo",
         name: "Sendo - Email & Support Chats",
         tagline: "Send email, DMs and support chats to your Whop members",
         description: "Support chats",
         category: "support",
         iconColor: "#14b8a6",
         iconEmoji: "💬",
         price: 0,
         rating: 5,
         reviewCount: 4,
         installs: 620,
         installsRange: "620+",
      },
      {
         slug: "app-ads",
         name: "App Ads - Ads in Whop Apps",
         tagline:
            "Advertise inside Whop Apps or make money placing ads inside your own app",
         description: "In-app ads",
         category: "marketing",
         iconColor: "#f59e0b",
         iconEmoji: "📢",
         price: 0,
         rating: 5,
         reviewCount: 3,
         installs: 410,
         installsRange: "410+",
      },
      {
         slug: "whop-fulfillment",
         name: "Whop Fulfillment",
         tagline:
            "Push orders to any supplier and get tracking back automatically.",
         description: "Auto fulfillment",
         category: "business",
         iconColor: "#8b5cf6",
         iconEmoji: "📦",
         price: 0,
         rating: 5,
         reviewCount: 6,
         installs: 780,
         installsRange: "780+",
      },
      {
         slug: "formify",
         name: "Formify",
         tagline:
            "The easiest way to create beautiful forms and surveys for your business",
         description: "Form builder",
         category: "business",
         iconColor: "#0ea5e9",
         iconEmoji: "📝",
         price: 0,
         rating: 5,
         reviewCount: 11,
         installs: 1200,
         installsRange: "1.2k+",
      },
      {
         slug: "super-closer",
         name: "Super Closer",
         tagline:
            "The sales CRM built for high-ticket closers. Track your pipeline.",
         description: "High-ticket CRM",
         category: "sales-crm",
         iconColor: "#3b82f6",
         iconEmoji: "🎯",
         price: 0,
         rating: 5,
         reviewCount: 1,
         installs: 340,
         installsRange: "340+",
      },
      {
         slug: "tracking-links",
         name: "Tracking Links",
         tagline:
            "Call funnels & Custom Checkouts with tracking. Custom embeds.",
         description: "Custom tracking",
         category: "business",
         iconColor: "#a855f7",
         iconEmoji: "🔗",
         price: 0,
         rating: 5,
         reviewCount: 4,
         installs: 290,
         installsRange: "290+",
      },
      {
         slug: "subscription-analytics",
         name: "Subscription Analytics",
         tagline:
            "The #1 analytics dashboard for Whop subscription businesses.",
         description: "Subscription metrics",
         category: "business",
         iconColor: "#f97316",
         iconEmoji: "📊",
         price: 0,
         rating: 5,
         reviewCount: 0,
         installs: 220,
         installsRange: "220+",
      },
      {
         slug: "start-llc",
         name: "Start your LLC | doola",
         tagline: "LLC Formation, Business Bank Account, Bookkeeping, Taxes.",
         description: "LLC formation",
         category: "business",
         iconColor: "#eab308",
         iconEmoji: "💼",
         price: 0,
         rating: 5,
         reviewCount: 8,
         installs: 890,
         installsRange: "890+",
      },
      {
         slug: "rejoin",
         name: "Rejoin - Revenue Recovery",
         tagline: "Recover churned members automatically with branded winback.",
         description: "Churn recovery",
         category: "marketing",
         iconColor: "#10b981",
         iconEmoji: "♻️",
         price: 0,
         rating: 5,
         reviewCount: 5,
         installs: 560,
         installsRange: "560+",
      },
      {
         slug: "quickbooks-sync",
         name: "QuickBooks Sync",
         tagline: "Two way sync between Whop and QuickBooks Online. Invoices.",
         description: "QuickBooks integration",
         category: "finance",
         iconColor: "#22c55e",
         iconEmoji: "📗",
         price: 0,
         rating: 5,
         reviewCount: 2,
         installs: 320,
         installsRange: "320+",
      },
      {
         slug: "checkout-builder",
         name: "Checkout Builder",
         tagline: "Create custom checkout links with product upsells",
         description: "Checkout customization",
         category: "finance",
         iconColor: "#3b82f6",
         iconEmoji: "🛒",
         price: 0,
         rating: 5,
         reviewCount: 1,
         installs: 460,
         installsRange: "460+",
      },
      {
         slug: "signer",
         name: "Signer",
         tagline: "Create custom contract forms",
         description: "Digital signatures",
         category: "finance",
         iconColor: "#06b6d4",
         iconEmoji: "✍️",
         price: 0,
         rating: 5,
         reviewCount: 2,
         installs: 280,
         installsRange: "280+",
      },
      {
         slug: "contracts",
         name: "Contracts",
         tagline:
            "Create contracts, collect signatures and payments, and automate.",
         description: "Contract management",
         category: "finance",
         iconColor: "#6366f1",
         iconEmoji: "📄",
         price: 0,
         rating: 5,
         reviewCount: 2,
         installs: 210,
         installsRange: "210+",
      },
      {
         slug: "lobuly",
         name: "Lobuly AI Support",
         tagline: "AI FAQ bot and live chat support for Whop communities.",
         description: "AI live chat support",
         category: "support",
         iconColor: "#a855f7",
         iconEmoji: "💬",
         price: 0,
         rating: 5,
         reviewCount: 12,
         installs: 640,
         installsRange: "640+",
      },
      {
         slug: "ticketeo",
         name: "Ticketeo - AI Support Tickets",
         tagline: "Your AI agent for Whop support tickets",
         description: "AI ticket support",
         category: "support",
         iconColor: "#ef4444",
         iconEmoji: "🎫",
         price: 0,
         rating: 5,
         reviewCount: 3,
         installs: 380,
         installsRange: "380+",
      },
   ]);

   console.log("✅ App store listings created");

   // =========================================
   // DISCOVER CONTENT REWARDS CAMPAIGNS
   // =========================================
   console.log("🎬 Creating discover campaigns...");

   const PREVIEW_IMAGES = [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=250&fit=crop",
   ];

   const CAMPAIGN_DATA = [
      {
         title: "Backyard Breaks [Clipping Campaign]",
         category: "Entertainment",
         budget: 49500,
         raised: 60200,
         cpm: 21,
         duration: "3mo",
         brand: "ClipHouse",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "ForgeGUI Clipping [Roblox]",
         category: "Gaming",
         budget: 167600,
         raised: 189700,
         cpm: 1,
         duration: "5mo",
         brand: "BloxClips",
         socials: ["youtube", "tiktok"],
         featured: true,
      },
      {
         title: "FR Yomi Denzel Campagne Principale",
         category: "Business",
         budget: 272700,
         raised: 277400,
         cpm: 1,
         duration: "10mo",
         brand: "ml Denzel Clipping",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "HardScope x ClipFarm",
         category: "Entertainment",
         budget: 2500,
         raised: 13100,
         cpm: 1,
         duration: "1w",
         brand: "Clip Farm",
         socials: ["youtube", "x", "tiktok"],
      },
      {
         title: "... All I Got | Multi Edit Type Campaign",
         category: "Music",
         budget: 70,
         raised: 1000,
         cpm: 1,
         duration: "3w",
         brand: "Artist Influence",
         socials: ["tiktok"],
      },
      {
         title: "Shuffle Streamers - Clipping",
         category: "Gaming",
         budget: 12100,
         raised: 25000,
         cpm: 1,
         duration: "2w",
         brand: "Shuffle Clipping",
         socials: ["youtube", "x", "tiktok"],
      },
      {
         title: "Michael Sartain's Clipping Army",
         category: "Business",
         budget: 6700,
         raised: 10000,
         cpm: 2,
         duration: "2mo",
         brand: "S Clipper Army",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "Jacques Amoako x EAT",
         category: "Entertainment",
         budget: 926,
         raised: 1070,
         cpm: 1,
         duration: "2mo",
         brand: "Maison D'elite",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "Alpha Futures Clipping Campaign",
         category: "Business",
         budget: 9100,
         raised: 2000,
         cpm: 2,
         duration: "3mo",
         brand: "Click Culture",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "ARZ Urus Clipping Campaign",
         category: "Entertainment",
         budget: 1100,
         raised: 1500,
         cpm: 1,
         duration: "1mo",
         brand: "Arz Urus Clipping",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "... Mini Mixed Capsule Clipping [VIRAL]",
         category: "Entertainment",
         budget: 10700,
         raised: 9090,
         cpm: 0,
         duration: "2w",
         brand: "Clip Influence",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "WatchMeWin Clipping",
         category: "Gaming",
         budget: 21600,
         raised: 20000,
         cpm: 0,
         duration: "7mo",
         brand: "WMW CLIPPING",
         socials: ["youtube"],
      },
      {
         title: "TJR $23,100 Weekly Clipping Campaign",
         category: "Music",
         budget: 6200,
         raised: 23100,
         cpm: 1,
         duration: "5d",
         brand: "Reach",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "...AGON MMA | $7,500 Budget | $1 CPM",
         category: "Sports",
         budget: 4700,
         raised: 7500,
         cpm: 1,
         duration: "1w",
         brand: "Clipping Outlaws",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "Elo Cooking Slideshows Campaign",
         category: "Entertainment",
         budget: 5700,
         raised: 8800,
         cpm: 1,
         duration: "2mo",
         brand: "Clip Track",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "Santa Cruz Medicinals Clipping",
         category: "Entertainment",
         budget: 4200,
         raised: 9900,
         cpm: 1,
         duration: "2w",
         brand: "VitaClip",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "...ble Clipping | $9K Budget | $1.25 CPM",
         category: "Gaming",
         budget: 7500,
         raised: 12500,
         cpm: 1,
         duration: "1mo",
         brand: "Clipix",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "COINBASE x VALORANT",
         category: "Gaming",
         budget: 5300,
         raised: 10000,
         cpm: 1,
         duration: "2w",
         brand: "ClipHaus",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "...s Hablando - 1$ por cada 1000 vistas",
         category: "Entertainment",
         budget: 5400,
         raised: 10000,
         cpm: 1,
         duration: "1w",
         brand: "Carlos Esparraga Clipping",
         socials: ["tiktok"],
      },
      {
         title: "Magic Sort | $1 CPM",
         category: "Gaming",
         budget: 468,
         raised: 1000,
         cpm: 1,
         duration: "5d",
         brand: "VOLUM",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "POST THIRST TRAP VIDEOS [$5 EASY]",
         category: "Entertainment",
         budget: 972,
         raised: 25000,
         cpm: 1,
         duration: "2w",
         brand: "Duetti",
         socials: ["tiktok"],
      },
      {
         title: "...Like a Remedy | Audio Only Campaign",
         category: "Music",
         budget: 130,
         raised: 50000,
         cpm: 1,
         duration: "1w",
         brand: "Music Promo Clippers",
         socials: ["youtube", "x", "tiktok"],
      },
      {
         title: "Kaa2ty Streamer Clipping",
         category: "Gaming",
         budget: 982,
         raised: 2000,
         cpm: 1,
         duration: "1mo",
         brand: "Funnel Clips Community",
         socials: ["youtube", "tiktok"],
      },
      {
         title: "Clipback: $CLIP",
         category: "Gaming",
         budget: 1800,
         raised: 3500,
         cpm: 1,
         duration: "2w",
         brand: "Clipback Limited",
         socials: ["youtube", "x", "tiktok"],
      },
   ];

   await DiscoverCampaign.create(
      CAMPAIGN_DATA.map((c, i) => ({
         slug:
            c.title
               .toLowerCase()
               .replace(/[^\w\s-]/g, "")
               .replace(/\s+/g, "-")
               .slice(0, 50) +
            "-" +
            i,
         title: c.title,
         subtitle: "",
         category: c.category,
         previewImage: PREVIEW_IMAGES[i % PREVIEW_IMAGES.length],
         heroImage: "",
         brandName: c.brand,
         brandAvatar: c.brand.charAt(0).toUpperCase(),
         brandVerified: true,
         socials: c.socials as any,
         budget: c.budget,
         raised: c.raised,
         cpm: c.cpm,
         totalEarned: c.raised,
         status: "active",
         duration: c.duration,
         ageRestricted: false,
         featured: c.featured || false,
         createdBy: dr._id,
         businessId: spaceExBiz._id,
      })),
   );

   console.log(`✅ ${CAMPAIGN_DATA.length} discover campaigns created`);

   // =========================================
   // SUMMARY
   // =========================================
   console.log("\n" + "=".repeat(60));
   console.log("✅ SEEDED SUCCESSFULLY");
   console.log("=".repeat(60) + "\n");

   console.log("📋 Demo accounts:\n");
   console.log("   👤 Dr. Zakarinović (main user)");
   console.log("      📧 dr@spaceex.com     🔑 password123");
   console.log("      Username: @wwwlord\n");
   console.log("   🤖 Space-Ex Team (bot)");
   console.log("      📧 team@space-ex.com  🔑 randompassword");
   console.log("      Username: @spaceex\n");
   console.log("   👥 Other accounts");
   console.log("      📧 sarah@test.com     🔑 randompassword");
   console.log("      📧 alex@ventures.com  🔑 randompassword\n");

   console.log("📊 Data summary:\n");
   console.log("   • 4 users");
   console.log("   • 1 business (Space/Ex)");
   console.log("   • 4 products");
   console.log("   • 3 customers");
   console.log("   • 2 memberships");
   console.log("   • 2 people/visitors");
   console.log(`   • 8 transactions (Balance: $${balance.toFixed(2)})`);
   console.log("   • 6 payments");
   console.log("   • 1 checkout link");
   console.log("   • 1 website");
   console.log("   • 5 live events");
   console.log("   • 3 ad campaigns + settings");
   console.log("   • 2 affiliates + settings");
   console.log("   • 4 follows");
   console.log("   • 4 posts in Townhall");
   console.log("   • 2 conversations + 6 messages");
   console.log("   • 2 support chats");
   console.log("   • 3 notifications");
   console.log("   • 2 orders");
   console.log("   • 2 partner requests");
   console.log("   • 2 team invites");
   console.log("   • 1 team member (owner)");
   console.log("   • 2 payment methods");
   console.log("   • 2 resolution cases");
   console.log("   • 1 invoice");
   console.log("   • 2 promo codes");
   console.log("   • 1 sub account");
   console.log("   • 21 app store listings");
   console.log(`   • ${CAMPAIGN_DATA.length} discover campaigns\n`);

   console.log("🎯 Next steps:\n");
   console.log("   1. Start the dev server:  npm run dev");
   console.log("   2. Visit:  http://localhost:3000/login");
   console.log("   3. Log in with:  dr@spaceex.com / password123\n");
   console.log(
      "   💡 Try: /business (dashboard) · /discover (content rewards)\n",
   );

   await mongoose.disconnect();
   console.log("🔌 Disconnected");
}

seed().catch((e) => {
   console.error("\n❌ Seed failed:", e);
   process.exit(1);
});
