"use client";

import { useEffect, useState } from "react";
import {
   Mail,
   Link as LinkIcon,
   CircleDollarSign,
   Sparkles,
   Trophy,
   Lock,
   ArrowUpRight,
} from "lucide-react";
import styles from "@/styles/pages/partners.module.css";

interface Referral {
   id: string;
   businessName: string;
   businessAvatar: string;
   volume30d: number;
   earnings: number;
   referredUser: string;
   attributedAt: string;
   status: string;
}

interface LeaderboardEntry {
   rank: number;
   name: string;
   avatarColor: string;
   location: string;
   earnings: number;
}

interface PartnerData {
   user: {
      name: string;
      username: string;
      avatarColor: string;
      partnerLevel: string;
   };
   totalEarned: number;
   last30: number;
   isVerified: boolean;
   referrals: Referral[];
   chart: { date: string; earnings: number }[];
}

type Range = "per-day" | "per-week" | "per-month";

export default function PartnersPage() {
   const [data, setData] = useState<PartnerData | null>(null);
   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
   const [loading, setLoading] = useState(true);
   const [range, setRange] = useState<Range>("per-day");

   useEffect(() => {
      Promise.all([
         fetch("/api/partners/stats", { credentials: "include" }).then((r) =>
            r.json(),
         ),
         fetch("/api/partners/leaderboard").then((r) => r.json()),
      ])
         .then(([stats, lb]) => {
            setData(stats);
            setLeaderboard(lb.leaderboard ?? []);
         })
         .finally(() => setLoading(false));
   }, []);

   const fmtMoney = (n: number) =>
      `$${(n ?? 0).toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })}`;

   if (loading || !data) {
      return <div className={styles.loading}>Loading…</div>;
   }

   const initials = data.user.name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <div className={styles.page}>
         <div className={styles.layout}>
            {/* LEFT — main column */}
            <div className={styles.main}>
               {/* Chart header */}
               <div className={styles.chartHead}>
                  <div>
                     <div className={styles.chartLabel}>Total earnings</div>
                     <div className={styles.chartValue}>
                        {fmtMoney(data.totalEarned)}
                     </div>
                  </div>
                  <div className={styles.chartControls}>
                     <select className={styles.select} defaultValue="earnings">
                        <option value="earnings">Earnings</option>
                        <option value="volume">Volume</option>
                     </select>
                     <select className={styles.select} defaultValue="period">
                        <option value="period">Per period</option>
                     </select>
                     <select
                        className={styles.select}
                        value={range}
                        onChange={(e) => setRange(e.target.value as Range)}
                     >
                        <option value="per-day">Daily</option>
                        <option value="per-week">Weekly</option>
                        <option value="per-month">Monthly</option>
                     </select>
                  </div>
               </div>

               <EarningsChart chart={data.chart} />

               {/* Your referrals */}
               <div className={styles.section}>
                  <div className={styles.sectionHead}>
                     <div className={styles.sectionTitle}>Your referrals</div>
                     <div className={styles.sectionTabs}>
                        <button className={styles.sectionTabActive}>
                           Businesses
                        </button>
                        <button className={styles.sectionTab}>Users</button>
                     </div>
                  </div>

                  <div className={styles.searchRow}>
                     <input
                        className={styles.searchInput}
                        placeholder="Search businesses"
                     />
                  </div>

                  <div className={styles.tableHead}>
                     <div>Business</div>
                     <div>Volume (30d)</div>
                     <div>Your earnings</div>
                     <div>Referred user</div>
                     <div>Attributed on</div>
                  </div>

                  {data.referrals.length === 0 ? (
                     <div className={styles.tableEmpty}>
                        Refer businesses and see their performance here.
                     </div>
                  ) : (
                     data.referrals.map((r) => (
                        <div key={r.id} className={styles.tableRow}>
                           <div className={styles.tableCell}>
                              <div className={styles.bizAvatar}>
                                 {r.businessAvatar || r.businessName.charAt(0)}
                              </div>
                              {r.businessName}
                           </div>
                           <div className={styles.tableCell}>
                              {fmtMoney(r.volume30d)}
                           </div>
                           <div className={styles.tableCell}>
                              {fmtMoney(r.earnings)}
                           </div>
                           <div className={styles.tableCell}>
                              {r.referredUser || "—"}
                           </div>
                           <div className={styles.tableCell}>
                              {new Date(r.attributedAt).toLocaleDateString()}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* RIGHT — sidebar */}
            <aside className={styles.side}>
               {/* Partner card */}
               <div className={styles.partnerCard}>
                  <div className={styles.partnerHeader}>
                     <div
                        className={styles.partnerAvatar}
                        style={{ background: data.user.avatarColor }}
                     >
                        {initials}
                     </div>
                     <div className={styles.partnerInfo}>
                        <div className={styles.partnerName}>
                           {data.user.name}
                        </div>
                        <div className={styles.partnerLevel}>
                           {data.user.partnerLevel}
                        </div>
                     </div>
                  </div>

                  <div className={styles.partnerStats}>
                     <div className={styles.partnerStat}>
                        <div className={styles.partnerStatValue}>
                           {fmtMoney(data.totalEarned)}
                        </div>
                        <div className={styles.partnerStatLabel}>
                           Total earned
                        </div>
                     </div>
                     <div className={styles.partnerStat}>
                        <div className={styles.partnerStatValue}>
                           {data.last30 > 0 ? fmtMoney(data.last30) : "—"}
                        </div>
                        <div className={styles.partnerStatLabel}>
                           Last 30 days
                        </div>
                     </div>
                  </div>

                  <div className={styles.partnerButtons}>
                     <button className={styles.primaryBtn}>
                        <Mail size={14} /> Email invite
                     </button>
                     <button className={styles.secondaryBtn}>
                        <LinkIcon size={14} /> Links
                     </button>
                  </div>
               </div>

               {/* Become a Verified Partner */}
               <div className={styles.card}>
                  <div className={styles.cardTitle}>
                     Become a Verified Partner
                  </div>
                  <ul className={styles.benefitList}>
                     <li>
                        <Sparkles size={12} /> Adjust fees for your referred
                        businesses
                     </li>
                     <li>
                        <Sparkles size={12} /> Attribute your deals without a
                        referral link
                     </li>
                     <li>
                        <Sparkles size={12} /> Join a private network of other
                        Verified Partners
                     </li>
                  </ul>
                  <button className={styles.enrollBtn}>Enroll</button>
               </div>

               {/* Partner dojo */}
               <div className={styles.dojocard}>
                  <div className={styles.dojoBanner}>
                     <div className={styles.dojoTitle}>Whop Partners</div>
                     <div className={styles.dojoSubtitle}>Partner dojo</div>
                     <div className={styles.dojoTrophy}>
                        <Trophy size={32} />
                     </div>
                  </div>
                  <div className={styles.dojoLock}>
                     <Lock size={10} /> Verified Partners only
                  </div>
                  <div className={styles.dojoHeading}>
                     Learn all that's needed to win as a Whop Partner!
                  </div>
                  <div className={styles.dojoStat}>
                     <ArrowUpRight size={14} />
                     Partners who complete all of our trainings earn{" "}
                     <strong>400% more</strong> on average than those who don't.
                  </div>
                  <div className={styles.dojoFootnote}>
                     Become a Verified Partner to unlock the dojo.
                  </div>
                  <button className={styles.dojoBtn}>
                     <Lock size={12} /> Get verified to unlock
                  </button>
               </div>

               {/* Top earners */}
               <div className={styles.card}>
                  <div className={styles.cardTitleRow}>
                     <span>Top earners last 30 days</span>
                     <span className={styles.liveDot} />
                  </div>
                  <div className={styles.leaderList}>
                     {leaderboard.map((e) => (
                        <div key={e.rank} className={styles.leaderRow}>
                           <div className={styles.leaderRank}>{e.rank}</div>
                           <div
                              className={styles.leaderAvatar}
                              style={{ background: e.avatarColor }}
                           >
                              {e.name.charAt(0).toUpperCase()}
                           </div>
                           <div className={styles.leaderInfo}>
                              <div className={styles.leaderName}>{e.name}</div>
                              <div className={styles.leaderLocation}>
                                 {e.location}
                              </div>
                           </div>
                           <div className={styles.leaderEarnings}>
                              {fmtMoney(e.earnings)}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </aside>
         </div>
      </div>
   );
}

function EarningsChart({
   chart,
}: {
   chart: { date: string; earnings: number }[];
}) {
   const width = 800;
   const height = 200;
   const max = Math.max(1, ...chart.map((c) => c.earnings));
   const hasData = chart.some((c) => c.earnings > 0);

   const points = chart.map((c, i) => {
      const x = (i / Math.max(1, chart.length - 1)) * width;
      const y = height - (c.earnings / max) * (height * 0.8) - 20;
      return { x, y };
   });

   const path = points
      .map(
         (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      )
      .join(" ");

   return (
      <div className={styles.chartWrap}>
         <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={styles.chart}
         >
            <defs>
               <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
               </linearGradient>
            </defs>
            <path
               d={`${path} L ${width} ${height} L 0 ${height} Z`}
               fill="url(#earnFill)"
            />
            <path
               d={path}
               fill="none"
               stroke="rgba(255,255,255,0.4)"
               strokeWidth="1.5"
            />
         </svg>
         {!hasData && <div className={styles.chartEmpty}>No earnings yet</div>}
      </div>
   );
}
