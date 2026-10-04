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
      console.error(
         "❌ MONGODB_URI is not defined. Make sure it's set in .env.local",
      );
      console.error("   And that you run: npm run seed");
      console.error("   Which uses: tsx --env-file=.env.local scripts/seed.ts");
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

   const teamWhop = await User.create({
      name: "Team Whop",
      email: "team@whop.com",
      passwordHash: hashPassword("randompassword"),
   });

   const sarah = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@test.com",
      passwordHash: hashPassword("randompassword"),
   });

   console.log("💬 Creating conversations...");
   const conv1 = await Conversation.create({
      participants: [dr._id, teamWhop._id],
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
         senderId: teamWhop._id,
         text: "Welcome to Whop!\n\nThousands of internet entrepreneurs like you launch on Whop every day, and you're only 4 steps away from joining them:\n\n1. Add apps to your whop\n2. Design your store page\n3. Set up Whop Payments\n4. Invite your first user",
      },
      {
         conversationId: conv1._id,
         senderId: teamWhop._id,
         text: "If you've still got questions, head over to Whop University: https://whop.com/whop/. We run live sessions twice a day where you can drop in and ask anything.",
      },
      {
         conversationId: conv1._id,
         senderId: teamWhop._id,
         text: "We're excited to see what you build!",
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

   console.log("\n✅ Seeded successfully!\n");
   console.log("📋 Demo accounts:");
   console.log("   📧 dr@spaceex.com     🔑 password123");
   console.log("   📧 team@whop.com      🔑 randompassword");
   console.log("   📧 sarah@test.com     🔑 randompassword\n");

   await mongoose.disconnect();
   console.log("🔌 Disconnected");
}

seed().catch((e) => {
   console.error("❌ Seed failed:", e);
   process.exit(1);
});
