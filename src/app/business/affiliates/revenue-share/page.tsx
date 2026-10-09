"use client";

import React, { useEffect, useState, useCallback } from "react";
import { BarChart3, ChevronRight, Settings2 } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/affiliates.module.css";
import rsStyles from "@/styles/pages/revenue-share.module.css";

export default function RevenueSharePage() {
   const { activeBusiness } = useWorkspace();
   const [partners, setPartners] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/affiliates/revenue-share?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setPartners(d.partners || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <>
         <div className={styles.topTabs}>
            {[
               { href: "/business/affiliates", label: "Creator dashboard" },
               { href: "/business/affiliates/signups", label: "Signups" },
               {
                  href: "/business/affiliates/portal",
                  label: "Affiliate portal",
               },
               {
                  href: "/business/affiliates/revenue-share",
                  label: "Revenue share",
                  active: true,
               },
            ].map((t) => (
               <a
                  key={t.label}
                  href={t.href}
                  className={`${styles.topTab} ${t.active ? styles.topTabActive : ""}`}
               >
                  {t.label}
               </a>
            ))}
         </div>

         <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Revenue share partners</h3>

            <button className={rsStyles.shareCard}>
               <div className={rsStyles.shareIcon}>
                  <BarChart3 size={16} />
               </div>
               <div className={rsStyles.shareText}>
                  <div className={rsStyles.shareTitle}>Share your revenue</div>
                  <div className={rsStyles.shareSub}>
                     Automatically pay partners a percentage of all sales
                  </div>
               </div>
               <ChevronRight size={16} className={rsStyles.shareChevron} />
            </button>
         </div>

         <div className={styles.tableFilters}>
            <div style={{ marginLeft: "auto" }}>
               <button className={styles.filterTab}>
                  <Settings2 size={14} />
               </button>
            </div>
         </div>

         <div className={rsStyles.tableHeader}>
            <span>User</span>
            <span>Product</span>
            <span>Earned</span>
            <span>Share</span>
            <span>Payout type</span>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : partners.length === 0 ? (
            <div className={styles.emptyLarge}>
               <div className={styles.emptyIcon}>💵</div>
               <div className={styles.emptyTitle}>
                  No revenue share partners yet
               </div>
               <div className={styles.emptySub}>
                  Revenue share partners will appear here once you add them.
               </div>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>User</th>
                        <th>Product</th>
                        <th>Earned</th>
                        <th>Share</th>
                        <th>Payout type</th>
                     </tr>
                  </thead>
                  <tbody>
                     {partners.map((p) => (
                        <tr key={p.id}>
                           <td>
                              <div className={styles.userCell}>
                                 <div className={styles.userAvatar}>
                                    {p.avatar}
                                 </div>
                                 <div className={styles.userName}>{p.name}</div>
                              </div>
                           </td>
                           <td>{p.product}</td>
                           <td>${p.earned.toFixed(2)}</td>
                           <td>{p.share}%</td>
                           <td>{p.payoutType}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         <div className={styles.tableFooter}>
            <span>
               0-{partners.length} of {partners.length} results
            </span>
            <div className={styles.rowsPerPage}>
               Rows per page{" "}
               <select className={styles.rowsSelect}>
                  <option>20</option>
               </select>
            </div>
         </div>
      </>
   );
}
