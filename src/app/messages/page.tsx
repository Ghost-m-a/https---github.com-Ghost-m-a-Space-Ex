"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, Pencil, MessageCircle } from "lucide-react";
import styles from "@/styles/pages/messages.module.css";

interface ConversationItem {
   id: string;
   displayName: string;
   displayAvatar: string;
   avatarColor: string;
   lastMessage: string;
   lastMessageAt: string;
   unread: number;
   participants: {
      id: string;
      name: string;
      username: string;
      avatarColor: string;
   }[];
}

interface MessageItem {
   id: string;
   senderId: string;
   senderName: string;
   senderAvatar: string;
   senderColor: string;
   text: string;
   isMine: boolean;
   createdAt: string;
}

export default function MessagesPage() {
   const router = useRouter();
   const [conversations, setConversations] = useState<ConversationItem[]>([]);
   const [activeId, setActiveId] = useState<string | null>(null);
   const [messages, setMessages] = useState<MessageItem[]>([]);
   const [loadingList, setLoadingList] = useState(true);
   const [loadingThread, setLoadingThread] = useState(false);
   const [composer, setComposer] = useState("");
   const [search, setSearch] = useState("");
   const [sending, setSending] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);

   const loadList = () => {
      setLoadingList(true);
      fetch("/api/messages/conversations", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => {
            setConversations(d.conversations ?? []);
            if (!activeId && d.conversations?.length > 0) {
               setActiveId(d.conversations[0].id);
            }
         })
         .finally(() => setLoadingList(false));
   };

   useEffect(() => {
      loadList();
   }, []);

   useEffect(() => {
      if (!activeId) return;
      setLoadingThread(true);
      fetch(`/api/messages/${activeId}`, { credentials: "include" })
         .then((r) => r.json())
         .then((d) => {
            setMessages(d.messages ?? []);
            // Clear the local unread count for the active conversation
            setConversations((prev) =>
               prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)),
            );
         })
         .finally(() => setLoadingThread(false));
   }, [activeId]);

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages]);

   const send = async () => {
      if (!composer.trim() || !activeId || sending) return;
      setSending(true);
      const text = composer.trim();
      setComposer("");
      try {
         const res = await fetch(`/api/messages/${activeId}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
         });
         if (res.ok) {
            // Reload the thread to include the new message
            const r = await fetch(`/api/messages/${activeId}`, {
               credentials: "include",
            });
            const d = await r.json();
            setMessages(d.messages ?? []);
            loadList();
         }
      } finally {
         setSending(false);
      }
   };

   const formatTime = (t: string) => {
      const d = new Date(t);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay)
         return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
         });
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400_000);
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], {
         month: "short",
         day: "numeric",
      });
   };

   const filtered = conversations.filter((c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()),
   );

   const active = conversations.find((c) => c.id === activeId);

   return (
      <div className={styles.page}>
         <div className={styles.layout}>
            {/* ---------- LEFT: conversation list ---------- */}
            <aside className={styles.list}>
               <div className={styles.listHeader}>
                  <div className={styles.searchWrap}>
                     <Search size={14} />
                     <input
                        className={styles.searchInput}
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <button className={styles.composeBtn} title="New message">
                     <Pencil size={14} />
                  </button>
               </div>

               <div className={styles.listTabs}>
                  <button className={styles.listTabActive}>Unread</button>
                  <button className={styles.listTab}>Requests</button>
               </div>

               <div className={styles.listBody}>
                  {loadingList ? (
                     <div className={styles.listLoading}>Loading…</div>
                  ) : filtered.length === 0 ? (
                     <div className={styles.listEmpty}>
                        No conversations yet
                     </div>
                  ) : (
                     filtered.map((c) => (
                        <button
                           key={c.id}
                           className={`${styles.convRow} ${
                              activeId === c.id ? styles.convRowActive : ""
                           }`}
                           onClick={() => setActiveId(c.id)}
                        >
                           <div
                              className={styles.convAvatar}
                              style={{ background: c.avatarColor }}
                           >
                              {c.displayAvatar}
                           </div>
                           <div className={styles.convInfo}>
                              <div className={styles.convTop}>
                                 <div className={styles.convName}>
                                    {c.displayName}
                                 </div>
                                 <div className={styles.convTime}>
                                    {formatTime(c.lastMessageAt)}
                                 </div>
                              </div>
                              <div className={styles.convPreview}>
                                 {c.lastMessage || "No messages yet"}
                              </div>
                           </div>
                           {c.unread > 0 && (
                              <div className={styles.unreadDot}>{c.unread}</div>
                           )}
                        </button>
                     ))
                  )}
               </div>
            </aside>

            {/* ---------- RIGHT: thread ---------- */}
            <main className={styles.thread}>
               {!active ? (
                  <div className={styles.threadEmpty}>
                     <MessageCircle size={48} />
                     <div className={styles.threadEmptyTitle}>
                        Select a conversation
                     </div>
                     <div className={styles.threadEmptySub}>
                        Choose a chat from the sidebar, or start a new one to
                        say hello.
                     </div>
                  </div>
               ) : (
                  <>
                     <div className={styles.threadHeader}>
                        <div
                           className={styles.threadAvatar}
                           style={{ background: active.avatarColor }}
                        >
                           {active.displayAvatar}
                        </div>
                        <div className={styles.threadTitle}>
                           {active.displayName}
                        </div>
                     </div>

                     <div className={styles.threadBody} ref={scrollRef}>
                        {loadingThread ? (
                           <div className={styles.threadLoading}>
                              Loading messages…
                           </div>
                        ) : messages.length === 0 ? (
                           <div className={styles.threadLoading}>
                              No messages yet. Say hi!
                           </div>
                        ) : (
                           messages.map((m) => (
                              <div
                                 key={m.id}
                                 className={`${styles.msgRow} ${
                                    m.isMine ? styles.msgRowMine : ""
                                 }`}
                              >
                                 {!m.isMine && (
                                    <div
                                       className={styles.msgAvatar}
                                       style={{ background: m.senderColor }}
                                    >
                                       {m.senderAvatar}
                                    </div>
                                 )}
                                 <div
                                    className={`${styles.msgBubble} ${
                                       m.isMine ? styles.msgBubbleMine : ""
                                    }`}
                                 >
                                    <div className={styles.msgText}>
                                       {m.text}
                                    </div>
                                    <div className={styles.msgTime}>
                                       {formatTime(m.createdAt)}
                                    </div>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>

                     <div className={styles.composer}>
                        <input
                           className={styles.composerInput}
                           placeholder="Type a message…"
                           value={composer}
                           onChange={(e) => setComposer(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                 e.preventDefault();
                                 send();
                              }
                           }}
                        />
                        <button
                           className={styles.sendBtn}
                           onClick={send}
                           disabled={!composer.trim() || sending}
                        >
                           <Send size={14} />
                        </button>
                     </div>
                  </>
               )}
            </main>
         </div>
      </div>
   );
}
