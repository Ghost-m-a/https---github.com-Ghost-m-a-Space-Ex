"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SidePanel from "./side-panel";
import styles from "../styles/panel.module.css";

interface NotificationItem {
   id: string;
   kind: string;
   title: string;
   body: string;
   href: string;
   read: boolean;
   createdAt: string;
}

interface NotificationsPanelProps {
   isOpen: boolean;
   onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
   isOpen,
   onClose,
}) => {
   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
   const [tab, setTab] = useState<"mentions" | "all">("mentions");
   const [unread, setUnread] = useState(0);

   const load = async () => {
      const filter = tab === "mentions" ? "mentions" : "all";
      const res = await fetch(`/api/notifications?filter=${filter}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
   };

   useEffect(() => {
      if (isOpen) load();
   }, [isOpen, tab]);

   const markAllRead = async () => {
      await fetch("/api/notifications", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "mark-all-read" }),
      });
      load();
   };

   const markOne = async (id: string) => {
      await fetch("/api/notifications", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "mark-read", id }),
      });
      setNotifications((prev) =>
         prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnread((u) => Math.max(0, u - 1));
   };

   return (
      <SidePanel isOpen={isOpen} onClose={onClose} title="Notifications">
         <div className={styles.tabs}>
            <button
               className={`${styles.tab} ${tab === "mentions" ? styles.tabActive : ""}`}
               onClick={() => setTab("mentions")}
            >
               Mentions
            </button>
            <button
               className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
               onClick={() => setTab("all")}
            >
               All activity
            </button>
         </div>

         {unread > 0 && (
            <button className={styles.markReadBtn} onClick={markAllRead}>
               Mark all as read
            </button>
         )}

         <div className={styles.listScroll}>
            {notifications.length === 0 ? (
               <div className={styles.emptyBig}>
                  <div className={styles.emptyIllustration}>
                     <svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        fill="none"
                     >
                        <rect
                           x="15"
                           y="25"
                           width="50"
                           height="40"
                           rx="6"
                           fill="#374151"
                        />
                        <path
                           d="M15 31h50l-5-12a4 4 0 0 0-4-3H24a4 4 0 0 0-4 3l-5 12z"
                           fill="#ef4444"
                        />
                        <rect
                           x="28"
                           y="45"
                           width="24"
                           height="3"
                           rx="1.5"
                           fill="#9ca3af"
                        />
                        <rect
                           x="28"
                           y="52"
                           width="16"
                           height="3"
                           rx="1.5"
                           fill="#9ca3af"
                        />
                     </svg>
                  </div>
                  <div className={styles.emptyTitle}>
                     {tab === "mentions"
                        ? "No mentions yet"
                        : "No notifications yet"}
                  </div>
                  <div className={styles.emptySubtitle}>
                     {tab === "mentions"
                        ? "You have not been mentioned in any whops yet"
                        : "Your activity will show up here"}
                  </div>
                  <Link href="/discover" className={styles.emptyCta}>
                     Browse marketplace
                  </Link>
               </div>
            ) : (
               notifications.map((n) => (
                  <button
                     key={n.id}
                     className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ""}`}
                     onClick={() => markOne(n.id)}
                  >
                     <div className={styles.notifIcon}>
                        {n.kind === "mention" ? "@" : "•"}
                     </div>
                     <div className={styles.notifBody}>
                        <div className={styles.notifTitle}>{n.title}</div>
                        {n.body && (
                           <div className={styles.notifText}>{n.body}</div>
                        )}
                     </div>
                     {!n.read && <div className={styles.notifDot} />}
                  </button>
               ))
            )}
         </div>
      </SidePanel>
   );
};

export default NotificationsPanel;
