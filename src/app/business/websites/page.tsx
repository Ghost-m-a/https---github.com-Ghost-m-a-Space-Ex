"use client";

import React, { useEffect, useState } from "react";
import { Plus, ExternalLink, Eye } from "lucide-react";
import { BusinessWebsite } from "../../lib/types";
import styles from "../business.module.css";

export default function WebsitesPage() {
   const [websites, setWebsites] = useState<BusinessWebsite[]>([]);

   useEffect(() => {
      fetch("/api/business/websites")
         .then((r) => r.json())
         .then((d) => setWebsites(d.websites));
   }, []);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Websites</h1>
            <button className={styles.primaryBtn}>
               <Plus size={16} /> New Website
            </button>
         </div>

         <div className={styles.websiteGrid}>
            {websites.map((w) => {
               // ✅ FIX: extract status class safely
               const statusClass =
                  w.status === "live" ? styles.succeeded : styles.pending;
               return (
                  <div key={w.id} className={styles.websiteCard}>
                     <div className={styles.websiteHeader}>
                        <div className={styles.websiteDomain}>{w.domain}</div>
                        <span className={`${styles.status} ${statusClass}`}>
                           {w.status}
                        </span>
                     </div>
                     <div className={styles.websiteName}>{w.name}</div>
                     <div className={styles.websiteStats}>
                        <div>
                           <div className={styles.statValue}>
                              {w.visits.toLocaleString()}
                           </div>
                           <div className={styles.statLabel}>Visits</div>
                        </div>
                        <div>
                           <div className={styles.statValue}>
                              {w.conversion}%
                           </div>
                           <div className={styles.statLabel}>Conversion</div>
                        </div>
                     </div>
                     <div className={styles.websiteActions}>
                        <button className={styles.secondaryBtn}>
                           <Eye size={14} /> Preview
                        </button>
                        <button className={styles.iconBtn}>
                           <ExternalLink size={16} />
                        </button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
