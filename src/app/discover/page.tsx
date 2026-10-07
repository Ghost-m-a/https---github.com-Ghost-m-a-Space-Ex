"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
   Search,
   ChevronDown,
   ChevronLeft,
   ChevronRight,
   X,
   Check,
   ArrowUp,
   TrendingUp,
} from "lucide-react";
import styles from "./discover.module.css";

type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x";

interface Campaign {
   id: string;
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   previewImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;
   socials: SocialPlatform[];
   budget: number;
   raised: number;
   cpm: number;
   totalEarned: number;
   duration: string;
   ageRestricted: boolean;
   featured: boolean;
}

const SOCIAL_ICONS: Record<SocialPlatform, { label: string; color: string }> = {
   youtube: { label: "▶", color: "#ff0000" },
   tiktok: { label: "♪", color: "#000" },
   instagram: { label: "◉", color: "#E1306C" },
   x: { label: "𝕏", color: "#000" },
};

const CATEGORIES = [
   "Entertainment",
   "Movies & TV",
   "Film Trailers",
   "Movie Clips",
   "TV Series",
   "Reality TV",
   "Documentary",
   "Anime",
   "Sports",
   "Gaming",
   "Music",
   "Comedy",
   "Beauty",
   "Fitness",
];

const SORTS = [
   { key: "top", label: "Top" },
   { key: "newest", label: "Newest" },
   { key: "cpm", label: "Highest CPM" },
];

