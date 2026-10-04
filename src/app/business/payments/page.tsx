"use client";

import React, { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { BusinessPayment } from "../../lib/types";
import styles from "../business.module.css";

export default function PaymentsPage() {
   const [payments, setPayments] = useState<BusinessPayment[]>([]);
   const [filter, setFilter] = useState("all");

   useEffect(() => {
      fetch("/api/business/payments")
         .then((r) => r.json())
         .then((d) => setPayments(d.payments));
   }, []);

   const filtered =
      filter === "all" ? payments : payments.filter((p) => p.status === filter);

   const totalVolume = payments
      .filter((p) => p.status === "succeeded")
      .reduce((s, p) => s + p.amount, 0);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <h1 className={styles.title}>Payments</h1>
               <p className={styles.subtitle}>
                  ${totalVolume.toFixed(2)} processed
               </p>
            </div>
            <button className={styles.secondaryBtn}>
               <Download size={16} /> Export
            </button>
         </div>

         <div className={styles.filters}>
            {["all", "succeeded", "pending", "failed", "refunded"].map((f) => (
               <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                  onClick={() => setFilter(f)}
               >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
               </button>
            ))}
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Customer</div>
               <div>Product</div>
               <div>Amount</div>
               <div>Method</div>
               <div>Date</div>
               <div>Status</div>
            </div>
            {filtered.map((p) => (
               <div key={p.id} className={styles.tableRow}>
                  <div className={styles.cell}>{p.customer}</div>
                  <div className={styles.cell}>{p.product}</div>
                  <div className={styles.cell}>${p.amount}</div>
                  <div className={styles.cell}>{p.method}</div>
                  <div className={styles.cell}>{p.date}</div>
                  <div className={styles.cell}>
                     <span className={`${styles.status} ${styles[p.status]}`}>
                        {p.status}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
