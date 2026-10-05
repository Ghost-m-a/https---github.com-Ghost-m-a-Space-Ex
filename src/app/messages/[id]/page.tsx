"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Send, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "../messages.module.css";

// =========================================
// TYPES
// =========================================
interface ConversationMeta {
   id: string;
   name: string;
   email: string;
   avatar: string;
}

interface MessageItem {
   id: string;
   sender: "me" | "them";
   text: string;
   timestamp: string;
}

export default function ConversationPage() {
   const params = useParams();
   const id = params.id as string;

   const [conversation, setConversation] = useState<ConversationMeta | null>(
      null,
   );
   const [messages, setMessages] = useState<MessageItem[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(true);
   const [sending, setSending] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   // Load conversation
   useEffect(() => {
      if (!id) return;
      setLoading(true);
      fetch(`/api/messages/${id}`)
         .then((r) => r.json())
         .then((data) => {
            // ✅ FIX: API returns { conversation, messages }
            setConversation(data.conversation || null);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
         })
         .catch(() => {
            setConversation(null);
            setMessages([]);
         })
         .finally(() => setLoading(false));
   }, [id]);

   // Auto-scroll to bottom
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || sending) return;

      const sentText = input.trim();
      setSending(true);
      setInput("");

      try {
         const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: id, text: sentText }),
         });

         if (res.ok) {
            const data = await res.json();
            setMessages((prev) => [
               ...prev,
               {
                  id: data.message.id,
                  sender: "me",
                  text: data.message.text,
                  timestamp: data.message.createdAt,
               },
            ]);

            // Refetch after bot delay
            setTimeout(async () => {
               const r = await fetch(`/api/messages/${id}`);
               const d = await r.json();
               setMessages(Array.isArray(d.messages) ? d.messages : []);
            }, 1200);
         }
      } finally {
         setSending(false);
      }
   };

   if (loading) {
      return <div className={styles.loading}>Loading conversation...</div>;
   }

   if (!conversation) {
      return (
         <div className={styles.loading}>
            Conversation not found.{" "}
            <Link href="/messages" style={{ color: "var(--accent-blue)" }}>
               Go back
            </Link>
         </div>
      );
   }

   return (
      <div className={styles.chatView}>
         {/* Header */}
         <div className={styles.chatHeader}>
            <Link href="/messages" className={styles.backBtn}>
               <ChevronLeft size={18} />
            </Link>
            <div className={styles.convAvatar}>{conversation.avatar}</div>
            <div>
               <div className={styles.chatName}>
                  {conversation.name} <span className={styles.verified}>✓</span>
               </div>
            </div>
         </div>

         {/* Messages */}
         <div className={styles.chatMessages}>
            {messages.length === 0 ? (
               <div className={styles.emptyChatText}>No messages yet.</div>
            ) : (
               messages.map((m) => (
                  <div
                     key={m.id}
                     className={`${styles.messageRow} ${
                        m.sender === "me" ? styles.messageRowMe : ""
                     }`}
                  >
                     {m.sender === "them" && (
                        <div className={styles.messageAvatar}>
                           {conversation.avatar}
                        </div>
                     )}
                     <div className={styles.messageBubble}>
                        <div className={styles.messageText}>{m.text}</div>
                     </div>
                  </div>
               ))
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Official Notice */}
         <div className={styles.officialNotice}>
            <CheckCircle2 size={20} className={styles.officialIcon} />
            <div>
               <div className={styles.officialTitle}>
                  This is the official Whop notification channel
               </div>
               <div className={styles.officialSubtitle}>
                  Whop will always use verified accounts to communicate with you
               </div>
            </div>
         </div>

         {/* Input */}
         <form className={styles.chatInput} onSubmit={handleSend}>
            <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Type a message..."
               className={styles.chatInputField}
            />
            <button
               type="submit"
               className={styles.sendBtn}
               disabled={!input.trim() || sending}
            >
               <Send size={18} />
            </button>
         </form>
      </div>
   );
}
