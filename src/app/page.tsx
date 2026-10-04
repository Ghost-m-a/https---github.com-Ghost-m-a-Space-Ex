"use client";

import React, { useEffect, useState } from "react";
import { Zap, ChevronRight, Home as HomeIcon } from "lucide-react";
import { HomeStats } from "./lib/types";
import styles from "./page.module.css";

export default function HomePage() {
   const [stats, setStats] = useState<HomeStats | null>(null);
   const [econIntel, setEconIntel] = useState(false);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch("/api/home")
         .then((r) => r.json())
         .then(setStats)
         .finally(() => setLoading(false));
   }, []);

   if (loading || !stats) {
      return <div className={styles.loading}>Loading...</div>;
   }

   // Build SVG path for the chart
   const width = 900;
   const height = 200;
   const points = stats.chartData.map((d, i) => {
      const x = (i / (stats.chartData.length - 1)) * width;
      const y = height - (d.value / 100) * height;
      return `${x},${y}`;
   });
   const pathD = `M ${points.join(" L ")}`;

   return (
      <div className={styles.homePage}>
         {/* Balance Header */}
         <div className={styles.balanceHeader}>
            <div className={styles.balanceLabel}>
               Total balance · All balances
            </div>
            <div className={styles.balanceValue}>
               ${stats.totalBalance.toFixed(2)}
            </div>
         </div>

         {/* Chart */}
         <div className={styles.chartWrapper}>
            <div className={styles.chartTooltip}>
               Your balance will appear here.
            </div>
            <svg
               viewBox={`0 0 ${width} ${height}`}
               className={styles.chart}
               preserveAspectRatio="none"
            >
               <defs>
                  <linearGradient
                     id="chartGradient"
                     x1="0"
                     y1="0"
                     x2="0"
                     y2="1"
                  >
                     <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                     <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
               </defs>
               <path
                  d={`${pathD} L ${width},${height} L 0,${height} Z`}
                  fill="url(#chartGradient)"
               />
               <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="2" />
            </svg>
         </div>

         {/* Economic Intelligence */}
         <div className={styles.card}>
            <div className={styles.econTitle}>
               Businesses grow <span className={styles.blue}>3x faster</span>{" "}
               with Economic Intelligence.
            </div>
            <div className={styles.econToggle}>
               <div className={styles.econToggleLeft}>
                  <Zap size={16} className={styles.zapIcon} />
                  <span>Turn on</span>
               </div>
               <button
                  className={`${styles.switch} ${econIntel ? styles.switchOn : ""}`}
                  onClick={() => setEconIntel(!econIntel)}
                  aria-label="Toggle Economic Intelligence"
               >
                  <span className={styles.switchThumb} />
               </button>
            </div>
         </div>

         {/* Balances */}
         <div className={styles.card}>
            <div className={styles.cardTitle}>Balances</div>
            <button className={styles.balanceRow}>
               <div className={styles.balanceRowLeft}>
                  <div className={styles.avatarCircle}>DZ</div>
                  <span>Personal</span>
               </div>
               <div className={styles.balanceRowRight}>
                  <span>$0.00</span>
                  <ChevronRight size={18} />
               </div>
            </button>
         </div>

         {/* Pulse */}
         <div className={styles.card}>
            <div className={styles.cardTitle}>
               Pulse <span className={styles.pulseDot} />
            </div>
            <div className={styles.pulseEmpty}>
               Live activity across Whop will appear here.
            </div>
         </div>
      </div>
   );
}
