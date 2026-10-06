"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, Settings, Plus, ChevronDown } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./support.module.css";

export default function SupportPage() {
   const { activeBusiness } = useWorkspace();
   const [chats, setChats] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const params = new URLSearchParams({ businessId: activeBusiness.id });
         if (search) params.set("q", search);
         const res = await fetch(`/api/business/support?${params}`);
         const d = await res.json();
         setChats(d.chats || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id, search]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <div className={styles.layout}>
         <aside className={styles.sidebar}>
            <div className={styles.sideHeader}>
               <div className={styles.sideTitle}>Support chats</div>
               <div className={styles.sideIcons}>
                  <button className={styles.iconBtn}>
                     <Settings size={16} />
                  </button>
                  <button className={styles.iconBtn}>
                     <Plus size={16} />
                  </button>
               </div>
            </div>

            <div className={styles.searchWrap}>
               <Search size={14} />
               <input
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>

            <button className={styles.sortBtn}>
               Last activity <ChevronDown size={12} />
            </button>

            <div className={styles.listArea}>
               {loading ? (
                  <div className={styles.center}>Loading...</div>
               ) : chats.length === 0 ? (
                  <div className={styles.center}>No support chats yet</div>
               ) : (
                  chats.map((c) => (
                     <div key={c.id} className={styles.chatItem}>
                        <div className={styles.chatAvatar}>
                           {c.memberAvatar}
                        </div>
                        <div className={styles.chatInfo}>
                           <div className={styles.chatName}>{c.memberName}</div>
                           <div className={styles.chatLast}>
                              {c.lastMessage || "No messages"}
                           </div>
                        </div>
                        {c.unread > 0 && (
                           <span className={styles.badge}>{c.unread}</span>
                        )}
                     </div>
                  ))
               )}
            </div>
         </aside>

         <main className={styles.main}>
            {chats.length === 0 ? (
               <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💬</div>
                  <div className={styles.emptyTitle}>No support chats yet</div>
                  <div className={styles.emptySub}>
                     When a new user joins, we&apos;ll add them to a<br />
                     private chat with your team so you can build
                     <br />
                     closer relationships and boost retention.
                  </div>
                  <button className={styles.emptyCta}>
                     Set up support chats
                  </button>
               </div>
            ) : (
               <div className={styles.center}>
                  Select a chat to start replying
               </div>
            )}
         </main>
      </div>
   );
}
