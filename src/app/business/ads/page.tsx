"use client";

import React, { useEffect, useState } from "react";
import { Plus, Play, Pause } from "lucide-react";
import { BusinessAd } from "../../lib/types";
import styles from "../business.module.css";

export default function AdsPage() {
   const [ads, setAds] = useState<BusinessAd[]>([]);

   const load = () =>
      fetch("/api/business/ads")
         .then((r) => r.json())
         .then((d) => setAds(d.ads));
   useEffect(() => {
      load();
   }, []);

   const toggle = async (id: string) => {
      await fetch("/api/business/ads", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id }),
      });
      load();
   };

   const totalSpend = ads.reduce((s, a) => s + a.spend, 0);
   const totalConversions = ads.reduce((s, a) => s + a.conversions, 0);
   const avgRoas = ads.length
      ? (ads.reduce((s, a) => s + a.roas, 0) / ads.length).toFixed(2)
      : 0;

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Ads</h1>
            <button className={styles.primaryBtn}>
               <Plus size={16} /> New Campaign
            </button>
         </div>

         <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Total Spend</div>
               <div className={styles.kpiValue}>
                  ${totalSpend.toLocaleString()}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Conversions</div>
               <div className={styles.kpiValue}>{totalConversions}</div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Avg ROAS</div>
               <div className={styles.kpiValue}>{avgRoas}x</div>
            </div>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Campaign</div>
               <div>Platform</div>
               <div>Spend</div>
               <div>Conversions</div>
               <div>ROAS</div>
               <div>Status</div>
               <div></div>
            </div>
            {ads.map((a) => (
               <div key={a.id} className={styles.tableRow}>
                  <div className={styles.cell}>{a.name}</div>
                  <div className={styles.cell}>{a.platform}</div>
                  <div className={styles.cell}>${a.spend.toLocaleString()}</div>
                  <div className={styles.cell}>{a.conversions}</div>
                  <div className={styles.cell}>{a.roas}x</div>
                  <div className={styles.cell}>
                     <span
                        className={`${styles.status} ${a.status === "active" ? styles.succeeded : styles.pending}`}
                     >
                        {a.status}
                     </span>
                  </div>
                  <button
                     className={styles.iconBtn}
                     onClick={() => toggle(a.id)}
                  >
                     {a.status === "active" ? (
                        <Pause size={14} />
                     ) : (
                        <Play size={14} />
                     )}
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}
