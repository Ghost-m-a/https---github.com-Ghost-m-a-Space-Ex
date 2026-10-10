"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
   Plus,
   TrendingUp,
   Users,
   Wallet,
   ExternalLink,
   Inbox,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/campaigns.module.css";

interface CampaignRow {
   id: string;
   slug: string;
   title: string;
   coverImage: string;
   status: string;
   budget: number;
   budgetSpent: number;
   joinedUsers: number;
   totalViews: number;
   cpm: number;
   pendingRequests: number;
}

export default function BusinessCampaignsPage() {
   const { activeBusiness } = useWorkspace();
   const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/campaigns?businessId=${activeBusiness.id}`,
            { credentials: "include" },
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
                  const hasPending = (c.pendingRequests ?? 0) > 0;

                  return (
                     <div key={c.id} className={styles.card}>
                        {/* Clickable card body → public campaign page */}
                        <Link
                           href={`/discover/${c.slug}`}
                           className={styles.cardLink}
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
                                 className={`${styles.statusBadge} ${
                                    styles[c.status] || ""
                                 }`}
                              >
                                 {c.status}
                              </span>

                              {hasPending && (
                                 <span className={styles.pendingBadge}>
                                    <Inbox size={10} /> {c.pendingRequests}{" "}
                                    pending
                                 </span>
                              )}
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

                        {/* Actions row — separate from the link */}
                        <div className={styles.cardActions}>
                           <Link
                              href={`/business/campaigns/${c.id}/requests`}
                              className={styles.requestsBtn}
                           >
                              <Inbox size={12} />
                              <span>View requests</span>
                              {hasPending && (
                                 <span className={styles.requestsCount}>
                                    {c.pendingRequests}
                                 </span>
                              )}
                           </Link>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
