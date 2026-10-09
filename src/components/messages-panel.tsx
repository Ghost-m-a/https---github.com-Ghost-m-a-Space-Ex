"use client";

import React, { useEffect, useState, useRef } from "react";
import {
   Search,
   Edit,
   CheckCircle2,
   Send,
   ChevronLeft,
   MoreVertical,
} from "lucide-react";
import SidePanel from "./side-panel";
import styles from "@/styles/components/panel.module.css";

interface ConversationSummary {
   id: string;
   name: string;
   email: string;
   avatar: string;
   lastMessage: string;
   timestamp: string;
   unread: number;
   isRequest: boolean;
}

interface Message {
   id: string;
   sender: "me" | "them";
   text: string;
   timestamp: string;
}

interface MessagesPanelProps {
   isOpen: boolean;
   onClose: () => void;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose }) => {
   const [conversations, setConversations] = useState<ConversationSummary[]>(
      [],
   );
   const [activeTab, setActiveTab] = useState<"unread" | "requests">("unread");
   const [search, setSearch] = useState("");
   const [activeConv, setActiveConv] = useState<string | null>(null);
   const [messages, setMessages] = useState<Message[]>([]);
   const [convMeta, setConvMeta] = useState<{
      name: string;
      avatar: string;
   } | null>(null);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [sending, setSending] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   // Load conversations
   useEffect(() => {
      if (!isOpen) return;
      fetch("/api/messages")
         .then((r) => r.json())
         .then((d) => setConversations(d.conversations || []))
         .catch(() => setConversations([]));
   }, [isOpen]);

   // Load specific conversation
   useEffect(() => {
      if (!activeConv) return;
      setLoading(true);
      fetch(`/api/messages/${activeConv}`)
         .then((r) => r.json())
         .then((d) => {
            setMessages(d.messages || []);
            setConvMeta(d.conversation || null);
         })
         .finally(() => setLoading(false));
   }, [activeConv]);

   // Scroll to bottom
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !activeConv || sending) return;

      const sentText = input.trim();
      setSending(true);
      setInput("");

      try {
         const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               conversationId: activeConv,
               text: sentText,
            }),
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

            // ✅ Refetch conversation twice to catch the bot reply
            // (bot responds ~800ms after)
            setTimeout(() => {
               fetch(`/api/messages/${activeConv}`)
                  .then((r) => r.json())
                  .then((d) => {
                     setMessages(Array.isArray(d.messages) ? d.messages : []);
                     setConvMeta(d.conversation || null);
                  })
                  .catch(() => {});
            }, 1200);
         }
      } finally {
         setSending(false);
      }
   };

   const filtered = conversations.filter((c) => {
      if (activeTab === "unread" && c.unread === 0) return false;
      if (activeTab === "requests" && !c.isRequest) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
         return false;
      return true;
   });

   const formatTime = (t: string) => {
      const d = new Date(t);
      const diff = Date.now() - d.getTime();
      if (diff < 60000) return "now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
   };

   return (
      <SidePanel
         isOpen={isOpen}
         onClose={onClose}
         title={activeConv ? "" : "Messages"}
      >
         {!activeConv ? (
            // ==================== LIST VIEW ====================
            <div className={styles.listView}>
               <div className={styles.searchWrap}>
                  <Search size={16} />
                  <input
                     className={styles.searchInput}
                     placeholder="Search..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                     className={styles.composeBtn}
                     aria-label="New message"
                  >
                     <Edit size={16} />
                  </button>
               </div>

               <div className={styles.tabs}>
                  <button
                     className={`${styles.tab} ${activeTab === "unread" ? styles.tabActive : ""}`}
                     onClick={() => setActiveTab("unread")}
                  >
                     Unread
                  </button>
                  <button
                     className={`${styles.tab} ${activeTab === "requests" ? styles.tabActive : ""}`}
                     onClick={() => setActiveTab("requests")}
                  >
                     Requests
                  </button>
               </div>

               <div className={styles.listScroll}>
                  {filtered.length === 0 ? (
                     <div className={styles.emptySmall}>
                        {activeTab === "unread"
                           ? "You're all caught up! 🎉"
                           : "No pending requests."}
                     </div>
                  ) : (
                     filtered.map((c) => (
                        <button
                           key={c.id}
                           className={styles.convItem}
                           onClick={() => setActiveConv(c.id)}
                        >
                           <div className={styles.convAvatar}>{c.avatar}</div>
                           <div className={styles.convInfo}>
                              <div className={styles.convTop}>
                                 <span className={styles.convName}>
                                    {c.name}
                                 </span>
                                 <span className={styles.convTime}>
                                    {formatTime(c.timestamp)}
                                 </span>
                              </div>
                              <div className={styles.convPreview}>
                                 {c.lastMessage}
                              </div>
                           </div>
                           {c.unread > 0 && (
                              <span className={styles.badge}>{c.unread}</span>
                           )}
                        </button>
                     ))
                  )}
               </div>
            </div>
         ) : (
            // ==================== CHAT VIEW ====================
            <div className={styles.chatView}>
               <div className={styles.chatHeader}>
                  <button
                     className={styles.iconBtn}
                     onClick={() => setActiveConv(null)}
                  >
                     <ChevronLeft size={18} />
                  </button>
                  <div className={styles.chatAvatar}>
                     {convMeta?.avatar || "?"}
                  </div>
                  <div className={styles.chatName}>
                     {convMeta?.name || "Loading..."}{" "}
                     <span className={styles.verifiedBadge}>✓</span>
                  </div>
                  <button className={styles.iconBtn}>
                     <MoreVertical size={16} />
                  </button>
               </div>

               <div className={styles.chatMessages}>
                  {loading ? (
                     <div className={styles.emptySmall}>
                        Loading messages...
                     </div>
                  ) : messages.length === 0 ? (
                     <div className={styles.emptySmall}>No messages yet.</div>
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
                                 {convMeta?.avatar}
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

               <div className={styles.officialNotice}>
                  <CheckCircle2 size={18} className={styles.officialIcon} />
                  <div>
                     <div className={styles.officialTitle}>
                        Official notification channel
                     </div>
                     <div className={styles.officialSubtitle}>
                        Whop will always use verified accounts to communicate
                        with you
                     </div>
                  </div>
               </div>

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
                     <Send size={16} />
                  </button>
               </form>
            </div>
         )}
      </SidePanel>
   );
};

export default MessagesPanel;