export default function DiscoverPage() {
   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
   const [featured, setFeatured] = useState<Campaign | null>(null);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [social, setSocial] = useState<SocialPlatform | "">("");
   const [category, setCategory] = useState("all");
   const [sort, setSort] = useState("top");
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const scrollRef = useRef<HTMLDivElement>(null);

   // Load campaigns
   const load = useCallback(async () => {
      setLoading(true);
      try {
         const params = new URLSearchParams();
         if (search) params.set("q", search);
         if (social) params.set("social", social);
         if (category && category !== "all") params.set("category", category);
         if (sort) params.set("sort", sort);

         const res = await fetch(`/api/discover/campaigns?${params}`);
         const data = await res.json();
         const list: Campaign[] = data.campaigns || [];
         setCampaigns(list);
         setFeatured(list.find((c) => c.featured) || list[0] || null);
      } finally {
         setLoading(false);
      }
   }, [search, social, category, sort]);

   useEffect(() => {
      load();
   }, [load]);

   // Click outside to close dropdowns
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (!(e.target as HTMLElement).closest("[data-dropdown]")) {
            setOpenDropdown(null);
         }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, []);

   const scrollLeft = () => {
      scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
   };
   const scrollRight = () => {
      scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
   };

   const formatMoney = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
      return `$${n.toFixed(0)}`;
   };

   return (
      <div className={styles.page}>
         {/* Top Bar */}
         <div className={styles.topBar}>
            <Link href="/discover" className={styles.backLink}>
               <ChevronLeft size={16} />
               <span>Discover Content Rewards</span>
            </Link>
            <button className={styles.installBtn}>
               Install app in your whop
            </button>
         </div>

         {/* Hero Section */}
         {featured && (
            <div className={styles.hero}>
               <div className={styles.heroContent}>
                  <div className={styles.heroLeft}>
                     <div className={styles.heroVisual}>
                        {featured.previewImage && (
                           <img
                              src={featured.previewImage}
                              alt={featured.title}
                              className={styles.heroImage}
                           />
                        )}
                        <button className={styles.heroPlay}>▶</button>
                     </div>
                  </div>
                  <div className={styles.heroRight}>
                     <div className={styles.heroBrand}>
                        <div className={styles.heroBrandAvatar}>🅷</div>
                        <span className={styles.heroBrandName}>Clip Farm</span>
                        <span className={styles.heroVerified}>✓</span>
                     </div>
                     <h1 className={styles.heroTitle}>{featured.title}</h1>
                     <div className={styles.heroStats}>
                        <span className={styles.heroStat}>
                           ${featured.cpm}/1k
                        </span>
                        <span className={styles.heroDot}>·</span>
                        <span className={styles.heroStat}>
                           ${(featured.budget / 1000).toFixed(1)}k مباحات
                        </span>
                        <span className={styles.heroDot}>·</span>
                        <span className={styles.heroStat}>
                           {featured.category}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Filters Bar */}
         <div className={styles.filtersBar}>
            <div className={styles.filtersLeft}>
               <button
                  className={styles.filterBtn}
                  onClick={scrollLeft}
                  aria-label="Scroll left"
               >
                  <ChevronLeft size={14} />
               </button>
               <button
                  className={styles.filterBtn}
                  onClick={scrollRight}
                  aria-label="Scroll right"
               >
                  <ChevronRight size={14} />
               </button>
               <div className={styles.resultsCount}>
                  {campaigns.length}+50 حملات
               </div>
            </div>
         </div>

         {/* Horizontal Campaign Strip */}
         <div className={styles.stripWrap} ref={scrollRef}>
            <div className={styles.strip}>
               {campaigns.slice(0, 10).map((c) => (
                  <CampaignCard key={c.id} campaign={c} compact />
               ))}
            </div>
         </div>

         {/* Divider */}
         <div className={styles.divider} />

         {/* Main Grid Header */}
         <div className={styles.gridHeader}>
            <div className={styles.gridHeaderLeft}>
               <h2 className={styles.gridTitle}>أفضل الحملات</h2>
            </div>
            <div className={styles.gridHeaderRight}>
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
         </div>

         {/* Filter Dropdowns */}
         <div className={styles.filterRow}>
            <div className={styles.socialsRow}>
               {(
                  ["youtube", "tiktok", "instagram", "x"] as SocialPlatform[]
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
                                   background: `${SOCIAL_ICONS[s].color}20`,
                                   borderColor: SOCIAL_ICONS[s].color,
                                   color: SOCIAL_ICONS[s].color,
                                }
                              : {}
                        }
                     >
                        {SOCIAL_ICONS[s].label}
                     </button>
                  );
               })}
            </div>

            <div className={styles.filtersGroup}>
               {/* Sort */}
               <div className={styles.dropdownWrap} data-dropdown>
                  <button
                     className={styles.filterDropdown}
                     onClick={() =>
                        setOpenDropdown(openDropdown === "sort" ? null : "sort")
                     }
                  >
                     {SORTS.find((s) => s.key === sort)?.label}
                     <ChevronDown size={14} />
                  </button>
                  {openDropdown === "sort" && (
                     <div className={styles.dropdownMenu}>
                        {SORTS.map((s) => (
                           <button
                              key={s.key}
                              className={styles.dropdownItem}
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

               {/* Category */}
               <div className={styles.dropdownWrap} data-dropdown>
                  <button
                     className={styles.filterDropdown}
                     onClick={() =>
                        setOpenDropdown(
                           openDropdown === "category" ? null : "category",
                        )
                     }
                  >
                     {category === "all" ? "All categories" : category}
                     <ChevronDown size={14} />
                  </button>
                  {openDropdown === "category" && (
                     <div
                        className={`${styles.dropdownMenu} ${styles.dropdownMenuTall}`}
                     >
                        <button
                           className={styles.dropdownItem}
                           onClick={() => {
                              setCategory("all");
                              setOpenDropdown(null);
                           }}
                        >
                           <span className={styles.checkBox}>
                              {category === "all" && <Check size={12} />}
                           </span>
                           All categories
                        </button>
                        {CATEGORIES.map((c) => (
                           <button
                              key={c}
                              className={styles.dropdownItem}
                              onClick={() => {
                                 setCategory(c);
                                 setOpenDropdown(null);
                              }}
                           >
                              <span className={styles.checkBox}>
                                 {category === c && <Check size={12} />}
                              </span>
                              {c}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* CPM */}
               <div className={styles.dropdownWrap} data-dropdown>
                  <button className={styles.filterDropdown}>
                     أعلى دفع CPM
                     <ChevronDown size={14} />
                  </button>
               </div>

               <button className={styles.ucgBtn}>UCG</button>
               <button className={styles.ucgBtn}>Clipping</button>
            </div>
         </div>

         {/* Campaign Grid */}
         {loading ? (
            <div className={styles.loading}>Loading campaigns...</div>
         ) : campaigns.length === 0 ? (
            <div className={styles.empty}>
               <div className={styles.emptyIcon}>🎬</div>
               <div className={styles.emptyTitle}>No campaigns yet</div>
               <div className={styles.emptySub}>
                  Check back soon for new content rewards opportunities.
               </div>
            </div>
         ) : (
            <div className={styles.grid}>
               {campaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
               ))}
            </div>
         )}

         {/* Scroll to top */}
         <button
            className={styles.scrollTopBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
         >
            <ArrowUp size={16} />
         </button>

         {/* Bottom search bar */}
         <div className={styles.bottomSearch}>
            <Search size={14} />
            <input
               className={styles.bottomSearchInput}
               placeholder="TikTok حملات جديدة"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>
   );
}

// =========================================
// Campaign Card
// =========================================
function CampaignCard({
   campaign,
   compact,
}: {
   campaign: Campaign;
   compact?: boolean;
}) {
   const formatMoney = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
      return `$${n.toFixed(0)}`;
   };

   const percentRaised =
      campaign.budget > 0
         ? Math.min(100, (campaign.raised / campaign.budget) * 100)
         : 0;

   return (
      <div className={`${styles.card} ${compact ? styles.cardCompact : ""}`}>
         {/* Preview */}
         <div className={styles.cardPreview}>
            {campaign.previewImage ? (
               <img
                  src={campaign.previewImage}
                  alt={campaign.title}
                  className={styles.cardImage}
               />
            ) : (
               <div className={styles.cardPlaceholder}>
                  <span className={styles.cardPlaceholderIcon}>🎬</span>
               </div>
            )}
            {campaign.ageRestricted && (
               <span className={styles.ageBadge}>18+</span>
            )}
            {campaign.brandVerified && (
               <div className={styles.cardBadge}>
                  <span>✓</span> Clip Farm
               </div>
            )}
         </div>

         {/* Socials Row */}
         <div className={styles.cardSocials}>
            <div className={styles.socialsIcons}>
               {campaign.socials.map((s) => (
                  <span
                     key={s}
                     className={styles.socialIcon}
                     style={{ color: SOCIAL_ICONS[s].color }}
                  >
                     {SOCIAL_ICONS[s].label}
                  </span>
               ))}
            </div>
            <div className={styles.cardMeta}>
               <span>{campaign.duration}</span>
               <span className={styles.metaDot}>·</span>
               <span className={styles.brandName}>{campaign.brandName}</span>
               {campaign.brandVerified && (
                  <span className={styles.brandVerifiedIcon}>✓</span>
               )}
            </div>
         </div>

         {/* Title */}
         <div className={styles.cardTitle}>{campaign.title}</div>

         {/* Stats Row */}
         <div className={styles.cardStats}>
            <div className={styles.statGroup}>
               <div className={styles.statValue}>${campaign.cpm}/1k</div>
               <div className={styles.statLabel}>{campaign.raised} 👤</div>
            </div>
            <div className={styles.statGroup}>
               <div className={styles.statValueRight}>
                  {formatMoney(campaign.raised)}/{formatMoney(campaign.budget)}
               </div>
            </div>
         </div>

         {/* Progress Bar */}
         <div className={styles.progressBar}>
            <div
               className={styles.progressFill}
               style={{ width: `${percentRaised}%` }}
            />
         </div>
      </div>
   );
}
