"use client";

import React, { useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import styles from "../business.module.css";

export default function BusinessAffiliatesPage() {
   const [affiliates] = useState([
      {
         id: "1",
         name: "Sarah Jenkins",
         code: "SARAH20",
         sales: 42,
         earnings: 1240,
         rate: 20,
      },
      {
         id: "2",
         name: "Mike Chen",
         code: "MIKE15",
         sales: 28,
         earnings: 820,
         rate: 15,
      },
      {
         id: "3",
         name: "Emma Watson",
         code: "EMMA25",
         sales: 18,
         earnings: 640,
         rate: 25,
      },
   ]);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Affiliates</h1>
         </div>

         <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Active Affiliates</div>
               <div className={styles.kpiValue}>{affiliates.length}</div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Total Sales</div>
               <div className={styles.kpiValue}>
                  {affiliates.reduce((s, a) => s + a.sales, 0)}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Commissions Paid</div>
               <div className={styles.kpiValue}>
                  $
                  {affiliates
                     .reduce((s, a) => s + a.earnings, 0)
                     .toLocaleString()}
               </div>
            </div>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Affiliate</div>
               <div>Code</div>
               <div>Commission</div>
               <div>Sales</div>
               <div>Earnings</div>
               <div></div>
            </div>
            {affiliates.map((a) => (
               <div key={a.id} className={styles.tableRow}>
                  <div className={styles.custCell}>
                     <div className={styles.custAvatar}>{a.name.charAt(0)}</div>
                     <div className={styles.custName}>{a.name}</div>
                  </div>
                  <div className={styles.cell}>
                     <code>{a.code}</code>
                  </div>
                  <div className={styles.cell}>{a.rate}%</div>
                  <div className={styles.cell}>{a.sales}</div>
                  <div className={styles.cell}>${a.earnings}</div>
                  <button className={styles.iconBtn}>
                     <Copy size={14} />
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}
