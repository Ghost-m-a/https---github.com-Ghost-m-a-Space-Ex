"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/business-settings.module.css";

const PartnersTab = () => {
   const [tab, setTab] = useState<"pending" | "all">("pending");
   const [pending, setPending] = useState<any[]>([]);
   const [all, setAll] = useState<any[]>([]);

   useEffect(() => {
      fetch("/api/user/partners")
         .then((r) => r.json())
         .then((d) => {
            setPending(d.pending || []);
            setAll(d.all || []);
         })
         .catch(() => {});
   }, []);

   const list = tab === "pending" ? pending : all;

   return (
      <div className={styles.tabContent}>
         <p className={styles.sectionSubtitle}>
            Review requests from partners who want to be attributed to your
            business. Only business owners can respond.
         </p>

         <div className={styles.subTabs}>
            <button
               className={`${styles.subTab} ${tab === "pending" ? styles.subTabActive : ""}`}
               onClick={() => setTab("pending")}
            >
               Pending
            </button>
            <button
               className={`${styles.subTab} ${tab === "all" ? styles.subTabActive : ""}`}
               onClick={() => setTab("all")}
            >
               All requests
            </button>
         </div>

         {list.length === 0 ? (
            <div className={styles.emptyBox}>
               {tab === "pending"
                  ? "No pending partner requests"
                  : "No partner requests yet"}
            </div>
         ) : (
            <div className={styles.listBox}>
               {list.map((p) => (
                  <div key={p.id} className={styles.listItem}>
                     <div className={styles.listAvatar}>
                        {p.partnerAvatar || p.partnerName[0]}
                     </div>
                     <div className={styles.listInfo}>
                        <div className={styles.listTitle}>{p.partnerName}</div>
                        <div className={styles.listSub}>{p.message}</div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default PartnersTab;
