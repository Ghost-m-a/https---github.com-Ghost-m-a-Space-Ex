"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import styles from "./community.module.css";

export default function CommunityPage() {
   return (
      <div className={styles.page}>
         <h1 className={styles.title}>Community</h1>
         <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
               <MessageCircle size={48} strokeWidth={1.5} />
            </div>
            <div className={styles.emptyTitle}>
               Community features coming soon
            </div>
            <div className={styles.emptySub}>
               Manage members, moderate discussions, and engage with your
               audience.
            </div>
         </div>
      </div>
   );
}
