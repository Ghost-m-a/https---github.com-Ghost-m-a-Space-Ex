"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SupportTicket } from "../../lib/types";
import styles from "../business.module.css";

export default function SupportPage() {
   const [tickets, setTickets] = useState<SupportTicket[]>([]);

   const load = () =>
      fetch("/api/business/support")
         .then((r) => r.json())
         .then((d) => setTickets(d.tickets));
   useEffect(() => {
      load();
   }, []);

   const update = async (id: string, status: string) => {
      await fetch("/api/business/support", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, status }),
      });
      load();
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Support</h1>
         </div>

         <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Open</div>
               <div className={styles.kpiValue}>
                  {tickets.filter((t) => t.status === "open").length}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Pending</div>
               <div className={styles.kpiValue}>
                  {tickets.filter((t) => t.status === "pending").length}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Resolved</div>
               <div className={styles.kpiValue}>
                  {tickets.filter((t) => t.status === "resolved").length}
               </div>
            </div>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Ticket</div>
               <div>Customer</div>
               <div>Priority</div>
               <div>Status</div>
               <div>Created</div>
               <div></div>
            </div>
            {tickets.map((t) => (
               <div key={t.id} className={styles.tableRow}>
                  <div className={styles.cell}>{t.subject}</div>
                  <div className={styles.cell}>{t.customer}</div>
                  <div className={styles.cell}>
                     <span
                        className={`${styles.status} ${t.priority === "high" ? styles.failed : t.priority === "medium" ? styles.pending : styles.draft}`}
                     >
                        {t.priority}
                     </span>
                  </div>
                  <div className={styles.cell}>{t.status}</div>
                  <div className={styles.cell}>{t.createdAt}</div>
                  <button
                     className={styles.iconBtn}
                     onClick={() => update(t.id, "resolved")}
                  >
                     <MessageCircle size={14} />
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}
