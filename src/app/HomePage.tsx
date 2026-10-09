"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
   Wallet,
   Eye,
   Trophy,
   TrendingUp,
   ArrowUpRight,
   ChevronRight,
   Users,
   DollarSign,
} from "lucide-react";
import styles from "./page.module.css";

interface JoinedCampaign {
   contributionId: string;
   joinedAt: string;
   totalViews: number;
   totalEarned: number;
   status: string;
   campaign: {
      id: string;
      slug: string;
      title: string;
      coverImage: string;
      brandName: string;
      budget: number;
      budgetSpent: number;
      budgetRemaining: number;
      cpm: number;
      status: string;
   };
}

interface Submission {
   id: string;
   platform: string;
   videoUrl: string;
   views: number;
   credit: number;
   createdAt: string;
   campaign: { title: string; slug: string; coverImage: string } | null;
}

interface Stats {
   totalEarned: number;
   totalViews: number;
   activeCampaigns: number;
   joinedCount: number;
}

export default function PersonalHomePage() {
   const [joined, setJoined] = useState<JoinedCampaign[]>([]);
   const [submissions, setSubmissions] = useState<Submission[]>([]);
   const [stats, setStats] = useState<Stats | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch("/api/user/campaigns")
         .then((r) => r.json())
         .then((d) => {
            setJoined(d.joined || []);
            setSubmissions(d.submissions || []);
            setStats(d.stats);
         })
         .finally(() => setLoading(false));
   }, []);

   const fmtMoney = (n: number) => `$${(n || 0).toFixed(2)}`;

   const formatTime = (t: string) => {
      const diff = Date.now() - new Date(t).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 60) return `${min}m ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      return `${Math.floor(hr / 24)}d ago`;
   };

   return (
      <div className={styles.page}>
         <h1 className={styles.title}>Your Dashboard</h1>

         {/* Stats Row */}
         <div className={styles.statsGrid}>
            <div className={styles.statCard}>
               <div className={styles.statIcon}>
                  <DollarSign size={18} />
               </div>
               <div>
                  <div className={styles.statLabel}>Total Earned</div>
                  <div className={styles.statValue}>
                     {fmtMoney(stats?.totalEarned || 0)}
                  </div>
               </div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statIcon}>
                  <Eye size={18} />
               </div>
               <div>
                  <div className={styles.statLabel}>Total Views</div>
                  <div className={styles.statValue}>
                     {(stats?.totalViews || 0).toLocaleString()}
                  </div>
               </div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statIcon}>
                  <Trophy size={18} />
               </div>
               <div>
                  <div className={styles.statLabel}>Active Campaigns</div>
                  <div className={styles.statValue}>
                     {stats?.activeCampaigns || 0}
                  </div>
               </div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statIcon}>
                  <Users size={18} />
               </div>
               <div>
                  <div className={styles.statLabel}>Campaigns Joined</div>
                  <div className={styles.statValue}>
                     {stats?.joinedCount || 0}
                  </div>
               </div>
            </div>
         </div>

         {/* Joined Campaigns */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h2 className={styles.sectionTitle}>Your Campaigns</h2>
               <Link href="/discover" className={styles.sectionLink}>
                  Browse more <ChevronRight size={14} />
               </Link>
            </div>

            {loading ? (
               <div className={styles.loading}>Loading...</div>
            ) : joined.length === 0 ? (
               <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                     <Trophy size={40} />
                  </div>
                  <div className={styles.emptyTitle}>No campaigns yet</div>
                  <div className={styles.emptySub}>
                     Join content reward campaigns to earn credits for every
                     1000 views you generate.
                  </div>
                  <Link href="/discover" className={styles.primaryBtn}>
                     Browse Campaigns
                  </Link>
               </div>
            ) : (
               <div className={styles.campaignGrid}>
                  {joined.map((item) => {
                     const pct =
                        item.campaign.budget > 0
                           ? Math.min(
                                100,
                                (item.campaign.budgetSpent /
                                   item.campaign.budget) *
                                   100,
                             )
                           : 0;
                     return (
                        <Link
                           key={item.contributionId}
                           href={`/discover/${item.campaign.slug}`}
                           className={styles.campaignCard}
                        >
                           <div className={styles.campaignCover}>
                              {item.campaign.coverImage ? (
                                 <img
                                    src={item.campaign.coverImage}
                                    alt={item.campaign.title}
                                 />
                              ) : (
                                 <div className={styles.coverFallback}>🎬</div>
                              )}
                              <span
                                 className={`${styles.statusPill} ${styles[item.campaign.status]}`}
                              >
                                 {item.campaign.status}
                              </span>
                           </div>
                           <div className={styles.campaignBody}>
                              <div className={styles.campaignBrand}>
                                 {item.campaign.brandName}
                              </div>
                              <div className={styles.campaignTitle}>
                                 {item.campaign.title}
                              </div>

                              <div className={styles.campaignStats}>
                                 <div>
                                    <div className={styles.statMiniLabel}>
                                       Your views
                                    </div>
                                    <div className={styles.statMiniValue}>
                                       {item.totalViews.toLocaleString()}
                                    </div>
                                 </div>
                                 <div>
                                    <div className={styles.statMiniLabel}>
                                       Your earnings
                                    </div>
                                    <div className={styles.statMiniValueEarn}>
                                       {fmtMoney(item.totalEarned)}
                                    </div>
                                 </div>
                              </div>

                              <div className={styles.progressTrack}>
                                 <div
                                    className={styles.progressFill}
                                    style={{ width: `${pct}%` }}
                                 />
                              </div>
                              <div className={styles.progressMeta}>
                                 ${item.campaign.budgetSpent.toLocaleString()} /
                                 ${item.campaign.budget.toLocaleString()}
                              </div>
                           </div>
                        </Link>
                     );
                  })}
               </div>
            )}
         </section>

         {/* Recent Submissions */}
         {submissions.length > 0 && (
            <section className={styles.section}>
               <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Submissions</h2>
               </div>
               <div className={styles.submissionsList}>
                  {submissions.map((s) => (
                     <div key={s.id} className={styles.submissionRow}>
                        <div className={styles.submissionLeft}>
                           <div className={styles.platformBadge}>
                              {s.platform}
                           </div>
                           <div className={styles.submissionInfo}>
                              <div className={styles.submissionTitle}>
                                 {s.campaign?.title || "Campaign"}
                              </div>
                              <div className={styles.submissionMeta}>
                                 {s.views.toLocaleString()} views ·{" "}
                                 {formatTime(s.createdAt)}
                              </div>
                           </div>
                        </div>
                        <div className={styles.submissionCredit}>
                           +{fmtMoney(s.credit)}
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         )}
      </div>
   );
}
