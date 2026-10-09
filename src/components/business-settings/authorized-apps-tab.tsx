"use client";

import React from "react";
import { Plus } from "lucide-react";
import styles from "../../styles/business-settings.module.css";

const AuthorizedAppsTab = () => (
   <div className={styles.tabContent}>
      <div className={styles.configRow}>
         <div className={styles.configText}>
            <div className={styles.toggleLabel}>
               Manage apps that integrate with your company.
            </div>
         </div>
         <button className={styles.btnSecondarySmall}>
            <Plus size={14} /> Find new apps
         </button>
      </div>

      <div className={styles.emptyBoxLarge}>
         <div className={styles.emptyTitle}>No apps authorized yet</div>
         <div className={styles.emptySubtitle}>
            When you authorize an app, it will show up here.
         </div>
      </div>
   </div>
);

export default AuthorizedAppsTab;
