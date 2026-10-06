"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
   Plus,
   Upload,
   Wallet,
   Globe,
   ChevronDown,
   Search,
   Settings2,
} from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./ads.module.css";

type Tab = "all" | "campaigns" | "groups" | "ads";

interface CampaignRow {
   id: string;
   title: string;
   platform: string;
   objective: string;
   status: string;
   onOff: boolean;
   budgetType: string;
   budgetAmount: number;
   stats: {
      spent: number;
      impressions: number;
      clicks: number;
      results: number;
      roas: number;
      revenue: number;
   };
   createdAt: string;
}

export default function AdsPage() {
   const { activeBusiness } = useWorkspace();
   const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
   const [summary, setSummary] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [tab, setTab] = useState<Tab>("campaigns");
   const [search, setSearch] = useState("");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) {
         setCampaigns([]);
         setSummary(null);
         setLoading(false);
         return;
      }
      setLoading(true);
      try {
         const params = new URLSearchParams({ businessId: activeBusiness.id });
         if (search) params.set("q", search);
         const res = await fetch(`/api/business/ads?${params}`);
         const data = await res.json();
         setCampaigns(data.campaigns || []);
         setSummary(data.summary);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id, search]);

   useEffect(() => {
      load();
   }, [load]);

   const toggleOnOff = async (id: string, current: boolean) => {
      setCampaigns((prev) =>
         prev.map((c) => (c.id === id ? { ...c, onOff: !current } : c)),
      );
      await fetch(`/api/business/ads/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ onOff: !current }),
      });
   };

   const isEmpty = !loading && campaigns.length === 0;

   const formatNumber = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
      return n.toFixed(2);
   };

   return (
      <div className={styles.page}>
         {isEmpty ? (
            // =========================================
            // EMPTY STATE
            // =========================================
            <div className={styles.emptyHero}>
               <div className={styles.emptyTag}>Ads</div>
               <h1 className={styles.emptyTitle}>
                  Your next customer is scrolling right now.
               </h1>

               <div className={styles.emptyCards}>
                  <div className={styles.emptyCard}>
                     <div className={styles.emptyCardIcon}>📷</div>
                     <div className={styles.emptyCardTitle}>
                        Upload a creative
                     </div>
                     <div className={styles.emptyCardSub}>
                        Drop in an image or video. We&apos;ll turn it into an
                        ad.
                     </div>
                  </div>

                  <div className={styles.emptyCard}>
                     <div className={styles.emptyCardIcon}>🐷</div>
                     <div className={styles.emptyCardTitle}>Set a budget</div>
                     <div className={styles.emptyCardSub}>
                        Pick a daily spend. Start small, scale what works.
                     </div>
                  </div>

                  <div className={styles.emptyCard}>
                     <div className={styles.emptyCardIcon}>🛰️</div>
                     <div className={styles.emptyCardTitle}>Every platform</div>
                     <div className={styles.emptyCardSub}>
                        Reach buyers on Meta, TikTok, Google, and more.
                     </div>
                  </div>
               </div>

               <Link href="/business/ads/create" className={styles.emptyCta}>
                  Launch my first ad
               </Link>
            </div>
         ) : (
            // =========================================
            // DASHBOARD
            // =========================================
            <>
               <div className={styles.header}>
                  <div>
                     <div className={styles.headerLabel}>Ads</div>
                     <div className={styles.headerSubLabel}>Spend · EDT</div>
                     <div className={styles.headerSpend}>
                        ${(summary?.totalSpend || 0).toFixed(2)}
                     </div>
                  </div>
                  <div className={styles.headerRight}>
                     <Link
                        href="/business/ads/create"
                        className={styles.primaryBtn}
                     >
                        <Plus size={14} /> New campaign
                     </Link>
                     <button className={styles.iconBtn}>
                        <Settings2 size={16} />
                     </button>
                  </div>
               </div>

               {/* Spend chart placeholder */}
               <div className={styles.chartArea}>
                  <div className={styles.chartGrid}>
                     <div className={styles.chartRow}>
                        <span>$1</span>
                     </div>
                     <div className={styles.chartRow}>
                        <span>$0.7</span>
                     </div>
                     <div className={styles.chartRow}>
                        <span>$0.3</span>
                     </div>
                     <div className={styles.chartRow}>
                        <span>$0</span>
                     </div>
                  </div>
                  <div className={styles.chartLine} />
               </div>

               {/* Filters */}
               <div className={styles.filtersRow}>
                  <div className={styles.tabs}>
                     {(["all", "campaigns", "groups", "ads"] as Tab[]).map(
                        (t) => (
                           <button
                              key={t}
                              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                              onClick={() => setTab(t)}
                           >
                              {t === "all" && "All"}
                              {t === "campaigns" && "Ad campaigns"}
                              {t === "groups" && "Ad groups"}
                              {t === "ads" && "Ads"}
                           </button>
                        ),
                     )}
                  </div>

                  <div className={styles.filterRight}>
                     <span className={styles.breakdownLabel}>Breakdown by</span>
                     <button className={styles.filterBtn}>
                        No breakdown <ChevronDown size={14} />
                     </button>
                     <div className={styles.searchWrap}>
                        <Search size={14} />
                        <input
                           className={styles.searchInput}
                           placeholder="Search..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                        />
                     </div>
                     <button className={styles.iconBtn}>
                        <Settings2 size={16} />
                     </button>
                  </div>
               </div>

               {/* Table */}
               {loading ? (
                  <div className={styles.loading}>Loading campaigns...</div>
               ) : campaigns.length === 0 ? (
                  <div className={styles.emptySmall}>No campaigns to show</div>
               ) : (
                  <div className={styles.tableWrap}>
                     <table className={styles.table}>
                        <thead>
                           <tr>
                              <th>
                                 <input type="checkbox" />
                              </th>
                              <th>Title</th>
                              <th>Status</th>
                              <th>Budget</th>
                              <th>
                                 Spent <ChevronDown size={10} />
                              </th>
                              <th>Impressions</th>
                              <th>Clicks</th>
                              <th>Results</th>
                              <th>ROAS</th>
                              <th>Return</th>
                              <th>On/Off</th>
                           </tr>
                        </thead>
                        <tbody>
                           {campaigns.map((c) => (
                              <tr key={c.id}>
                                 <td>
                                    <input type="checkbox" />
                                 </td>
                                 <td>
                                    <Link
                                       href={`/business/ads/${c.id}`}
                                       className={styles.campaignTitle}
                                    >
                                       {c.title}
                                    </Link>
                                 </td>
                                 <td>
                                    <span
                                       className={`${styles.badge} ${styles[`badge_${c.status}`]}`}
                                    >
                                       {c.status}
                                    </span>
                                 </td>
                                 <td>
                                    ${c.budgetAmount.toFixed(2)}
                                    <span className={styles.budgetType}>
                                       /
                                       {c.budgetType === "daily"
                                          ? "day"
                                          : "lifetime"}
                                    </span>
                                 </td>
                                 <td>${(c.stats?.spent || 0).toFixed(2)}</td>
                                 <td>
                                    {formatNumber(c.stats?.impressions || 0)}
                                 </td>
                                 <td>{c.stats?.clicks || 0}</td>
                                 <td>{c.stats?.results || 0}</td>
                                 <td>{(c.stats?.roas || 0).toFixed(2)}</td>
                                 <td>${(c.stats?.revenue || 0).toFixed(2)}</td>
                                 <td>
                                    <button
                                       className={`${styles.switch} ${c.onOff ? styles.switchOn : ""}`}
                                       onClick={() =>
                                          toggleOnOff(c.id, c.onOff)
                                       }
                                    >
                                       <span className={styles.switchThumb} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </>
         )}
      </div>
   );
}
