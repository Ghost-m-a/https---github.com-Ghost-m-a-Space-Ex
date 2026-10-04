"use client";

import React, { useEffect, useState } from "react";
import {
   TrendingUp,
   TrendingDown,
   DollarSign,
   ShoppingCart,
   Users,
   Percent,
   Plus,
} from "lucide-react";
import { useWorkspace } from "../context/workspace-context";
import { BusinessAnalytics } from "../lib/types";
import styles from "./business.module.css";

export default function BusinessHomePage() {
   const { activeBusiness } = useWorkspace();
   const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);

   useEffect(() => {
      fetch("/api/business/analytics")
         .then((r) => r.json())
         .then(setAnalytics);
   }, []);

   if (!analytics) return <div className={styles.loading}>Loading...</div>;

   const stats = [
      {
         label: "Total Revenue",
         value: `$${analytics.totalRevenue.toLocaleString()}`,
         change: analytics.revenueChange,
         icon: <DollarSign size={18} />,
      },
      {
         label: "Total Orders",
         value: analytics.totalOrders.toLocaleString(),
         change: analytics.ordersChange,
         icon: <ShoppingCart size={18} />,
      },
      {
         label: "Conversion Rate",
         value: `${analytics.conversionRate}%`,
         change: analytics.conversionChange,
         icon: <Percent size={18} />,
      },
      {
         label: "Active Subscriptions",
         value: analytics.activeSubscriptions.toLocaleString(),
         change: 4.1,
         icon: <Users size={18} />,
      },
   ];

   const maxRevenue = Math.max(...analytics.chartData.map((d) => d.revenue));
   const points = analytics.chartData.map((d, i) => {
      const x = (i / (analytics.chartData.length - 1)) * 900;
      const y = 200 - (d.revenue / maxRevenue) * 180;
      return `${x},${y}`;
   });
   const pathD = `M ${points.join(" L ")}`;

   return (
      <div className={styles.bizHome}>
         <div className={styles.header}>
            <div>
               <h1 className={styles.title}>
                  {activeBusiness?.name || "Your Business"}
               </h1>
               <p className={styles.subtitle}>
                  Here's how your business is performing today.
               </p>
            </div>
            <button className={styles.primaryBtn}>
               <Plus size={16} /> New Product
            </button>
         </div>

         {/* Stats */}
         <div className={styles.statsGrid}>
            {stats.map((s, i) => (
               <div key={i} className={styles.statCard}>
                  <div className={styles.statTop}>
                     <span className={styles.statLabel}>{s.label}</span>
                     <div className={styles.statIcon}>{s.icon}</div>
                  </div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div
                     className={`${styles.statChange} ${s.change >= 0 ? styles.pos : styles.neg}`}
                  >
                     {s.change >= 0 ? (
                        <TrendingUp size={14} />
                     ) : (
                        <TrendingDown size={14} />
                     )}
                     {Math.abs(s.change)}% vs last month
                  </div>
               </div>
            ))}
         </div>

         {/* Chart */}
         <div className={styles.chartCard}>
            <div className={styles.cardTitle}>Revenue — Last 30 days</div>
            <svg
               viewBox="0 0 900 200"
               className={styles.chart}
               preserveAspectRatio="none"
            >
               <defs>
                  <linearGradient id="bizGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                     <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                  </linearGradient>
               </defs>
               <path d={`${pathD} L 900,200 L 0,200 Z`} fill="url(#bizGrad)" />
               <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
         </div>
      </div>
   );
}
