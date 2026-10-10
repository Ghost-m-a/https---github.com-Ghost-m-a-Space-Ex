"use client";

import { useEffect, useState } from "react";
import {
   Megaphone,
   Plus,
   Search,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import styles from "@/styles/pages/affiliates.module.css";

interface Offer {
   id: string;
   name: string;
   tagline: string;
   pricingType: "recurring" | "one-time";
   productPrice: number;
   currency: string;
   commissionRate: number;
   commissionRateMax: number;
   affiliateSales: number;
   affiliateEarnings: number;
   conversionRate: number;
   earningsPerClick: number;
   coverColor: string;
   coverEmoji: string;
}

interface Program {
   id: string;
   company: string;
   avatar: string;
   clicks: number;
   conversions: number;
   earnings: number;
   status: string;
}

type Tab = "dashboard" | "refer-buyers";

export default function AffiliatesPage() {
   const [tab, setTab] = useState<Tab>("dashboard");
   const [offers, setOffers] = useState<Offer[]>([]);
   const [programs, setPrograms] = useState<Program[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      Promise.all([
         fetch("/api/affiliates/offers").then((r) => r.json()),
         fetch("/api/affiliates/programs", { credentials: "include" }).then(
            (r) => r.json(),
         ),
      ])
         .then(([o, p]) => {
            setOffers(o.offers ?? []);
            setPrograms(p.programs ?? []);
         })
         .finally(() => setLoading(false));
   }, []);

   const fmtMoney = (n: number) =>
      `$${(n ?? 0).toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })}`;

   const formatCount = (n: number) => {
      if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
      return String(n);
   };

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.header}>
            <h1 className={styles.title}>Affiliates</h1>
         </div>

         {/* Tabs */}
         <div className={styles.tabs}>
            <button
               className={`${styles.tab} ${
                  tab === "dashboard" ? styles.tabActive : ""
               }`}
               onClick={() => setTab("dashboard")}
            >
               Dashboard
            </button>
            <button
               className={`${styles.tab} ${
                  tab === "refer-buyers" ? styles.tabActive : ""
               }`}
               onClick={() => setTab("refer-buyers")}
            >
               Refer buyers
            </button>
         </div>

         {tab === "dashboard" ? (
            <DashboardTab
               programs={programs}
               loading={loading}
               fmtMoney={fmtMoney}
            />
         ) : (
            <ReferBuyersTab
               offers={offers}
               loading={loading}
               fmtMoney={fmtMoney}
               formatCount={formatCount}
            />
         )}
      </div>
   );
}

