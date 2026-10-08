"use client";

import React, { useEffect, useState } from "react";
import { useWorkspace } from "../../context/workspace-context";
import {
   TrendingUp,
   TrendingDown,
   Users,
   Package,
   Trophy,
   Eye,
   DollarSign,
} from "lucide-react";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
   const { activeBusiness } = useWorkspace();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      fetch(`/api/business/analytics?businessId=${activeBusiness.id}`)
         .then((r) => r.json())
         .then(setData)
         .finally(() => setLoading(false));
   }, [activeBusiness?.id]);

   if (loading)
      return <div className={styles.loading}>Loading analytics...</div>;
   if (!data) return <div className={styles.loading}>No business data</div>;

   const fmtMoney = (n: number) =>
      `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

   const maxRevenue = Math.max(
      1,
      ...data.revenue.chart.map((d: any) => d.revenue),
   );
   const revPoints = data.revenue.chart.map((d: any, i: number) => {
      const x = (i / (data.revenue.chart.length - 1)) * 800;
      const y = 200 - (d.revenue / maxRevenue) * 180;
      return `${x},${y}`;
   });
   const revPath = revPoints.length > 0 ? `M ${revPoints.join(" L ")}` : "";

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Analytics</h1>
         </div>

         {/* Primary KPIs */}
         <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
               <div className={styles.kpiIconGreen}>
                  <DollarSign size={18} />
               </div>
               <div className={styles.kpiLabel}>Gross Revenue</div>
               <div className={styles.kpiValue}>
                  {fmtMoney(data.revenue.gross)}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiIconBlue}>
                  <TrendingUp size={18} />
               </div>
               <div className={styles.kpiLabel}>Net Revenue</div>
               <div className={styles.kpiValue}>
                  {fmtMoney(data.revenue.net)}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiIconPurple}>
                  <Package size={18} />
               </div>
               <div className={styles.kpiLabel}>Avg Order Value</div>
               <div className={styles.kpiValue}>
                  {fmtMoney(data.revenue.avgOrderValue)}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiIconRed}>
                  <TrendingDown size={18} />
               </div>
               <div className={styles.kpiLabel}>Failed Rate</div>
               <div className={styles.kpiValue}>
                  {data.revenue.failedRate.toFixed(1)}%
               </div>
            </div>
         </div>

         {/* Revenue Chart */}
         <div className={styles.bigCard}>
            <div className={styles.cardHeaderRow}>
               <div className={styles.cardTitle}>Revenue · Last 30 days</div>
               <div className={styles.cardValue}>
                  {fmtMoney(data.revenue.gross)}
               </div>
            </div>
            <svg
               viewBox="0 0 800 200"
               className={styles.chart}
               preserveAspectRatio="none"
            >
               <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                     <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                  </linearGradient>
               </defs>
               <path
                  d={`${revPath} L 800,200 L 0,200 Z`}
                  fill="url(#revGrad)"
               />
               <path d={revPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
            <div className={styles.chartLegend}>
               <span>
                  <span className={styles.legendDotGreen} /> Revenue
               </span>
            </div>
         </div>

         {/* Secondary KPIs — Campaigns + Customers */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>Campaigns</div>
                  <Trophy size={16} />
               </div>
               <div className={styles.cardValue}>{data.campaigns.total}</div>
               <div className={styles.statRow}>
                  <span>Active</span>
                  <strong>{data.campaigns.active}</strong>
               </div>
               <div className={styles.statRow}>
                  <span>Total budget</span>
                  <strong>{fmtMoney(data.campaigns.totalBudget)}</strong>
               </div>
               <div className={styles.statRow}>
                  <span>Total spent</span>
                  <strong>{fmtMoney(data.campaigns.totalSpent)}</strong>
               </div>
            </div>

            <div className={styles.smallCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>Content Creators</div>
                  <Users size={16} />
               </div>
               <div className={styles.cardValue}>
                  {data.campaigns.totalCreators}
               </div>
               <div className={styles.statRow}>
                  <span>Total views</span>
                  <strong>{data.campaigns.totalViews.toLocaleString()}</strong>
               </div>
               <div className={styles.statRow}>
                  <span>Avg CPM</span>
                  <strong>${data.campaigns.avgCpm.toFixed(2)}</strong>
               </div>
            </div>

            <div className={styles.smallCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>Customers</div>
                  <Users size={16} />
               </div>
               <div className={styles.cardValue}>{data.customers.total}</div>
               <div className={styles.statRow}>
                  <span>Joined</span>
                  <strong>{data.customers.joined}</strong>
               </div>
               <div className={styles.statRow}>
                  <span>Total spend</span>
                  <strong>{fmtMoney(data.customers.totalSpend)}</strong>
               </div>
            </div>
         </div>

         {/* Top Products */}
         <div className={styles.gridRow2}>
            <div className={styles.bigCard}>
               <div className={styles.cardTitle}>Top Products</div>
               {data.products.top.length === 0 ? (
                  <div className={styles.smallEmpty}>No products yet</div>
               ) : (
                  <div className={styles.leaderboardList}>
                     {data.products.top.map((p: any, i: number) => (
                        <div key={p.id} className={styles.leaderboardRow}>
                           <div className={styles.leaderboardRank}>
                              #{i + 1}
                           </div>
                           <div className={styles.leaderboardInfo}>
                              <div className={styles.leaderboardName}>
                                 {p.name}
                              </div>
                              <div className={styles.leaderboardMeta}>
                                 {p.activeUsers.toLocaleString()} active users ·{" "}
                                 {p.visibility}
                              </div>
                           </div>
                           <div className={styles.leaderboardValue}>
                              {fmtMoney(p.revenue)}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Top Campaigns */}
            <div className={styles.bigCard}>
               <div className={styles.cardTitle}>Top Campaigns</div>
               {data.campaigns.top.length === 0 ? (
                  <div className={styles.smallEmpty}>No campaigns yet</div>
               ) : (
                  <div className={styles.leaderboardList}>
                     {data.campaigns.top.map((c: any, i: number) => (
                        <div key={c.id} className={styles.leaderboardRow}>
                           <div className={styles.leaderboardRank}>
                              #{i + 1}
                           </div>
                           <div className={styles.leaderboardInfo}>
                              <div className={styles.leaderboardName}>
                                 {c.title}
                              </div>
                              <div className={styles.leaderboardMeta}>
                                 {c.joinedUsers} creators ·{" "}
                                 {c.totalViews.toLocaleString()} views
                              </div>
                           </div>
                           <div className={styles.leaderboardValue}>
                              {fmtMoney(c.budgetSpent)}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Top Creators */}
         <div className={styles.bigCard}>
            <div className={styles.cardTitle}>Top Earning Creators</div>
            {data.creators.top.length === 0 ? (
               <div className={styles.smallEmpty}>No contributors yet</div>
            ) : (
               <div className={styles.leaderboardList}>
                  {data.creators.top.map((c: any, i: number) => (
                     <div key={c.id} className={styles.leaderboardRow}>
                        <div className={styles.leaderboardRank}>#{i + 1}</div>
                        <div className={styles.creatorAvatar}>{c.avatar}</div>
                        <div className={styles.leaderboardInfo}>
                           <div className={styles.leaderboardName}>
                              {c.name}
                           </div>
                           <div className={styles.leaderboardMeta}>
                              {c.views.toLocaleString()} views generated
                           </div>
                        </div>
                        <div className={styles.leaderboardValue}>
                           {fmtMoney(c.earned)}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
