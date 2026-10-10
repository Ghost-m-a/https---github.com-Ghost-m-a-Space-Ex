"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./BusinessAnalyticsSection.module.css";

interface CampaignRow {
   campaignId: string;
   title: string;
   slug: string;
   coverImage: string;
   signups: number;
   lastSignedUpAt: string;
}
interface RecentSignup {
   id: string;
   name: string;
   email: string;
   avatar: string;
   signedUpAt: string;
   campaign: { id: string; title: string; slug: string } | null;
}

export default function BusinessAnalyticsSection() {
   const [totals, setTotals] = useState({
      totalSignups: 0,
      signups7d: 0,
      signups30d: 0,
   });
   const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
   const [recent, setRecent] = useState<RecentSignup[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      (async () => {
         try {
            const res = await fetch("/api/business/campaign-signups", {
               credentials: "include",
            });
            const data = await res.json();
            setTotals({
               totalSignups: data.totalSignups ?? 0,
               signups7d: data.signups7d ?? 0,
               signups30d: data.signups30d ?? 0,
            });
            setCampaigns(data.campaigns ?? []);
            setRecent(data.recentSignups ?? []);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   if (loading) return <div className={styles.wrap}>Loading analytics…</div>;

   return (
      <div className={styles.wrap}>
         <h2 className={styles.heading}>Campaign Signups</h2>

         <div className={styles.cards}>
            <div className={styles.card}>
               <div className={styles.cardValue}>{totals.totalSignups}</div>
               <div className={styles.cardLabel}>Total signups</div>
            </div>
            <div className={styles.card}>
               <div className={styles.cardValue}>{totals.signups7d}</div>
               <div className={styles.cardLabel}>Last 7 days</div>
            </div>
            <div className={styles.card}>
               <div className={styles.cardValue}>{totals.signups30d}</div>
               <div className={styles.cardLabel}>Last 30 days</div>
            </div>
         </div>

         <div className={styles.section}>
            <h3 className={styles.subheading}>By campaign</h3>
            {campaigns.length === 0 ? (
               <div className={styles.empty}>
                  No signups yet — create a campaign and share it.
               </div>
            ) : (
               <div className={styles.list}>
                  {campaigns.map((c) => (
                     <Link
                        key={c.campaignId}
                        href={`/discover/${c.slug}`}
                        className={styles.row}
                     >
                        <div className={styles.thumb}>
                           {c.coverImage ? (
                              <img src={c.coverImage} alt={c.title} />
                           ) : (
                              <span>🎬</span>
                           )}
                        </div>
                        <div className={styles.rowInfo}>
                           <div className={styles.rowTitle}>{c.title}</div>
                           <div className={styles.rowMeta}>
                              Last signup:{" "}
                              {c.lastSignedUpAt
                                 ? new Date(c.lastSignedUpAt).toLocaleString()
                                 : "—"}
                           </div>
                        </div>
                        <div className={styles.rowCount}>
                           <div className={styles.rowCountValue}>
                              {c.signups}
                           </div>
                           <div className={styles.rowCountLabel}>joined</div>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </div>

         <div className={styles.section}>
            <h3 className={styles.subheading}>Recent signups</h3>
            {recent.length === 0 ? (
               <div className={styles.empty}>No recent activity</div>
            ) : (
               <div className={styles.list}>
                  {recent.map((s) => (
                     <div key={s.id} className={styles.row}>
                        <div className={styles.avatar}>
                           {s.avatar || s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.rowInfo}>
                           <div className={styles.rowTitle}>{s.name}</div>
                           <div className={styles.rowMeta}>
                              {s.email} ·{" "}
                              {new Date(s.signedUpAt).toLocaleString()}
                           </div>
                        </div>
                        {s.campaign && (
                           <Link
                              href={`/discover/${s.campaign.slug}`}
                              className={styles.rowCampaign}
                           >
                              {s.campaign.title}
                           </Link>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
