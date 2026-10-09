"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
   Search,
   ChevronDown,
   ChevronLeft,
   ChevronRight,
   X,
   Check,
   Eraser,
   Users,
   TrendingUp,
   Wallet,
} from "lucide-react";
import styles from "@/styles/pages/discover.module.css";

type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

interface Campaign {
   id: string;
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   coverImage: string;
   previewImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;
   socials: SocialPlatform[];
   budget: number;
   budgetSpent: number;
   budgetRemaining: number;
   cpm: number;
   joinedUsers: number;
   totalViews: number;
   duration: string;
   featured: boolean;
   joined: boolean;
}

const SOCIALS: Record<SocialPlatform, { label: string; color: string }> = {
   facebook: { label: "f", color: "#1877F2" },
   youtube: { label: "▶", color: "#ff0000" },
   tiktok: { label: "♪", color: "#fff" },
   instagram: { label: "◉", color: "#E1306C" },
   x: { label: "𝕏", color: "#fff" },
};

const SORTS = [
   { key: "top", label: "Top" },
   { key: "newest", label: "Newest" },
   { key: "cpm", label: "Highest CPM" },
   { key: "budget", label: "Highest Budget" },
];

export default function DiscoverPage() {
   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [social, setSocial] = useState<SocialPlatform | "">("");
   const [sort, setSort] = useState("top");
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const p = new URLSearchParams();
         if (search) p.set("q", search);
         if (social) p.set("social", social);
         if (sort) p.set("sort", sort);
         const res = await fetch(`/api/discover/campaigns?${p}`);
         const d = await res.json();
         setCampaigns(d.campaigns || []);
      } finally {
         setLoading(false);
      }
   }, [search, social, sort]);

   useEffect(() => {
      load();
   }, [load]);

   useEffect(() => {
      const h = (e: MouseEvent) => {
         if (!(e.target as HTMLElement).closest("[data-dropdown]"))
            setOpenDropdown(null);
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
   }, []);

   const fmtMoney = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
   };

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.topBar}>
            <Link href="/discover" className={styles.backLink}>
               <ChevronLeft size={16} />
               <span>Discover Content Rewards</span>
            </Link>
         </div>

         {/* Filter Row */}
         <div className={styles.filterRowOuter}>
            <h2 className={styles.title}>Top Campaigns</h2>
            <div className={styles.searchWrap}>
               <Search size={14} />
               <input
                  className={styles.searchInput}
                  placeholder="Search campaigns"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
         </div>

         {/* Filters Bar */}
         <div className={styles.filterBar}>
            <div className={styles.socialsRow}>
               {(
                  [
                     "youtube",
                     "tiktok",
                     "instagram",
                     "x",
                     "facebook",
                  ] as SocialPlatform[]
               ).map((s) => {
                  const active = social === s;
                  return (
                     <button
                        key={s}
                        className={`${styles.socialBtn} ${active ? styles.socialBtnActive : ""}`}
                        onClick={() => setSocial(active ? "" : s)}
                        style={
                           active
                              ? {
                                   background: SOCIALS[s].color,
                                   color:
                                      s === "youtube"
                                         ? "#fff"
                                         : s === "facebook"
                                           ? "#fff"
                                           : s === "instagram"
                                             ? "#fff"
                                             : "#000",
                                }
                              : {}
                        }
                     >
                        {SOCIALS[s].label}
                     </button>
                  );
               })}
            </div>

            <div className={styles.sortWrap} data-dropdown>
               <button
                  className={styles.sortBtn}
                  onClick={() =>
                     setOpenDropdown(openDropdown === "sort" ? null : "sort")
                  }
               >
                  {SORTS.find((s) => s.key === sort)?.label}
                  <ChevronDown size={12} />
               </button>
               {openDropdown === "sort" && (
                  <div className={styles.menu} data-dropdown>
                     {SORTS.map((s) => (
                        <button
                           key={s.key}
                           className={styles.menuItem}
                           onClick={() => {
                              setSort(s.key);
                              setOpenDropdown(null);
                           }}
                        >
                           <span className={styles.checkBox}>
                              {sort === s.key && <Check size={12} />}
                           </span>
                           {s.label}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            {(search || social || sort !== "top") && (
               <button
                  className={styles.clearBtn}
                  onClick={() => {
                     setSearch("");
                     setSocial("");
                     setSort("top");
                  }}
               >
                  <Eraser size={12} /> Clear
               </button>
            )}
         </div>

         {/* Grid */}
         {loading ? (
            <div className={styles.loading}>Loading campaigns...</div>
         ) : campaigns.length === 0 ? (
            <div className={styles.empty}>
               <div className={styles.emptyIcon}>🎬</div>
               <div className={styles.emptyTitle}>No campaigns found</div>
               <div className={styles.emptySub}>Try a different filter</div>
            </div>
         ) : (
            <div className={styles.grid}>
               {campaigns.map((c) => (
                  <CampaignCard key={c.id} c={c} fmtMoney={fmtMoney} />
               ))}
            </div>
         )}
      </div>
   );
}

function CampaignCard({
   c,
   fmtMoney,
}: {
   c: Campaign;
   fmtMoney: (n: number) => string;
}) {
   const pct =
      c.budget > 0 ? Math.min(100, (c.budgetSpent / c.budget) * 100) : 0;
   return (
      <Link href={`/discover/${c.slug}`} className={styles.card}>
         {/* Cover */}
         <div className={styles.cover}>
            {c.coverImage ? (
               <img
                  src={c.coverImage}
                  alt={c.title}
                  className={styles.coverImg}
               />
            ) : (
               <div className={styles.coverFallback}>🎬</div>
            )}
            {c.brandVerified && (
               <div className={styles.brandPill}>
                  <span className={styles.brandCheck}>✓</span>
                  <span>{c.brandName}</span>
               </div>
            )}
         </div>

         {/* Info */}
         <div className={styles.info}>
            {/* Socials + duration + brand */}
            <div className={styles.metaRow}>
               <div className={styles.socialsIcons}>
                  {c.socials.map((s) => (
                     <span key={s} style={{ color: SOCIALS[s].color }}>
                        {SOCIALS[s].label}
                     </span>
                  ))}
               </div>
               <div className={styles.metaRight}>
                  <span className={styles.duration}>{c.duration}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.brandName}>{c.brandName}</span>
                  {c.brandVerified && (
                     <span className={styles.brandVerifiedIcon}>✓</span>
                  )}
               </div>
            </div>

            {/* Title */}
            <div className={styles.cardTitle}>{c.title}</div>

            {/* Stats */}
            <div className={styles.statsRow}>
               <div className={styles.statLeft}>
                  <div className={styles.cpmValue}>${c.cpm}/1k</div>
                  <div className={styles.joinedCount}>
                     <Users size={11} /> {c.joinedUsers}
                  </div>
               </div>
               <div className={styles.statRight}>
                  <span className={styles.raised}>
                     {fmtMoney(c.budgetSpent)}
                  </span>
                  <span className={styles.separator}>/</span>
                  <span className={styles.budget}>{fmtMoney(c.budget)}</span>
               </div>
            </div>

            {/* Progress */}
            <div className={styles.progressTrack}>
               <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%` }}
               />
            </div>

            {/* Joined pill */}
            {c.joined && (
               <div className={styles.joinedPill}>
                  <Check size={12} /> Joined
               </div>
            )}
         </div>
      </Link>
   );
}
