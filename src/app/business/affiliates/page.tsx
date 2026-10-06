"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
   Calendar,
   Percent,
   User,
   Link2,
   ChevronRight,
   ChevronDown,
   Search,
   Settings2,
} from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./affiliates.module.css";

type Tab = "dashboard" | "signups" | "portal" | "revenue-share";

export default function AffiliatesPage() {
   const { activeBusiness } = useWorkspace();
   const [tab, setTab] = useState<Tab>("dashboard");

   return (
      <div className={styles.page}>
         <div className={styles.topTabs}>
            {(["dashboard", "signups", "portal", "revenue-share"] as Tab[]).map(
               (t) => (
                  <a
                     key={t}
                     href={`/business/affiliates${t === "dashboard" ? "" : "/" + t}`}
                     className={`${styles.topTab} ${tab === t ? styles.topTabActive : ""}`}
                  >
                     {t === "dashboard" && "Creator dashboard"}
                     {t === "signups" && "Signups"}
                     {t === "portal" && "Affiliate portal"}
                     {t === "revenue-share" && "Revenue share"}
                  </a>
               ),
            )}
         </div>

         <DashboardContent />
      </div>
   );
}

function DashboardContent() {
   const { activeBusiness } = useWorkspace();
   const [affiliates, setAffiliates] = useState<any[]>([]);
   const [summary, setSummary] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/affiliates?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setAffiliates(d.affiliates || []);
         setSummary(d.summary);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <>
         {/* Chart area */}
         <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
               <div className={styles.chartTitle}>
                  New users from affiliates <ChevronDown size={14} />
               </div>
               <button className={styles.dateBtn}>
                  <Calendar size={14} /> Last 1 month <ChevronDown size={14} />
               </button>
            </div>

            <div className={styles.chartCount}>
               {summary?.totalReferrals || 0}
            </div>

            <div className={styles.chartArea}>
               <div className={styles.chartGridLines}>
                  {[20, 17, 15, 12, 10, 7, 5, 2, 0].map((v) => (
                     <div key={v} className={styles.gridLine}>
                        <span className={styles.gridLabel}>{v}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className={styles.chartLegend}>
               <span>
                  <span
                     className={styles.legendDot}
                     style={{ background: "#3b82f6" }}
                  />{" "}
                  Direct
               </span>
               <span>
                  <span
                     className={styles.legendDot}
                     style={{ background: "#f59e0b" }}
                  />{" "}
                  Discover
               </span>
               <span>
                  <span
                     className={styles.legendDot}
                     style={{ background: "#10b981" }}
                  />{" "}
                  Affiliates
               </span>
            </div>
         </div>

         {/* Quick actions */}
         <div className={styles.actionCards}>
            <button className={styles.actionCard}>
               <div className={styles.actionIcon}>
                  <Percent size={16} />
               </div>
               <div className={styles.actionText}>
                  <div className={styles.actionTitle}>
                     Set the affiliate commission for a specific product
                  </div>
                  <div className={styles.actionSub}>
                     All your products have a 30% commission by default
                  </div>
               </div>
               <ChevronRight size={16} className={styles.actionChevron} />
            </button>

            <button className={styles.actionCard}>
               <div className={styles.actionIcon}>
                  <User size={16} />
               </div>
               <div className={styles.actionText}>
                  <div className={styles.actionTitle}>
                     Set an affiliate commission for a specific user
                  </div>
                  <div className={styles.actionSub}>
                     Invite a user to give them special rates
                  </div>
               </div>
               <ChevronRight size={16} className={styles.actionChevron} />
            </button>

            <button className={styles.actionCard}>
               <div className={styles.actionIcon}>
                  <Link2 size={16} />
               </div>
               <div className={styles.actionText}>
                  <div className={styles.actionTitle}>External links</div>
                  <div className={styles.actionSub}>
                     Set external sales page links you want affiliates to
                     promote.
                  </div>
               </div>
               <ChevronRight size={16} className={styles.actionChevron} />
            </button>
         </div>

         {/* Leaderboard */}
         <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Leaderboard</h3>

            <div className={styles.tableFilters}>
               <div className={styles.filterTabs}>
                  {[
                     "User",
                     "Referrals",
                     "Rewards (USD)",
                     "Past 3 month retention",
                     "All time retention",
                     "Affiliate plans",
                     "Custom reward",
                  ].map((t, i) => (
                     <button
                        key={t}
                        className={`${styles.filterTab} ${i === 0 ? styles.filterTabActive : ""}`}
                     >
                        {t} {i === 1 && <ChevronDown size={10} />}
                     </button>
                  ))}
               </div>
            </div>

            {loading ? (
               <div className={styles.loading}>Loading...</div>
            ) : affiliates.length === 0 ? (
               <div className={styles.emptyLarge}>
                  <div className={styles.emptyIcon}>📣</div>
                  <div className={styles.emptyTitle}>No affiliates yet</div>
                  <div className={styles.emptySub}>
                     Add affiliates to expand your reach by incentivizing
                     <br />
                     users to refer their friends to your whop.
                  </div>
               </div>
            ) : (
               <div className={styles.tableWrap}>
                  <table className={styles.table}>
                     <thead>
                        <tr>
                           <th>User</th>
                           <th>Referrals</th>
                           <th>Rewards (USD)</th>
                           <th>Past 3 month retention</th>
                           <th>All time retention</th>
                        </tr>
                     </thead>
                     <tbody>
                        {affiliates.map((a) => (
                           <tr key={a.id}>
                              <td>
                                 <div className={styles.userCell}>
                                    <div className={styles.userAvatar}>
                                       {a.avatar}
                                    </div>
                                    <div>
                                       <div className={styles.userName}>
                                          {a.name}
                                       </div>
                                       <div className={styles.userHandle}>
                                          @{a.username || a.email.split("@")[0]}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td>{a.referrals}</td>
                              <td>${a.rewardsEarned.toFixed(2)}</td>
                              <td>{(a.retention || 0).toFixed(0)}%</td>
                              <td>—</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            <div className={styles.tableFooter}>
               <span>
                  0-{affiliates.length} of {affiliates.length} results
               </span>
               <div className={styles.rowsPerPage}>
                  Rows per page
                  <select className={styles.rowsSelect}>
                     <option>20</option>
                  </select>
               </div>
            </div>
         </div>
      </>
   );
}
