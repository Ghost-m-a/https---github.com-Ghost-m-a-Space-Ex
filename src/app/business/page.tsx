"use client";

import React, { useEffect, useState } from "react";
import {
   Download,
   Upload,
   Send,
   Zap,
   Globe,
   ChevronRight,
   Plus,
   CreditCard,
} from "lucide-react";
import { useWorkspace } from "../context/workspace-context";
import styles from "./business.module.css";
import DepositModal from "../components/deposit-modal";
import SendModal from "../components/send-modal";

interface HomeData {
   business: {
      id: string;
      name: string;
      initial: string;
      balance: number;
      economicIntelligence: boolean;
   };
   chartData: { date: string; balance: number }[];
   websites: any[];
   weeklyCardSpend: number[];
   cardSpendTotal: number;
   liveEvents: any[];
}

export default function BusinessHomePage() {
   const { activeBusiness } = useWorkspace();
   const [data, setData] = useState<HomeData | null>(null);
   const [loading, setLoading] = useState(true);
   const [depositOpen, setDepositOpen] = useState(false);
   const [sendOpen, setSendOpen] = useState(false);

   const load = async () => {
      setLoading(true);
      const url = activeBusiness?.id
         ? `/api/business/home?businessId=${activeBusiness.id}`
         : `/api/business/home`;
      const res = await fetch(url);
      if (res.ok) {
         setData(await res.json());
      }
      setLoading(false);
   };

   useEffect(() => {
      load();
   }, [activeBusiness?.id]);

   const toggleEconomicIntelligence = async () => {
      if (!data) return;
      const next = !data.business.economicIntelligence;
      setData({
         ...data,
         business: { ...data.business, economicIntelligence: next },
      });
      await fetch("/api/business/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            businessId: data.business.id,
            economicIntelligence: next,
         }),
      });
   };

   if (loading) return <div className={styles.loading}>Loading...</div>;
   if (!data)
      return (
         <div className={styles.loading}>
            No business found. Create one first.
         </div>
      );

   // Build SVG path for balance chart
   const chartW = 900;
   const chartH = 200;
   const maxBalance = Math.max(1, ...data.chartData.map((d) => d.balance));
   const points = data.chartData.map((d, i) => {
      const x = (i / Math.max(1, data.chartData.length - 1)) * chartW;
      const y = chartH - (d.balance / maxBalance) * (chartH - 20) - 10;
      return `${x},${y}`;
   });
   const pathD = `M ${points.join(" L ")}`;

   const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
   const maxSpend = Math.max(1, ...data.weeklyCardSpend);

   return (
      <div className={styles.bizHomeLayout}>
         {/* MAIN COLUMN */}
         <div className={styles.bizMain}>
            <div className={styles.balanceHeader}>
               <div className={styles.balanceLabel}>
                  Total balance · {data.business.name}
               </div>
               <div className={styles.balanceValue}>
                  ${data.business.balance.toFixed(2)}
               </div>
            </div>

            {/* Chart */}
            <div className={styles.chartWrapper}>
               <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className={styles.chart}
                  preserveAspectRatio="none"
               >
                  <defs>
                     <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                     </linearGradient>
                  </defs>
                  <path
                     d={`${pathD} L ${chartW},${chartH} L 0,${chartH} Z`}
                     fill="url(#homeGrad)"
                  />
                  <path
                     d={pathD}
                     fill="none"
                     stroke="#ffffff"
                     strokeWidth="1.5"
                  />
               </svg>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionRow}>
               <button
                  className={styles.actionBtn}
                  onClick={() => setDepositOpen(true)}
               >
                  <Download size={16} /> Deposit
               </button>
               <button className={styles.actionBtn}>
                  <Upload size={16} /> Accept
               </button>
               <button
                  className={styles.actionBtn}
                  onClick={() => setSendOpen(true)}
               >
                  <Send size={16} /> Send
               </button>
            </div>

            {/* Economic Intelligence */}
            <div className={styles.econCard}>
               <div className={styles.econTitle}>
                  <div className={styles.econIcon}>
                     <Zap size={14} />
                  </div>
                  <span>
                     {data.business.name} can grow <strong>3x faster</strong>{" "}
                     with Economic Intelligence.
                  </span>
               </div>
               <div className={styles.econToggleRow}>
                  <div className={styles.econToggleLeft}>
                     <Zap size={16} className={styles.zapIcon} />
                     <span>Turn on</span>
                  </div>
                  <button
                     className={`${styles.switch} ${
                        data.business.economicIntelligence
                           ? styles.switchOn
                           : ""
                     }`}
                     onClick={toggleEconomicIntelligence}
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            </div>
         </div>

         {/* RIGHT SIDEBAR */}
         <aside className={styles.bizSidebar}>
            {/* Websites */}
            <div className={styles.sideCard}>
               <div className={styles.sideCardHeader}>
                  <span>Websites</span>
                  <ChevronRight size={16} />
               </div>
               {data.websites.length === 0 ? (
                  <div className={styles.sideEmpty}>
                     <div className={styles.sideEmptyTitle}>No website yet</div>
                     <div className={styles.sideEmptySub}>
                        Create or import a website to take payments, see
                        visitors, and increase sales
                     </div>
                     <button className={styles.sideLink}>
                        <Plus size={14} /> Add a website
                     </button>
                  </div>
               ) : (
                  <div className={styles.websiteList}>
                     {data.websites.map((w) => (
                        <div key={w.id} className={styles.websiteItem}>
                           <Globe size={16} />
                           <div>
                              <div className={styles.websiteName}>{w.name}</div>
                              <div className={styles.websiteDomain}>
                                 {w.domain}
                              </div>
                           </div>
                           <div className={styles.websiteVisits}>
                              {w.visits} visits
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Card Spend */}
            <div className={styles.sideCard}>
               <div className={styles.cardVisual}>
                  <div className={styles.cardBrand}>VISA</div>
                  <div className={styles.cardChip} />
               </div>
               <div className={styles.cardSpendLabel}>Weekly card spend</div>
               <div className={styles.cardSpendValue}>
                  ${data.cardSpendTotal.toFixed(2)}
               </div>
               <div className={styles.spendBars}>
                  {data.weeklyCardSpend.map((amount, i) => (
                     <div key={i} className={styles.spendBarCol}>
                        <div
                           className={styles.spendBar}
                           style={{
                              height: `${Math.max(4, (amount / maxSpend) * 100)}%`,
                              opacity: amount > 0 ? 1 : 0.3,
                           }}
                        />
                        <div className={styles.spendBarLabel}>
                           {dayLabels[i]}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Balances */}
            <div className={styles.sideCard}>
               <div className={styles.sideCardHeader}>
                  <span>Balances</span>
               </div>
               <button className={styles.balanceRow}>
                  <div className={styles.balanceRowLeft}>
                     <span className={styles.flagIcon}>🇺🇸</span>
                     <span>USD</span>
                  </div>
                  <div className={styles.balanceRowRight}>
                     <span>${data.business.balance.toFixed(2)}</span>
                     <ChevronRight size={16} />
                  </div>
               </button>
            </div>
         </aside>

         {/* Modals */}
         <DepositModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            businessId={data.business.id}
            onSuccess={load}
         />
         <SendModal
            isOpen={sendOpen}
            onClose={() => setSendOpen(false)}
            businessId={data.business.id}
            balance={data.business.balance}
            onSuccess={load}
         />
      </div>
   );
}
