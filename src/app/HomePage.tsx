"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Zap, TrendingUp, Circle } from "lucide-react";
import styles from "@/styles/pages/home.module.css";

interface Balance {
   id: string;
   name: string;
   avatar: string;
   amount: number;
   href: string;
}

interface PulseEvent {
   id: string;
   kind: string;
   actorName: string;
   actorAvatar: string;
   businessName: string;
   amount: number;
   message: string;
   location: string;
   countryCode: string;
   createdAt: string;
}

export default function PersonalHomePage() {
   const [balances, setBalances] = useState<Balance[]>([]);
   const [total, setTotal] = useState(0);
   const [pulse, setPulse] = useState<PulseEvent[]>([]);
   const [loadingBalances, setLoadingBalances] = useState(true);
   const [loadingPulse, setLoadingPulse] = useState(true);
   const [economicIntelligence, setEconomicIntelligence] = useState(false);

   useEffect(() => {
      fetch("/api/personal/balances", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => {
            setBalances(d.balances ?? []);
            setTotal(d.total ?? 0);
         })
         .finally(() => setLoadingBalances(false));

      fetch("/api/pulse?limit=10", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setPulse(d.events ?? []))
         .finally(() => setLoadingPulse(false));
   }, []);

   const fmtMoney = (n: number) =>
      `$${(n ?? 0).toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })}`;

   const formatTime = (t: string) => {
      const diff = Date.now() - new Date(t).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return "just now";
      if (min < 60) return `${min}m ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      return `${Math.floor(hr / 24)}d ago`;
   };

   return (
      <div className={styles.page}>
         <div className={styles.layout}>
            {/* LEFT COLUMN */}
            <div className={styles.main}>
               {/* Total balance hero */}
               <div className={styles.heroSection}>
                  <div className={styles.heroLabel}>
                     Total balance · All balances
                  </div>
                  <div className={styles.heroAmount}>
                     {loadingBalances ? "—" : fmtMoney(total)}
                  </div>
                  <BalanceChart />
               </div>

               {/* Economic Intelligence banner */}
               <div className={styles.eiCard}>
                  <div className={styles.eiText}>
                     Businesses grow <strong>3x faster</strong> with Economic
                     Intelligence.
                  </div>
                  <button
                     type="button"
                     className={styles.eiRow}
                     onClick={() => setEconomicIntelligence((v) => !v)}
                  >
                     <div className={styles.eiLeft}>
                        <Zap size={14} />
                        <span>{economicIntelligence ? "On" : "Turn on"}</span>
                     </div>
                     <div
                        className={`${styles.switch} ${
                           economicIntelligence ? styles.switchOn : ""
                        }`}
                     >
                        <span className={styles.switchKnob} />
                     </div>
                  </button>
               </div>
            </div>

            {/* RIGHT COLUMN */}
            <aside className={styles.side}>
               {/* Balances card */}
               <div className={styles.card}>
                  <div className={styles.cardHeader}>Balances</div>
                  <div className={styles.balanceList}>
                     {loadingBalances ? (
                        <div className={styles.skeletonRow} />
                     ) : (
                        balances.map((b) => (
                           <Link
                              key={b.id}
                              href={b.href}
                              className={styles.balanceRow}
                           >
                              <div className={styles.balanceAvatar}>
                                 {b.avatar}
                              </div>
                              <div className={styles.balanceName}>{b.name}</div>
                              <div className={styles.balanceAmount}>
                                 {fmtMoney(b.amount)}
                              </div>
                              <ChevronRight
                                 size={14}
                                 className={styles.balanceChev}
                              />
                           </Link>
                        ))
                     )}
                  </div>
               </div>

               {/* Pulse card */}
               <div className={styles.card}>
                  <div className={styles.cardHeader}>
                     <span>Pulse</span>
                     <span className={styles.pulseDot} />
                  </div>
                  <div className={styles.pulseList}>
                     {loadingPulse ? (
                        <>
                           <div className={styles.skeletonRow} />
                           <div className={styles.skeletonRow} />
                           <div className={styles.skeletonRow} />
                        </>
                     ) : pulse.length === 0 ? (
                        <div className={styles.emptySmall}>No activity yet</div>
                     ) : (
                        pulse.map((e) => (
                           <div key={e.id} className={styles.pulseRow}>
                              <div className={styles.pulseAvatar}>
                                 {e.actorAvatar || "?"}
                              </div>
                              <div className={styles.pulseInfo}>
                                 <div className={styles.pulseMessage}>
                                    <span className={styles.pulseName}>
                                       {e.actorName}
                                    </span>{" "}
                                    {e.amount > 0 ? (
                                       <>
                                          just made a{" "}
                                          <strong
                                             className={styles.pulseAmount}
                                          >
                                             {fmtMoney(e.amount)}
                                          </strong>{" "}
                                          sale
                                       </>
                                    ) : (
                                       e.message
                                    )}
                                 </div>
                                 <div className={styles.pulseMeta}>
                                    {e.businessName && (
                                       <>
                                          {e.businessName}
                                          {e.location && " · "}
                                       </>
                                    )}
                                    {e.location}
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </aside>
         </div>
      </div>
   );
}

// ---- Sparkline chart (SVG) ----
function BalanceChart() {
   // Simple placeholder sparkline — replace with real data when available
   const points = [
      22, 30, 26, 35, 28, 42, 38, 45, 50, 42, 48, 46, 44, 48, 52, 45, 42, 48,
      50, 55, 52, 48, 46, 50,
   ];
   const max = Math.max(...points);
   const min = Math.min(...points);
   const range = max - min || 1;
   const width = 800;
   const height = 100;

   const path = points
      .map((p, i) => {
         const x = (i / (points.length - 1)) * width;
         const y = height - ((p - min) / range) * height;
         return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

   return (
      <div className={styles.chartWrap}>
         <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={styles.chart}
         >
            <defs>
               <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
               </linearGradient>
            </defs>
            <path
               d={`${path} L ${width} ${height} L 0 ${height} Z`}
               fill="url(#chartFill)"
            />
            <path
               d={path}
               fill="none"
               stroke="rgba(255,255,255,0.35)"
               strokeWidth="1.5"
            />
         </svg>
      </div>
   );
}