// =========================================
// DASHBOARD TAB
// =========================================
function DashboardTab({
   programs,
   loading,
   fmtMoney,
}: {
   programs: Program[];
   loading: boolean;
   fmtMoney: (n: number) => string;
}) {
   return (
      <>
         <div className={styles.dashboardWrap}>
            {loading ? (
               <div className={styles.loading}>Loading…</div>
            ) : programs.length === 0 ? (
               <div className={styles.emptyState}>
                  <div className={styles.emptyMegaphone}>
                     <Megaphone size={48} />
                  </div>
                  <div className={styles.emptyTitle}>
                     You are not promoting any products yet
                  </div>
                  <div className={styles.emptySub}>
                     Browse the marketplace to find products to promote.
                  </div>
                  <button className={styles.browseBtn}>Browse products</button>
               </div>
            ) : (
               <div className={styles.programsList}>
                  {programs.map((p) => (
                     <div key={p.id} className={styles.programRow}>
                        <div className={styles.programAvatar}>
                           {p.avatar || p.company.charAt(0)}
                        </div>
                        <div className={styles.programInfo}>
                           <div className={styles.programName}>{p.company}</div>
                           <div className={styles.programMeta}>
                              {p.clicks} clicks · {p.conversions} conversions
                           </div>
                        </div>
                        <div className={styles.programEarnings}>
                           {fmtMoney(p.earnings)}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </>
   );
}

// =========================================
// REFER BUYERS TAB
// =========================================
function ReferBuyersTab({
   offers,
   loading,
   fmtMoney,
   formatCount,
}: {
   offers: Offer[];
   loading: boolean;
   fmtMoney: (n: number) => string;
   formatCount: (n: number) => string;
}) {
   return (
      <>
         {/* Hot offers carousel */}
         <div className={styles.section}>
            <div className={styles.sectionHead}>
               <div className={styles.sectionTitle}>Hot offers</div>
               <div className={styles.carouselNav}>
                  <button className={styles.navBtn}>
                     <ChevronLeft size={14} />
                  </button>
                  <button className={styles.navBtn}>
                     <ChevronRight size={14} />
                  </button>
                  <button className={styles.viewAllBtn}>View all</button>
               </div>
            </div>

            <div className={styles.offerCarousel}>
               {loading ? (
                  <div className={styles.loading}>Loading…</div>
               ) : (
                  offers.map((o) => (
                     <div key={o.id} className={styles.offerCard}>
                        <div className={styles.offerHeader}>
                           <div
                              className={styles.offerCover}
                              style={{ background: o.coverColor }}
                           >
                              <span className={styles.offerEmoji}>
                                 {o.coverEmoji}
                              </span>
                           </div>
                           <button className={styles.offerAdd}>
                              <Plus size={14} />
                           </button>
                        </div>
                        <div className={styles.offerName}>{o.name}</div>
                        <div className={styles.offerTagline}>{o.tagline}</div>
                        <div className={styles.offerBadge}>
                           {o.pricingType === "recurring"
                              ? "Recurring"
                              : "One-time"}
                        </div>
                        <div className={styles.offerStatsGrid}>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Product price
                              </div>
                              <div className={styles.offerStatValue}>
                                 {fmtMoney(o.productPrice)} / month
                              </div>
                           </div>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Commission rate
                              </div>
                              <div className={styles.offerStatValue}>
                                 {o.commissionRate}%
                                 {o.commissionRateMax > o.commissionRate &&
                                    " -"}
                              </div>
                           </div>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Affiliate sales
                              </div>
                              <div className={styles.offerStatValue}>
                                 {formatCount(o.affiliateSales)}
                              </div>
                           </div>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Affiliate earnings
                              </div>
                              <div className={styles.offerStatValue}>
                                 {formatCount(o.affiliateEarnings)}
                              </div>
                           </div>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Conversion rate
                              </div>
                              <div className={styles.offerStatValue}>
                                 {o.conversionRate.toFixed(2)}%
                              </div>
                           </div>
                           <div className={styles.offerStatCell}>
                              <div className={styles.offerStatLabel}>
                                 Earnings per click
                              </div>
                              <div className={styles.offerStatValue}>
                                 {fmtMoney(o.earningsPerClick)}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Your affiliate programs */}
         <div className={styles.section}>
            <div className={styles.sectionHead}>
               <div className={styles.sectionTitle}>
                  Your affiliate programs
               </div>
               <div className={styles.searchWrap}>
                  <Search size={14} />
                  <input className={styles.searchInput} placeholder="Search" />
               </div>
            </div>

            <div className={styles.table}>
               <div className={styles.tableHead}>
                  <div>Company</div>
                  <div>Clicks</div>
                  <div>Conversions</div>
                  <div>Earnings</div>
                  <div>Assets</div>
               </div>
               <div className={styles.tableEmpty}>
                  <Megaphone size={28} />
                  <div className={styles.tableEmptyTitle}>
                     No affiliate companies yet
                  </div>
                  <div className={styles.tableEmptySub}>
                     Browse the marketplace to find affiliate programs to join.
                  </div>
               </div>
            </div>

            <div className={styles.pagination}>
               <span>0-0 of 0 results</span>
               <div className={styles.pageControls}>
                  <button className={styles.pageBtn} disabled>
                     <ChevronLeft size={12} />
                  </button>
                  <button className={styles.pageBtn} disabled>
                     <ChevronLeft size={12} />
                  </button>
                  <span className={styles.pageLabel}>Page 1 of 1</span>
                  <button className={styles.pageBtn} disabled>
                     <ChevronRight size={12} />
                  </button>
                  <button className={styles.pageBtn} disabled>
                     <ChevronRight size={12} />
                  </button>
               </div>
            </div>
         </div>

         {/* Pending applications */}
         <div className={styles.section}>
            <div className={styles.sectionTitle}>Pending applications</div>
            <div className={styles.table}>
               <div className={styles.tableHeadPending}>
                  <div>Company</div>
                  <div>Status</div>
                  <div>Date</div>
               </div>
               <div className={styles.tableEmpty}>
                  <div className={styles.tableEmptySub}>
                     No pending applications
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}
