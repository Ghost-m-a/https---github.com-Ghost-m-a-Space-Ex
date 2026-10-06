"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Plus, ArrowRight } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
   const { activeBusiness } = useWorkspace();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const url = activeBusiness?.id
         ? `/api/business/analytics?businessId=${activeBusiness.id}`
         : `/api/business/analytics`;
      setLoading(true);
      fetch(url)
         .then((r) => r.json())
         .then(setData)
         .finally(() => setLoading(false));
   }, [activeBusiness?.id]);

   if (loading)
      return <div className={styles.loading}>Loading analytics...</div>;
   if (!data) return <div className={styles.loading}>No business found.</div>;

   const m = data.metrics;
   const p = data.profit;

   // Profit chart points
   const chartW = 800;
   const chartH = 200;
   const maxVal = Math.max(1, ...p.hourly.map((h: any) => Math.abs(h.profit)));
   const mid = chartH / 2;
   const profitPoints = p.hourly.map((h: any, i: number) => {
      const x = (i / 23) * chartW;
      const y = mid - (h.profit / maxVal) * (mid - 20);
      return `${x},${y}`;
   });
   const profitPath = `M ${profitPoints.join(" L ")}`;

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.header}>
            <div className={styles.headerLeft}>
               <button className={styles.dateBtn}>Today ▾</button>
               <span className={styles.dateText}>
                  📅{" "}
                  {new Date(data.date).toLocaleDateString("en-US", {
                     month: "short",
                     day: "numeric",
                     year: "numeric",
                  })}
               </span>
            </div>
            <button className={styles.customizeBtn}>
               <Pencil size={14} /> Customize
            </button>
         </div>

         {/* Top row: Profit + Cashflow */}
         <div className={styles.topRow}>
            <div className={styles.profitCard}>
               <div className={styles.cardLabel}>Profit</div>
               <div className={styles.cardValue}>${p.today.toFixed(2)}</div>
               <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className={styles.profitChart}
                  preserveAspectRatio="none"
               >
                  <defs>
                     <linearGradient
                        id="profitGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                     >
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                     </linearGradient>
                  </defs>
                  <line
                     x1="0"
                     y1={mid}
                     x2={chartW}
                     y2={mid}
                     stroke="var(--border-color)"
                     strokeDasharray="4 4"
                  />
                  <path
                     d={profitPath}
                     fill="none"
                     stroke="#10b981"
                     strokeWidth="2"
                  />
               </svg>
               <div className={styles.chartLegend}>
                  <span>
                     <span className={styles.legendDotGreen} /> Money in $
                     {p.moneyIn.toFixed(2)}
                  </span>
                  <span>
                     <span className={styles.legendDotRed} /> Money out $
                     {p.moneyOut.toFixed(2)}
                  </span>
               </div>
            </div>

            <div className={styles.cashflowCard}>
               <div className={styles.cardLabel}>Cashflow</div>

               <div className={styles.cashflowRow}>
                  <div>
                     <div className={styles.cfLabel}>Payments</div>
                     <div className={styles.cfValue}>
                        {data.cashflow.payments.count} payments
                     </div>
                  </div>
                  <button className={styles.cfBtn}>Accept a payment</button>
               </div>

               <div className={styles.cashflowRow}>
                  <div>
                     <div className={styles.cfLabel}>Card spend</div>
                     <div className={styles.cfValue}>
                        {data.cashflow.cardSpend.count} transactions
                     </div>
                  </div>
                  <button className={styles.cfBtn}>Get a card</button>
               </div>

               <div className={styles.cashflowRow}>
                  <div>
                     <div className={styles.cfLabel}>Ads</div>
                     <div className={styles.cfValue}>
                        {data.cashflow.ads.count} campaigns
                     </div>
                  </div>
                  <button className={styles.cfBtn}>Run ads</button>
               </div>

               <a href="#" className={styles.cashflowFooter}>
                  View cashflow report <ArrowRight size={14} />
               </a>
            </div>
         </div>

         {/* Metrics row */}
         <div className={styles.metricsRow}>
            <div className={styles.metric}>
               <div className={styles.metricLabel}>Ad spend</div>
               <div className={styles.metricValue}>${m.adSpend.toFixed(2)}</div>
            </div>
            <div className={styles.metric}>
               <div className={styles.metricLabel}>Visitors</div>
               <div className={styles.metricValue}>{m.visitors || "--"}</div>
            </div>
            <div className={styles.metric}>
               <div className={styles.metricLabel}>Successful payments</div>
               <div className={styles.metricValue}>{m.successfulPayments}</div>
            </div>
            <div className={styles.metric}>
               <div className={styles.metricLabel}>Profit margin</div>
               <div className={styles.metricValue}>
                  {m.profitMargin > 0 ? `${m.profitMargin.toFixed(1)}%` : "--"}
               </div>
            </div>
         </div>

         {/* Gross transaction value + Live events */}
         <div className={styles.gridRow}>
            <div className={styles.bigCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>
                     Gross transaction value
                  </div>
                  <button className={styles.dropdownSmall}>Per period ▾</button>
               </div>
               <div className={styles.cardValue}>
                  ${m.grossTransactionValue.toFixed(2)}
               </div>
               <div className={styles.cardSub}>Today</div>
               <div className={styles.emptyChart}>
                  {m.grossTransactionValue === 0 && "No data available"}
               </div>
            </div>

            <div className={styles.bigCard}>
               <div className={styles.liveEventsHeader}>
                  <span className={styles.liveDot} />
                  <span>Live events</span>
               </div>
               {data.liveEvents.length === 0 ? (
                  <div className={styles.liveEmpty}>
                     <div className={styles.globePlaceholder}>🌍</div>
                     <div className={styles.liveEmptyTitle}>
                        No website connected
                     </div>
                     <button className={styles.smallOutlineBtn}>
                        Add website
                     </button>
                  </div>
               ) : (
                  <div className={styles.liveList}>
                     {data.liveEvents.slice(0, 5).map((e: any) => (
                        <div key={e.id} className={styles.liveEvent}>
                           <div className={styles.liveEventDot} />
                           <div className={styles.liveEventText}>
                              <div>{e.message}</div>
                              <div className={styles.liveEventMeta}>
                                 {e.city}, {e.country}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Top sources + Traffic over time + Avg revenue */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Top sources</div>
               {data.traffic.topSources.length === 0 ? (
                  <div className={styles.smallEmpty}>
                     <button className={styles.smallOutlineBtn}>
                        <Plus size={14} /> Add website
                     </button>
                  </div>
               ) : (
                  <ul className={styles.sourceList}>
                     {data.traffic.topSources.map((s: any) => (
                        <li key={s.source}>
                           <span>{s.source}</span>
                           <span>{s.visits}</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>

            <div className={styles.smallCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>Traffic over time</div>
               </div>
               <div className={styles.smallEmpty}>
                  {data.traffic.visitors === 0 && "No website connected"}
               </div>
            </div>

            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Avg revenue per customer</div>
               <div className={styles.cardValue}>
                  ${m.avgRevenuePerCustomer.toFixed(2)}
               </div>
            </div>
         </div>

         {/* Total refunded + Devices + Countries */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Total refunded</div>
               <div className={styles.cardValue}>
                  ${m.totalRefunded.toFixed(2)}
               </div>
               <div className={styles.smallEmpty}>No data available</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Devices</div>
               <div className={styles.smallEmpty}>
                  <button className={styles.smallOutlineBtn}>
                     + Add website
                  </button>
               </div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Countries</div>
               <div className={styles.smallEmpty}>
                  <button className={styles.smallOutlineBtn}>
                     + Add website
                  </button>
               </div>
            </div>
         </div>

         {/* Top pages + Abandoned checkouts */}
         <div className={styles.gridRow2}>
            <div className={styles.bigCard}>
               <div className={styles.cardLabel}>Top pages</div>
               {data.traffic.topPages.length === 0 ? (
                  <div className={styles.tallEmpty}>
                     <button className={styles.smallOutlineBtn}>
                        <Plus size={14} /> Add website
                     </button>
                  </div>
               ) : (
                  <ul className={styles.sourceList}>
                     {data.traffic.topPages.map((p: any) => (
                        <li key={p.path}>
                           <span>{p.path}</span>
                           <span>{p.visits}</span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>

            <div className={styles.bigCard}>
               <div className={styles.cardHeaderRow}>
                  <div className={styles.cardLabel}>Abandoned checkouts</div>
                  <a href="#" className={styles.smallLink}>
                     View all
                  </a>
               </div>
               <div className={styles.tallEmpty}>
                  <button className={styles.smallOutlineBtn}>
                     <Plus size={14} /> Add website
                  </button>
               </div>
            </div>
         </div>

         {/* Traffic by time */}
         <div className={styles.fullCard}>
            <div className={styles.cardLabel}>Traffic by time</div>
            <div className={styles.tallEmpty}>
               <button className={styles.smallOutlineBtn}>
                  <Plus size={14} /> Add website
               </button>
            </div>
         </div>

         {/* Rates row 1 */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>New customers</div>
               <div className={styles.cardValue}>{m.newCustomers}</div>
               <div className={styles.smallEmpty}>No data available</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Refund rate</div>
               <div className={styles.cardValue}>
                  {m.refundRate.toFixed(0)}%
               </div>
               <div className={styles.smallEmpty}>No data available</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Dispute rate</div>
               <div className={styles.cardValue}>{m.disputeRate}%</div>
               <div className={styles.smallEmpty}>No data available</div>
            </div>
         </div>

         {/* Rates row 2 */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Paid active members</div>
               <div className={styles.cardValue}>{m.paidActiveMembers}</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Churn rate</div>
               <div className={styles.cardValue}>{m.churnRate}%</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Churned revenue</div>
               <div className={styles.cardValue}>
                  ${m.churnedRevenue.toFixed(2)}
               </div>
            </div>
         </div>

         {/* Revenue row */}
         <div className={styles.gridRow3}>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Gross payment revenue</div>
               <div className={styles.cardValue}>
                  ${m.grossPaymentRevenue.toFixed(2)}
               </div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>MRR</div>
               <div className={styles.cardValue}>${m.mrr.toFixed(2)}</div>
            </div>
            <div className={styles.smallCard}>
               <div className={styles.cardLabel}>Users breakdown</div>
               <div className={styles.breakdownBar}>
                  <div
                     className={styles.breakdownFill}
                     style={{ width: "100%" }}
                  />
               </div>
               <div className={styles.breakdownLabel}>
                  <span className={styles.dotPurple} /> Joined{" "}
                  {data.usersBreakdown.joined} (100%)
               </div>
            </div>
         </div>
      </div>
   );
}
