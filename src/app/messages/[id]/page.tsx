"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";
import { Conversation } from "../../lib/types";
import styles from "../messages.module.css";

export default function ConversationPage() {
   const params = useParams();
   const id = params.id as string;
   const [conversation, setConversation] = useState<Conversation | null>(null);
   const [input, setInput] = useState("");
   const [sending, setSending] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (id) loadConversation();
   }, [id]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [conversation?.messages]);

   const loadConversation = async () => {
      const res = await fetch(`/api/messages/${id}`);
      if (res.ok) setConversation(await res.json());
   };

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || sending) return;
      setSending(true);
      const res = await fetch("/api/messages", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ conversationId: id, text: input }),
      });
      if (res.ok) {
         setInput("");
         await loadConversation();
      }
      setSending(false);
   };

   if (!conversation) return <div className={styles.loading}>Loading...</div>;

   return (
      <div className={styles.chatView}>
         {/* Header */}
         <div className={styles.chatHeader}>
            <div className={styles.convAvatar}>{conversation.avatar}</div>
            <div>
               <div className={styles.chatName}>
                  {conversation.name}{" "}
                  {conversation.verified && (
                     <span className={styles.verified}>✓</span>
                  )}
               </div>
            </div>
         </div>

         {/* Messages */}
         <div className={styles.chatMessages}>
            {conversation.messages.map((m, i) => (
               <div
                  key={m.id}
                  className={`${styles.messageRow} ${m.sender === "me" ? styles.messageRowMe : ""}`}
               >
                  {m.sender === "them" && (
                     <div className={styles.messageAvatar}>
                        {conversation.avatar}
                     </div>
                  )}
                  <div className={styles.messageBubble}>
                     <div className={styles.messageMeta}>
                        {m.sender === "them" ? conversation.name : "You"} ·{" "}
                        {m.timestamp}
                     </div>
                     <div className={styles.messageText}>{m.text}</div>
                  </div>
               </div>
            ))}
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
