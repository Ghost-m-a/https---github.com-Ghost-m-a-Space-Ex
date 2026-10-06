"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, Settings2 } from "lucide-react";
import { useWorkspace } from "../../../context/workspace-context";
import styles from "../affiliates.module.css";

export default function SignupsPage() {
   const { activeBusiness } = useWorkspace();
   const [signups, setSignups] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const params = new URLSearchParams({ businessId: activeBusiness.id });
         if (search) params.set("q", search);
         const res = await fetch(`/api/business/affiliates/signups?${params}`);
         const d = await res.json();
         setSignups(d.signups || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id, search]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <>
         <div className={styles.topTabs}>
            {[
               { href: "/business/affiliates", label: "Creator dashboard" },
               {
                  href: "/business/affiliates/signups",
                  label: "Signups",
                  active: true,
               },
               {
                  href: "/business/affiliates/portal",
                  label: "Affiliate portal",
               },
               {
                  href: "/business/affiliates/revenue-share",
                  label: "Revenue share",
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

         <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Signups</h1>

         <div className={styles.tableFilters}>
            <div className={styles.searchWrap}>
               <Search size={16} />
               <input
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button className={styles.filterTab}>
               Status <ChevronDown size={12} />
            </button>
            <button className={styles.filterTab}>
               Signed up <ChevronDown size={12} />
            </button>
            <div style={{ marginLeft: "auto" }}>
               <button className={styles.filterTab}>
                  <Settings2 size={14} />
               </button>
            </div>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : signups.length === 0 ? (
            <div className={styles.emptyLarge}>
               <div className={styles.emptyIcon}>📣</div>
               <div className={styles.emptyTitle}>No affiliate signups yet</div>
               <div className={styles.emptySub}>
                  Users who sign up to promote
                  <br />
                  your products will appear here.
               </div>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Affiliate</th>
                        <th>Email</th>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Referrals</th>
                        <th>Rewards earned</th>
                        <th>Signed up</th>
                     </tr>
                  </thead>
                  <tbody>
                     {signups.map((s) => (
                        <tr key={s.id}>
                           <td>
                              <div className={styles.userCell}>
                                 <div className={styles.userAvatar}>
                                    {s.avatar}
                                 </div>
                                 <div className={styles.userName}>{s.name}</div>
                              </div>
                           </td>
                           <td>{s.email}</td>
                           <td>{s.product || "—"}</td>
                           <td>{s.status}</td>
                           <td>{s.referrals}</td>
                           <td>${s.rewardsEarned.toFixed(2)}</td>
                           <td>
                              {new Date(s.signedUpAt).toLocaleDateString()}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         <div className={styles.tableFooter}>
            <span>
               0-{signups.length} of {signups.length}
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
