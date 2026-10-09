"use client";

import React from "react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const ITEMS = [
   {
      key: "cardEmails",
      label: "Card emails",
      sub: "Declined transactions, large charges, and cashback summaries",
   },
   { key: "disputes", label: "Disputes", sub: "New disputes and decisions" },
   { key: "failedAdsPayment", label: "Failed ads payment" },
   { key: "joins", label: "Joins", sub: "New members that join your business" },
   {
      key: "payments",
      label: "Payments",
      sub: "Purchases and subscription renewals",
   },
   {
      key: "paymentsReview",
      label: "Payments needing review",
      sub: "A card payment was authorized and is waiting for capture",
   },
   {
      key: "resolutionCenter",
      label: "Resolution center",
      sub: "New cases, changes, and decisions",
   },
   {
      key: "supportAllMessages",
      label: "Support chats - All messages",
      sub: "Notify on all support chat messages",
   },
   {
      key: "supportMentionsOnly",
      label: "Support chats - Mentions only",
      sub: "Notify when mentioned in a support chat",
   },
   { key: "waitlists", label: "Waitlists", sub: "New entries" },
   {
      key: "withdrawals",
      label: "Withdrawals",
      sub: "Confirmations and updates",
   },
];

const NotificationsTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const prefs = business?.notificationPrefs || {};

   const update = (key: string, value: boolean) => {
      updateBusiness({ notificationPrefs: { ...prefs, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.listBox}>
            {ITEMS.map((item) => (
               <Toggle
                  key={item.key}
                  label={item.label}
                  sub={item.sub}
                  checked={!!prefs[item.key]}
                  onChange={(v) => update(item.key, v)}
               />
            ))}
         </div>
      </div>
   );
};

export default NotificationsTab;
