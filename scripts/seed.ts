import "dotenv/config";
import mongoose from "mongoose";
import AppListing from "../src/models/AppListing";

async function seed() {
   const uri = process.env.MONGODB_URI;
   if (!uri) {
      console.error("❌ MONGODB_URI is not defined");
      process.exit(1);
   }

   console.log("🔌 Connecting to MongoDB...");
   await mongoose.connect(uri);
   console.log("✅ Connected");

   console.log("🧹 Clearing catalog...");
   await AppListing.deleteMany({});

   console.log("🏪 Seeding app store listings (catalog only)...");

   await AppListing.create([
      {
         slug: "digital-products-ai",
         name: "Digital Products AI",
         tagline: "Create your entire offer & product in less than 10 minutes.",
         description: "AI-powered product creation",
         category: "ecommerce",
         iconColor: "#f97316",
         iconEmoji: "🧠",
         rating: 5,
         reviewCount: 35,
         installs: 3200,
         installsRange: "3.2k+",
      },
      {
         slug: "dashboard-agent",
         name: "Dashboard Agent",
         tagline: "An AI agent for managing your business.",
         description: "AI agent management",
         category: "ai",
         iconColor: "#ef4444",
         iconEmoji: "🤖",
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
         rating: 5,
         reviewCount: 7,
         installs: 1400,
         installsRange: "1.4k+",
      },
      {
         slug: "sendo",
         name: "Sendo - Email & Support Chats",
         tagline: "Send email, DMs and support chats to your members",
         description: "Support chats",
         category: "support",
         iconColor: "#14b8a6",
         iconEmoji: "💬",
         rating: 5,
         reviewCount: 4,
         installs: 620,
         installsRange: "620+",
      },
      {
         slug: "app-ads",
         name: "App Ads - Ads in Apps",
         tagline:
            "Advertise inside apps or make money placing ads inside your own app",
         description: "In-app ads",
         category: "marketing",
         iconColor: "#f59e0b",
         iconEmoji: "📢",
         rating: 5,
         reviewCount: 3,
         installs: 410,
         installsRange: "410+",
      },
      {
         slug: "whop-fulfillment",
         name: "Fulfillment",
         tagline:
            "Push orders to any supplier and get tracking back automatically.",
         description: "Auto fulfillment",
         category: "business",
         iconColor: "#8b5cf6",
         iconEmoji: "📦",
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
         rating: 5,
         reviewCount: 4,
         installs: 290,
         installsRange: "290+",
      },
      {
         slug: "subscription-analytics",
         name: "Subscription Analytics",
         tagline: "The #1 analytics dashboard for subscription businesses.",
         description: "Subscription metrics",
         category: "business",
         iconColor: "#f97316",
         iconEmoji: "📊",
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
         rating: 5,
         reviewCount: 5,
         installs: 560,
         installsRange: "560+",
      },
      {
         slug: "quickbooks-sync",
         name: "QuickBooks Sync",
         tagline: "Two way sync between app and QuickBooks Online. Invoices.",
         description: "QuickBooks integration",
         category: "finance",
         iconColor: "#22c55e",
         iconEmoji: "📗",
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
         rating: 5,
         reviewCount: 2,
         installs: 210,
         installsRange: "210+",
      },
      {
         slug: "lobuly",
         name: "Lobuly AI Support",
         tagline: "AI FAQ bot and live chat support for communities.",
         description: "AI live chat support",
         category: "support",
         iconColor: "#a855f7",
         iconEmoji: "💬",
         rating: 5,
         reviewCount: 12,
         installs: 640,
         installsRange: "640+",
      },
      {
         slug: "ticketeo",
         name: "Ticketeo - AI Support Tickets",
         tagline: "Your AI agent for support tickets",
         description: "AI ticket support",
         category: "support",
         iconColor: "#ef4444",
         iconEmoji: "🎫",
         rating: 5,
         reviewCount: 3,
         installs: 380,
         installsRange: "380+",
      },
   ]);

   console.log("✅ App store listings seeded (catalog only)");
   console.log("ℹ️  No users, campaigns, or business data was created.");
   console.log("ℹ️  Sign up at /signup to create the first real account.");

   await mongoose.disconnect();
   console.log("🔌 Disconnected");
}

seed().catch((e) => {
   console.error("\n❌ Seed failed:", e);
   process.exit(1);
});
