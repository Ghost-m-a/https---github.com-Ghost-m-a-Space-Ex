"use client";

import React, { useEffect, useState } from "react";
import {
   Rocket,
   Bell,
   HelpCircle,
   MessageSquare,
   Search,
   Sparkles,
} from "lucide-react";
import styles from "@/styles/components/navbar.module.css";
import { UserDropdown } from "./userdropdown";
import MessagesPanel from "./messages-panel";
import NotificationsPanel from "./notifications-panel";

const Navbar = () => {
   const [messagesOpen, setMessagesOpen] = useState(false);
   const [notificationsOpen, setNotificationsOpen] = useState(false);
   const [unreadMessages, setUnreadMessages] = useState(0);
   const [unreadNotifications, setUnreadNotifications] = useState(0);
   const [isAuthed, setIsAuthed] = useState(false);

   // Check auth state first
   useEffect(() => {
      fetch("/api/auth/me")
         .then((r) => r.json())
         .then((d) => setIsAuthed(Boolean(d.user)))
         .catch(() => setIsAuthed(false));
   }, []);

   // Only poll when authenticated
   useEffect(() => {
      if (!isAuthed) return;

      let cancelled = false;

      const load = async () => {
         try {
            const [m, n] = await Promise.all([
               fetch("/api/messages").then((r) => r.json()),
               fetch("/api/notifications").then((r) => r.json()),
            ]);
            if (cancelled) return;
            const mCount = (m.conversations || []).reduce(
               (s: number, c: any) => s + (c.unread || 0),
               0,
            );
            setUnreadMessages(mCount);
            setUnreadNotifications(n.unreadCount || 0);
         } catch {
            /* ignore */
         }
      };

      load();
      const interval = setInterval(load, 30000);
      return () => {
         cancelled = true;
         clearInterval(interval);
      };
   }, [isAuthed]);

   return (
      <>
         <header className={styles.navbar}>
            <div className={styles.navLeft}>
               <div className={styles.brand}>
                  <div className={styles.brandIcon}>
                     <Rocket size={18} />
                  </div>
                  <span className={styles.brandText}>Space/Ex</span>
               </div>
            </div>

            <div className={styles.searchContainer}>
               <Search size={18} className={styles.searchIcon} />
               <input
                  type="text"
                  placeholder="Search"
                  className={styles.searchInput}
               />
               <kbd className={styles.searchKbd}>Ctrl+K</kbd>
            </div>

            <div className={styles.navRight}>
               <button className={styles.iconButton}>
                  <HelpCircle size={20} />
               </button>
               <button className={styles.iconButton}>
                  <Sparkles size={20} />
               </button>

               <button
                  className={styles.iconButton}
                  onClick={() => {
                     setMessagesOpen(true);
                     setNotificationsOpen(false);
                  }}
                  aria-label="Messages"
               >
                  <MessageSquare size={20} />
                  {unreadMessages > 0 && (
                     <span className={styles.notificationBadge}>
                        {unreadMessages}
                     </span>
                  )}
               </button>

               <button
                  className={styles.iconButton}
                  onClick={() => {
                     setNotificationsOpen(true);
                     setMessagesOpen(false);
                  }}
                  aria-label="Notifications"
               >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                     <span className={styles.notificationBadge}>
                        {unreadNotifications}
                     </span>
                  )}
               </button>

               <div className={styles.divider} />
               <UserDropdown />
            </div>
         </header>

         {isAuthed && (
            <>
               <MessagesPanel
                  isOpen={messagesOpen}
                  onClose={() => setMessagesOpen(false)}
               />
               <NotificationsPanel
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
               />
            </>
         )}
      </>
   );
};

export default Navbar;
