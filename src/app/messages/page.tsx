"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit } from "lucide-react";
import styles from "./messages.module.css";

// =========================================
// TYPES
// =========================================
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

export default function MessagesPage() {
   const [conversations, setConversations] = useState<ConversationSummary[]>(
      [],
   );
   const [filter, setFilter] = useState<"unread" | "requests">("unread");
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true);
      fetch("/api/messages")
         .then((r) => r.json())
         .then((data) => {
            // ✅ FIX: API returns { conversations: [...] }
            setConversations(
               Array.isArray(data.conversations) ? data.conversations : [],
            );
         })
         .catch(() => setConversations([]))
         .finally(() => setLoading(false));
   }, []);

   // Client-side filtering
   const filtered = conversations.filter((c) => {
      if (filter === "unread" && c.unread === 0) return false;
      if (filter === "requests" && !c.isRequest) return false;
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
      <div className={styles.messagesLayout}>
         <aside className={styles.convList}>
            <div className={styles.convSearch}>
               <Search size={16} className={styles.convSearchIcon} />
               <input
                  placeholder="Search..."
                  className={styles.convSearchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
               <Edit size={16} className={styles.convSearchEdit} />
            </div>

            <div className={styles.convFilters}>
               <button
                  className={`${styles.filterBtn} ${filter === "unread" ? styles.filterActive : ""}`}
                  onClick={() => setFilter("unread")}
               >
                  Unread
               </button>
               <button
                  className={`${styles.filterBtn} ${filter === "requests" ? styles.filterActive : ""}`}
                  onClick={() => setFilter("requests")}
               >
                  Requests
               </button>
            </div>

            <div className={styles.convItems}>
               {loading ? (
                  <div className={styles.emptyState}>Loading...</div>
               ) : filtered.length === 0 ? (
                  <div className={styles.emptyState}>
                     {filter === "unread"
                        ? "You're all caught up! 🎉"
                        : "No pending requests."}
                  </div>
               ) : (
                  filtered.map((c) => (
                     <Link
                        key={c.id}
                        href={`/messages/${c.id}`}
                        className={styles.convItem}
                     >
                        <div className={styles.convAvatar}>{c.avatar}</div>
                        <div className={styles.convInfo}>
                           <div className={styles.convHeader}>
                              <span className={styles.convName}>{c.name}</span>
                              <span className={styles.convTime}>
                                 {formatTime(c.timestamp)}
                              </span>
                           </div>
                           <div className={styles.convPreview}>
                              {c.lastMessage}
                           </div>
                        </div>
                        {c.unread > 0 && (
                           <div className={styles.unreadBadge}>{c.unread}</div>
                        )}
                     </Link>
                  ))
               )}
            </div>
         </aside>

         <div className={styles.emptyChat}>
            <div className={styles.emptyChatText}>
               Select a conversation to start chatting
            </div>
         </div>
      </div>
   );
}
