import mongoose from "mongoose";
import crypto from "crypto";
import User from "../src/app/lib/models/User";
import Conversation from "../src/app/lib/models/Conversation";
import Message from "../src/app/lib/models/Message";
import Notification from "../src/app/lib/models/Notification";

function hashPassword(password: string): string {
   const salt = crypto.randomBytes(16).toString("hex");
   const hash = crypto.scryptSync(password, salt, 64).toString("hex");
   return `${salt}:${hash}`;
}

async function seed() {
   const uri = process.env.MONGODB_URI;

   if (!uri) {
      console.error("❌ MONGODB_URI is not defined");
      process.exit(1);
   }

   console.log("🔌 Connecting to MongoDB...");
   await mongoose.connect(uri);
   console.log("✅ Connected");

   console.log("🧹 Clearing existing data...");
   await User.deleteMany({});
   await Conversation.deleteMany({});
   await Message.deleteMany({});
   await Notification.deleteMany({});

   console.log("👤 Creating users...");
   const dr = await User.create({
      name: "Dr. Zakarinović",
      email: "dr@spaceex.com",
      passwordHash: hashPassword("password123"),
   });

   // ✅ Renamed from "Team Whop" to "Space-Ex Team"
   const spaceExTeam = await User.create({
      name: "Space-Ex Team",
      email: "team@space-ex.com",
      passwordHash: hashPassword("randompassword"),
      avatarColor: "#3b82f6",
   });

   const sarah = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@test.com",
      passwordHash: hashPassword("randompassword"),
   });

   console.log("💬 Creating conversations...");
   const conv1 = await Conversation.create({
      participants: [dr._id, spaceExTeam._id],
      lastMessage: "We're excited to see what you build!",
      lastMessageAt: new Date(),
      unreadCounts: { [dr._id.toString()]: 1 },
   });

   const conv2 = await Conversation.create({
      participants: [dr._id, sarah._id],
      lastMessage: "Sounds good, let's sync tomorrow",
      lastMessageAt: new Date(Date.now() - 3600000),
      unreadCounts: { [dr._id.toString()]: 0 },
   });

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

   console.log("🔔 Creating welcome notification...");
   await Notification.create({
      userId: dr._id,
      kind: "system",
      title: "Welcome to Space-Ex! 🎉",
      body: "Your account is ready. Start by creating your first business.",
      href: "/business",
      read: false,
   });

   console.log("\n✅ Seeded successfully!\n");
   console.log("📋 Demo accounts:");
   console.log("   📧 dr@spaceex.com     🔑 password123");
   console.log("   📧 team@space-ex.com  🔑 randompassword");
   console.log("   📧 sarah@test.com     🔑 randompassword\n");

   await mongoose.disconnect();
   console.log("🔌 Disconnected");
}

seed().catch((e) => {
   console.error("❌ Seed failed:", e);
   process.exit(1);
});
