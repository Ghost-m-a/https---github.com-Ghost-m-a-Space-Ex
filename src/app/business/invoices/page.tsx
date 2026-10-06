"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, Settings2, FileText } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./invoices.module.css";

export default function InvoicesPage() {
   const { activeBusiness } = useWorkspace();
   const [invoices, setInvoices] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/invoices?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setInvoices(d.invoices || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Invoices</h1>
            <Link href="/business/invoices/new" className={styles.primaryBtn}>
               <Plus size={14} /> Create invoice
            </Link>
         </div>

         <div className={styles.filtersRow}>
            <button className={styles.filterBtn}>Status ▾</button>
            <button className={styles.filterBtn}>Collection method ▾</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
               <button className={styles.filterBtn}>
                  <Download size={14} /> Export
               </button>
               <button className={styles.iconBtn}>
                  <Settings2 size={16} />
               </button>
            </div>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : invoices.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>
                  <FileText size={48} strokeWidth={1.5} />
               </div>
               <div className={styles.emptyTitle}>No invoices yet</div>
               <div className={styles.emptySub}>
                  Send your customers branded
                  <br />
                  invoices and start collecting payments.
               </div>
               <div className={styles.emptyActions}>
                  <Link
                     href="/business/invoices/new"
                     className={styles.primaryBtn}
                  >
                     Create invoice
                  </Link>
                  <button className={styles.secondaryBtn}>View docs ↗</button>
               </div>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Invoice number</th>
                        <th>Customer name</th>
                        <th>Email</th>
                        <th>Created at</th>
                        <th>Due date</th>
                     </tr>
                  </thead>
                  <tbody>
                     {invoices.map((i) => (
                        <tr key={i.id}>
                           <td>${i.total.toFixed(2)}</td>
                           <td>
                              <span className={styles.badge}>{i.status}</span>
                           </td>
                           <td>{i.number}</td>
                           <td>{i.customerName || "—"}</td>
                           <td>{i.customerEmail || "—"}</td>
                           <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                           <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
