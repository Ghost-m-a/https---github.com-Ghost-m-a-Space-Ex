"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, Settings2, Search, Receipt } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./checkout-links.module.css";

export default function CheckoutLinksPage() {
   const { activeBusiness } = useWorkspace();
   const [links, setLinks] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/checkout-links?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setLinks(d.links || []);
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
            <h1 className={styles.title}>Checkout links</h1>
            <div className={styles.headerActions}>
               <Link
                  href="/business/checkout-links/new"
                  className={styles.primaryBtn}
               >
                  <Plus size={14} /> Create checkout link
               </Link>
            </div>
         </div>

         <div className={styles.filtersRow}>
            <div className={styles.searchWrap}>
               <Search size={14} />
               <input className={styles.searchInput} placeholder="Search..." />
            </div>
            <button className={styles.filterBtn}>
               <Download size={14} /> Export
            </button>
            <button className={styles.iconBtn}>
               <Settings2 size={16} />
            </button>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : links.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>
                  <Receipt size={48} strokeWidth={1.5} />
               </div>
               <div className={styles.emptyTitle}>No checkout links yet</div>
               <div className={styles.emptySub}>
                  Create a checkout link to accept one-off payments from your
                  customers.
               </div>
               <div className={styles.emptyActions}>
                  <Link
                     href="/business/checkout-links/new"
                     className={styles.primaryBtn}
                  >
                     <Plus size={14} /> Create checkout link
                  </Link>
                  <button className={styles.secondaryBtn}>View docs</button>
               </div>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Product</th>
                        <th>Notes</th>
                        <th>Created at</th>
                        <th>Plan</th>
                        <th>Total sales</th>
                        <th>Active users</th>
                        <th>Visibility</th>
                        <th>Release method</th>
                        <th>Stock</th>
                        <th>Trial period</th>
                        <th>Initial fee</th>
                     </tr>
                  </thead>
                  <tbody>
                     {links.map((l) => (
                        <tr key={l.id}>
                           <td className={styles.bold}>{l.productName}</td>
                           <td>—</td>
                           <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                           <td>
                              {l.price > 0
                                 ? `$${l.price} ${l.currency}`
                                 : "Free"}
                           </td>
                           <td>0</td>
                           <td>0</td>
                           <td>Visible</td>
                           <td>Automatic</td>
                           <td>Unlimited</td>
                           <td>—</td>
                           <td>—</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
