"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/components/settings.module.css";

interface Case {
   id: string;
   product: string;
   amount: number;
   dueDate: string;
   status: string;
   createdAt: string;
}

const ResolutionTab = () => {
   const [cases, setCases] = useState<Case[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch("/api/user/resolution")
         .then((r) => r.json())
         .then((d) => setCases(d.cases || []))
         .finally(() => setLoading(false));
   }, []);

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <div className={styles.tableHead}>
               <div>Product</div>
               <div>Amount</div>
               <div>Due date</div>
               <div>Status</div>
            </div>

            {loading ? (
               <div className={styles.emptyBox}>Loading...</div>
            ) : cases.length === 0 ? (
               <div className={styles.emptyBoxLarge}>
                  <div className={styles.emptyIllustration}>🙂</div>
                  <div className={styles.emptyTitle}>
                     No resolution cases yet
                  </div>
                  <div className={styles.emptySubtitle}>
                     When you report an issue with a Space-Ex membership, it
                     will be listed here.
                  </div>
               </div>
            ) : (
               cases.map((c) => (
                  <div key={c.id} className={styles.tableRow}>
                     <div>{c.product}</div>
                     <div>${c.amount}</div>
                     <div>{c.dueDate}</div>
                     <div>
                        <span className={styles.badgeMuted}>{c.status}</span>
                     </div>
                  </div>
               ))
            )}

            <div className={styles.tableFooter}>
               <span>Rows per page: 20</span>
            </div>
         </div>
      </div>
   );
};

export default ResolutionTab;
