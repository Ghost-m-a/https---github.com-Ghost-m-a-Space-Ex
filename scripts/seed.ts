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

      twoFactor: {
         enabled: false,
         method: null,
      },

      wallet: {
         address: "",
         balance: 0,
         exported: false,
      },

      verification: {
         individual: "none",
         business: "none",
         payouts: "inactive",
         bankDeposits: "inactive",
      },
   });

   // Space-Ex Team (the bot account)
   const spaceExTeam = await User.create({
      name: "Space-Ex Team",
      email: "team@space-ex.com",
      username: "spaceex",
      passwordHash: hashPassword("randompassword"),
      bio: "Official Space-Ex support team. We're here to help 24/7.",
      avatarColor: "#3b82f6",
   });

   // Sarah Jenkins (friend account)
   const sarah = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@test.com",
      username: "sarahj",
      passwordHash: hashPassword("randompassword"),
      bio: "Marketing consultant & business strategist.",
      location: "London, UK",
      avatarColor: "#ec4899",
   });

   // Alex Ventures (partner account)
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

      invoices: {
         customPrefixEnabled: false,
         customPrefix: "",
      },

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
         description:
            "A 6-week step-by-step program. Includes video lessons, templates, and a community of founders.",
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
   // CREATE TRANSACTIONS
   // =========================================
   console.log("💸 Creating transactions...");

   const now = Date.now();
   const day = 24 * 60 * 60 * 1000;

   await Transaction.create([
      {
         businessId: spaceExBiz._id,
         kind: "deposit",
         amount: 500,
         status: "completed",
         description: "Initial funding",
         metadata: { method: "bank_transfer" },
         createdAt: new Date(now - 10 * day),
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
         createdAt: new Date(now - 8 * day),
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
         createdAt: new Date(now - 5 * day),
      },
      {
         businessId: spaceExBiz._id,
         kind: "card_spend",
         amount: 12.4,
         status: "completed",
         description: "Figma subscription",
         createdAt: new Date(now - 3 * day),
      },
      {
         businessId: spaceExBiz._id,
         kind: "ad_spend",
         amount: 85.0,
         status: "completed",
         description: "Meta Ads campaign",
         createdAt: new Date(now - 2 * day),
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
         createdAt: new Date(now - 1 * day),
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
         createdAt: new Date(now - 3 * 60 * 60 * 1000),
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
         createdAt: new Date(now - 1 * 60 * 60 * 1000),
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
   console.log("   • 4 products (Pro, Starter, Free, VIP)");
   console.log(`   • 8 transactions (Balance: $${balance.toFixed(2)})`);
   console.log("   • 1 website (space-ex.com, 1240 visits)");
   console.log("   • 5 live events");
   console.log("   • 2 conversations (Space-Ex Team + Sarah)");
   console.log("   • 6 messages");
   console.log("   • 3 notifications");
   console.log("   • 2 orders");
   console.log("   • 2 partner requests");
   console.log("   • 2 team invites");
   console.log("   • 2 payment methods");
   console.log("   • 2 resolution cases\n");

   console.log("🎯 Next steps:\n");
   console.log("   1. Start the dev server:  npm run dev");
   console.log("   2. Visit:  http://localhost:3000/login");
   console.log("   3. Log in with:  dr@spaceex.com / password123\n");
   console.log("   💡 Try Business mode (S avatar) → Products / Analytics\n");

   await mongoose.disconnect();
   console.log("🔌 Disconnected");
}

seed().catch((e) => {
   console.error("\n❌ Seed failed:", e);
   process.exit(1);
});
