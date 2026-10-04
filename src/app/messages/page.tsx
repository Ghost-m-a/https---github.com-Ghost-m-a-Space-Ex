"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit, MoreHorizontal } from "lucide-react";
import { Conversation } from "../lib/types";
import styles from "./messages.module.css";

export default function MessagesPage() {
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [filter, setFilter] = useState<"unread" | "requests">("unread");

   useEffect(() => {
      fetch("/api/messages")
         .then((r) => r.json())
         .then(setConversations);
   }, []);

   return (
      <div className={styles.messagesLayout}>
         <aside className={styles.convList}>
            <div className={styles.convSearch}>
               <Search size={16} className={styles.convSearchIcon} />
               <input
                  placeholder="Search..."
                  className={styles.convSearchInput}
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
               {conversations.map((c) => (
                  <Link
                     key={c.id}
                     href={`/messages/${c.id}`}
                     className={styles.convItem}
                  >
                     <div className={styles.convAvatar}>{c.avatar}</div>
                     <div className={styles.convInfo}>
                        <div className={styles.convHeader}>
                           <span className={styles.convName}>
                              {c.name}{" "}
                              {c.verified && (
                                 <span className={styles.verified}>✓</span>
                              )}
                           </span>
                           <span className={styles.convTime}>
                              {c.timestamp}
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
               ))}
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
