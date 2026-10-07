"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Users, Wallet, ExternalLink } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./campaigns.module.css";

export default function BusinessCampaignsPage() {
   const { activeBusiness } = useWorkspace();
   const [campaigns, setCampaigns] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/campaigns?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setCampaigns(d.campaigns || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const fmtMoney = (n: number) => `$${(n || 0).toLocaleString()}`;

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <h1 className={styles.title}>Campaigns</h1>
               <p className={styles.subtitle}>
                  Create content reward campaigns. Users earn credits by sharing
                  your content.
               </p>
            </div>
            <Link href="/business/campaigns/new" className={styles.primaryBtn}>
               <Plus size={14} /> New campaign
            </Link>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : campaigns.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>🎬</div>
               <div className={styles.emptyTitle}>No campaigns yet</div>
               <div className={styles.emptySub}>
                  Launch your first campaign to get content creators to share
                  your brand and drive views.
               </div>
               <Link
                  href="/business/campaigns/new"
                  className={styles.primaryBtn}
               >
                  Create campaign
               </Link>
            </div>
         ) : (
            <div className={styles.grid}>
               {campaigns.map((c) => {
                  const pct =
                     c.budget > 0
                        ? Math.min(100, (c.budgetSpent / c.budget) * 100)
                        : 0;
                  return (
                     <Link
                        key={c.id}
                        href={`/discover/${c.slug}`}
                        className={styles.card}
                     >
                        <div className={styles.cover}>
                           {c.coverImage ? (
                              <img
                                 src={c.coverImage}
                                 alt={c.title}
                                 className={styles.coverImg}
                              />
                           ) : (
                              <div className={styles.coverFallback}>🎬</div>
                           )}
                           <span
                              className={`${styles.statusBadge} ${styles[c.status]}`}
                           >
                              {c.status}
                           </span>
                        </div>
                        <div className={styles.cardBody}>
                           <div className={styles.cardTitle}>{c.title}</div>

                           <div className={styles.stats}>
                              <div className={styles.statItem}>
                                 <Wallet size={12} />
                                 <span>
                                    {fmtMoney(c.budgetSpent)} /{" "}
                                    {fmtMoney(c.budget)}
                                 </span>
                              </div>
                              <div className={styles.statItem}>
                                 <Users size={12} />
                                 <span>{c.joinedUsers}</span>
                              </div>
                              <div className={styles.statItem}>
                                 <TrendingUp size={12} />
                                 <span>${c.cpm}/1k</span>
                              </div>
                           </div>

                           <div className={styles.progressTrack}>
                              <div
                                 className={styles.progressFill}
                                 style={{ width: `${pct}%` }}
                              />
                           </div>

                           <div className={styles.cardFooter}>
                              <span>
                                 {c.totalViews.toLocaleString()} total views
                              </span>
                              <ExternalLink size={12} />
                           </div>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
