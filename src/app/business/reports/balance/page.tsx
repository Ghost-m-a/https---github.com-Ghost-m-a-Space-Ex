"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, MoreHorizontal } from "lucide-react";
import { useWorkspace } from "../../../context/workspace-context";
import styles from "./balance.module.css";

export default function BalanceReportPage() {
   const { activeBusiness } = useWorkspace();
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [range, setRange] = useState("6M");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/payments?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         // Aggregate
         const payments = d.payments || [];
         const moneyIn = payments
            .filter((p) => p.status === "succeeded")
            .reduce((s: number, p: any) => s + p.amount, 0);
         setData({
            moneyIn,
            moneyOut: 0,
            deposits: moneyIn,
            withdrawals: 0,
            startingBalance: 0,
            endingBalance: moneyIn,
         });
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const format = (n: number) =>
      new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "USD",
      }).format(n);

   return (
      <div className={styles.page}>
         <Link href="/business/analytics" className={styles.backLink}>
            <ArrowLeft size={14} /> Analytics
         </Link>

         <div className={styles.header}>
            <div>
               <div className={styles.headerLabel}>Net cashflow</div>
               <div className={styles.balanceValue}>
                  {loading
                     ? "—"
                     : format((data?.moneyIn || 0) - (data?.moneyOut || 0))}
               </div>
            </div>
         </div>

         <div className={styles.chartCard}>
            <svg
               viewBox="0 0 800 200"
               className={styles.chart}
               preserveAspectRatio="none"
            >
               <line
                  x1="0"
                  y1="100"
                  x2="800"
                  y2="100"
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
               />
               <line
                  x1="0"
                  y1="100"
                  x2="800"
                  y2="100"
                  stroke="#10b981"
                  strokeWidth="2"
               />
               {[80, 220, 360, 500, 640, 760].map((x) => (
                  <circle key={x} cx={x} cy="100" r="3" fill="#10b981" />
               ))}
            </svg>

            <div className={styles.chartMonths}>
               {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m) => (
                  <span key={m}>{m}</span>
               ))}
            </div>
         </div>

         <div className={styles.controls}>
            <div className={styles.rangeTabs}>
               {["1M", "6M", "1Y", "ALL"].map((r) => (
                  <button
                     key={r}
                     className={`${styles.rangeBtn} ${range === r ? styles.rangeActive : ""}`}
                     onClick={() => setRange(r)}
                  >
                     {r}
                  </button>
               ))}
               <button className={styles.rangeBtn}>
                  <MoreHorizontal size={14} />
               </button>
            </div>
            <button className={styles.downloadBtn}>
               <Download size={14} /> Download statements and activity
            </button>
         </div>

         <div className={styles.statCardFull}>
            <div className={styles.statLabel}>Starting balance</div>
            <div className={styles.statValue}>
               {format(data?.startingBalance || 0)}
            </div>
            <div className={styles.statSub}>
               on{" "}
               {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
               })}
               , 12:59 PM GMT+2
            </div>
         </div>

         <div className={styles.statGrid2}>
            <div className={styles.statCard}>
               <div className={styles.statLabel}>Money in</div>
               <div className={styles.statValue}>
                  {format(data?.moneyIn || 0)}
               </div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statLabel}>Money out</div>
               <div className={styles.statValue}>
                  -{format(data?.moneyOut || 0)}
               </div>
            </div>
         </div>

         <div className={styles.statGrid2}>
            <div className={styles.statCard}>
               <div className={styles.statLabel}>Deposits</div>
               <div className={styles.statValue}>
                  {format(data?.deposits || 0)}
               </div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statLabel}>Withdrawals</div>
               <div className={styles.statValue}>
                  {format(data?.withdrawals || 0)}
               </div>
            </div>
         </div>

         <div className={styles.statCardFull}>
            <div className={styles.statLabel}>Ending balance</div>
            <div className={styles.statValue}>
               {format(data?.endingBalance || 0)}
            </div>
            <div className={styles.statSub}>
               on{" "}
               {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
               })}
               , 12:59 PM GMT+3
            </div>
         </div>
      </div>
   );
}
