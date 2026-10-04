"use client";

import React, { useEffect, useState } from "react";
import { BusinessAnalytics } from "../../lib/types";
import styles from "../business.module.css";

export default function AnalyticsPage() {
   const [data, setData] = useState<BusinessAnalytics | null>(null);

   useEffect(() => {
      fetch("/api/business/analytics")
         .then((r) => r.json())
         .then(setData);
   }, []);

   if (!data) return <div className={styles.loading}>Loading...</div>;

   const maxRevenue = Math.max(...data.chartData.map((d) => d.revenue));
   const revenuePoints = data.chartData.map((d, i) => {
      const x = (i / (data.chartData.length - 1)) * 900;
      const y = 240 - (d.revenue / maxRevenue) * 220;
      return `${x},${y}`;
   });
   const revenuePath = `M ${revenuePoints.join(" L ")}`;

   const maxOrders = Math.max(...data.chartData.map((d) => d.orders));
   const orderPoints = data.chartData.map((d, i) => {
      const x = (i / (data.chartData.length - 1)) * 900;
      const y = 240 - (d.orders / maxOrders) * 220;
      return `${x},${y}`;
   });
   const ordersPath = `M ${orderPoints.join(" L ")}`;

   return (
      <div className={styles.page}>
         <h1 className={styles.title}>Analytics</h1>

         <div className={styles.analyticsGrid}>
            <div className={styles.chartCard}>
               <div className={styles.cardTitle}>Revenue</div>
               <svg
                  viewBox="0 0 900 240"
                  className={styles.chart}
                  preserveAspectRatio="none"
               >
                  <defs>
                     <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                     </linearGradient>
                  </defs>
                  <path
                     d={`${revenuePath} L 900,240 L 0,240 Z`}
                     fill="url(#revGrad)"
                  />
                  <path
                     d={revenuePath}
                     fill="none"
                     stroke="#10b981"
                     strokeWidth="2"
                  />
               </svg>
            </div>

            <div className={styles.chartCard}>
               <div className={styles.cardTitle}>Orders</div>
               <svg
                  viewBox="0 0 900 240"
                  className={styles.chart}
                  preserveAspectRatio="none"
               >
                  <defs>
                     <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                     </linearGradient>
                  </defs>
                  <path
                     d={`${ordersPath} L 900,240 L 0,240 Z`}
                     fill="url(#ordGrad)"
                  />
                  <path
                     d={ordersPath}
                     fill="none"
                     stroke="#3b82f6"
                     strokeWidth="2"
                  />
               </svg>
            </div>
         </div>

         <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Avg Order Value</div>
               <div className={styles.kpiValue}>
                  ${(data.totalRevenue / data.totalOrders).toFixed(2)}
               </div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Conversion Rate</div>
               <div className={styles.kpiValue}>{data.conversionRate}%</div>
            </div>
            <div className={styles.kpiCard}>
               <div className={styles.kpiLabel}>Subscriptions</div>
               <div className={styles.kpiValue}>{data.activeSubscriptions}</div>
            </div>
         </div>
      </div>
   );
}
