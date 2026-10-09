"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/settings.module.css";

interface NotificationPrefs {
   popup: boolean;
   sound: boolean;
   activity: {
      aiChatMessage: boolean;
      aiChatQuestion: boolean;
      bountyClaimed: boolean;
      newFollower: boolean;
      paymentFailed: boolean;
      upcomingPaymentReminders: boolean;
      withdrawalStatusChange: boolean;
      transferReceived: boolean;
   };
}

const ACTIVITY_ITEMS: {
   key: keyof NotificationPrefs["activity"];
   title: string;
   sub: string;
}[] = [
   {
      key: "aiChatMessage",
      title: "AI chat message",
      sub: "Space-Ex AI sent you a message",
   },
   {
      key: "aiChatQuestion",
      title: "AI chat question",
      sub: "Space-Ex AI asked you something and is waiting for an answer",
   },
   {
      key: "bountyClaimed",
      title: "Bounty Claimed",
      sub: "Get a notification when someone claims your bounty",
   },
   {
      key: "newFollower",
      title: "New follower",
      sub: "Get notified when someone follows you",
   },
   {
      key: "paymentFailed",
      title: "Payment Failed",
      sub: "Get notified when your payment fails so you don't lose your memberships",
   },
   {
      key: "upcomingPaymentReminders",
      title: "Upcoming Payment Reminders",
      sub: "Get notified before your membership renews",
   },
   {
      key: "withdrawalStatusChange",
      title: "Withdrawal Status Change",
      sub: "This notification is sent when your withdrawal changes status",
   },
   {
      key: "transferReceived",
      title: "You've just received a transfer",
      sub: "This notification is sent when a funds transfer is made between two accounts",
   },
];

const NotificationsTab = () => {
   const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => setPrefs(d.user?.notificationPrefs));
   }, []);

   const save = async (next: NotificationPrefs) => {
      setPrefs(next);
      await fetch("/api/user/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ notificationPrefs: next }),
      });
   };

   if (!prefs) return <div className={styles.loading}>Loading...</div>;

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <div className={styles.toggleRow}>
               <div>
                  <div className={styles.toggleLabel}>Pop-up notifications</div>
                  <div className={styles.toggleSub}>
                     Receive pop-up notifications for activity in businesses
                     you've joined
                  </div>
               </div>
               <button
                  className={`${styles.switch} ${prefs.popup ? styles.switchOn : ""}`}
                  onClick={() => save({ ...prefs, popup: !prefs.popup })}
               >
                  <span className={styles.switchThumb} />
               </button>
            </div>

            <div className={styles.toggleRow}>
               <div>
                  <div className={styles.toggleLabel}>Sound effects</div>
                  <div className={styles.toggleSub}>
                     Enhance platform interactions with sound effects.
                  </div>
               </div>
               <button
                  className={`${styles.switch} ${prefs.sound ? styles.switchOn : ""}`}
                  onClick={() => save({ ...prefs, sound: !prefs.sound })}
               >
                  <span className={styles.switchThumb} />
               </button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Activity</h4>
            {ACTIVITY_ITEMS.map((item) => (
               <div key={item.key} className={styles.toggleRow}>
                  <div>
                     <div className={styles.toggleLabel}>{item.title}</div>
                     <div className={styles.toggleSub}>{item.sub}</div>
                  </div>
                  <button
                     className={`${styles.switch} ${prefs.activity[item.key] ? styles.switchOn : ""}`}
                     onClick={() =>
                        save({
                           ...prefs,
                           activity: {
                              ...prefs.activity,
                              [item.key]: !prefs.activity[item.key],
                           },
                        })
                     }
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
};

export default NotificationsTab;
