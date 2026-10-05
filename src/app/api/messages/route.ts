import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Conversation from "@/app/lib/models/Conversation";
import Message from "@/app/lib/models/Message";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

// =========================================
// SIMPLE CHATBOT RESPONSES
// =========================================
function generateBotReply(userMessage: string, userName: string): string {
   const msg = userMessage.toLowerCase().trim();

   // Greetings
   if (/^(hi|hello|hey|yo|sup)/.test(msg)) {
      return `Hey ${userName.split(" ")[0]}! 👋 How can we help you today?`;
   }

   // Thanks
   if (/thank|thanks|thx|appreciate/.test(msg)) {
      return "You're welcome! Let us know if there's anything else we can help with. 😊";
   }

   // Pricing / billing
   if (/price|pricing|cost|billing|pay|charge|fee/.test(msg)) {
      return "Our pricing starts at $0 for the free tier, and Premium plans start at $29/month.\n\nYou can see all plans at https://space-ex.com/pricing 📊";
   }

   // Business creation
   if (
      /business|create|launch|start/.test(msg) &&
      /how|help|where|can/.test(msg)
   ) {
      return 'To create a business:\n\n1. Click the **+** button in the sidebar\n2. Choose "I have a business" or "I want a business"\n3. Fill in your details\n\nWant me to walk you through it? 🚀';
   }

   // Products / sales
   if (/product|sell|sales|store/.test(msg)) {
      return "You can add products from your business dashboard → Products → New Product. We support one-time payments, subscriptions, and renewals. 💳";
   }

   // Help / support
   if (/help|support|issue|problem|bug|error/.test(msg)) {
      return "We're here to help! Can you describe what's happening?\n\nFor urgent issues you can also email support@space-ex.com 📧";
   }

   // Payment failures
   if (/payment|failed|declined|charge/.test(msg)) {
      return "Payment issues are usually resolved in a few hours. Check the customer's payment method and try again. If it persists, contact us. 💰";
   }

   // Analytics
   if (/analytics|stats|traffic|conversion|revenue/.test(msg)) {
      return "You'll find all your metrics in the Business → Analytics section. It shows revenue, orders, conversion rate, and more in real-time. 📈";
   }

   // Integrations
   if (/integrat|api|webhook|connect/.test(msg)) {
      return "We support integrations with Stripe, Shopify, Circle, Gumroad, and more. Check out the Apps section in your business dashboard. 🔌";
   }

   // Fallback
   const fallbacks = [
      `Got it! Let me look into that for you, ${userName.split(" ")[0]}. We'll follow up within a few minutes. 🙌`,
      "Thanks for reaching out! A human team member will respond shortly. In the meantime, feel free to explore the dashboard.",
      "Interesting question! We're checking on this. You'll get an answer in this chat very soon. ⏳",
      "Noted! Our team is on it. Anything else you'd like to add while we look into this?",
   ];
   return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// GET — list conversations
export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await connectDB();

      const conversations = await Conversation.find({
         participants: session.userId,
      })
         .sort({ lastMessageAt: -1 })
         .limit(50)
         .populate("participants", "name email")
         .lean();

      const enriched = conversations.map((c: any) => {
         const other = c.participants.find(
            (p: any) => p._id.toString() !== session.userId,
         );
         const unreadMap = c.unreadCounts || {};
         const unread = unreadMap[session.userId] || 0;
         return {
            id: c._id.toString(),
            name: other?.name || "Unknown",
            email: other?.email || "",
            avatar: other?.name?.charAt(0).toUpperCase() || "?",
            lastMessage: c.lastMessage,
            timestamp: c.lastMessageAt,
            unread,
            isRequest: c.isRequest,
         };
      });

      return NextResponse.json({ conversations: enriched });
   } catch (err) {
      console.error("[Messages GET]", err);
      return NextResponse.json({ conversations: [] });
   }
}

// POST — send message (+ bot auto-reply)
export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { conversationId, text } = await req.json();
      if (!conversationId || !text?.trim()) {
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      await connectDB();

      const conversation = await Conversation.findById(conversationId).populate(
         "participants",
         "name email",
      );
      if (!conversation) {
         return NextResponse.json(
            { error: "Conversation not found" },
            { status: 404 },
         );
      }
      if (
         !conversation.participants.some(
            (p: any) => p._id.toString() === session.userId,
         )
      ) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Save user's message
      const message = await Message.create({
         conversationId,
         senderId: session.userId,
         text: text.trim(),
      });

      conversation.lastMessage = text.trim();
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // ✅ Check if this conversation is with Space-Ex Team → trigger bot reply
      const other: any = conversation.participants.find(
         (p: any) => p._id.toString() !== session.userId,
      );

      const isTeamConversation =
         other?.email === "team@space-ex.com" ||
         other?.name === "Space-Ex Team";

      if (isTeamConversation && other) {
         // Fire-and-forget: schedule bot reply after a short delay
         setTimeout(async () => {
            try {
               const botText = generateBotReply(text, session.name || "there");

               await Message.create({
                  conversationId,
                  senderId: other._id,
                  text: botText,
               });

               await Conversation.findByIdAndUpdate(conversationId, {
                  lastMessage: botText,
                  lastMessageAt: new Date(),
                  $inc: { [`unreadCounts.${session.userId}`]: 1 },
               });
            } catch (e) {
               console.error("[Bot reply error]", e);
            }
         }, 800);
      }

      return NextResponse.json({
         message: {
            id: message._id.toString(),
            senderId: session.userId,
            text: message.text,
            createdAt: message.createdAt,
         },
      });
   } catch (err) {
      console.error("[Messages POST]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
