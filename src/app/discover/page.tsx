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
   Filter,
   Eraser,
} from "lucide-react";
import styles from "./discover.module.css";

type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

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
   facebook: { label: "f", color: "#1877F2" },
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

const BUDGET_RANGES = [
   { key: "any", label: "أي ميزانية" },
   { key: "under1k", label: "أقل من $1k" },
   { key: "1k-10k", label: "$1k - $10k" },
   { key: "10k-50k", label: "$10k - $50k" },
   { key: "50k+", label: "$50k+" },
];

const FORMATS = [
   { key: "any", label: "أي نموذج" },
   { key: "video", label: "فيديو" },
   { key: "image", label: "صورة" },
   { key: "audio", label: "صوت فقط" },
   { key: "slideshow", label: "عرض شرائح" },
];

const SORTS = [
   { key: "top", label: "الأعلى" },
   { key: "newest", label: "الأحدث" },
   { key: "cpm", label: "أعلى CPM" },
   { key: "budget", label: "أعلى ميزانية" },
];

const TYPE_TABS = [
   { key: "all", label: "الكل" },
   { key: "clipping", label: "Clipping" },
   { key: "ugc", label: "UGC" },
];

export default function DiscoverPage() {
   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
   const [featured, setFeatured] = useState<Campaign | null>(null);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [social, setSocial] = useState<SocialPlatform | "">("");
   const [category, setCategory] = useState("all");
   const [budget, setBudget] = useState("any");
   const [format, setFormat] = useState("any");
   const [sort, setSort] = useState("top");
   const [typeTab, setTypeTab] = useState("all");
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const scrollRef = useRef<HTMLDivElement>(null);

   const hasFilters =
      search ||
      social ||
      category !== "all" ||
      budget !== "any" ||
      format !== "any" ||
      sort !== "top" ||
      typeTab !== "all";

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

   const clearFilters = () => {
      setSearch("");
      setSocial("");
      setCategory("all");
      setBudget("any");
      setFormat("any");
      setSort("top");
      setTypeTab("all");
   };

   const scrollLeft = () => {
      scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
   };
   const scrollRight = () => {
      scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
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

         {/* Horizontal Scroll Controls */}
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
            <h2 className={styles.gridTitle}>أفضل الحملات</h2>
            <div className={styles.searchWrap}>
               <Search size={14} />
               <input
                  className={styles.searchInput}
                  placeholder="ابحث عن حملة"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
         </div>

         {/* =========================================
          FLOATING BOTTOM FILTER BAR
          ========================================= */}
         <div className={styles.floatingBar}>
            {/* Row 1: Clear + Filter icon + Socials + Dropdowns + Type tabs */}
            <div className={styles.fbRow}>
               {/* Clear */}
               {hasFilters && (
                  <button className={styles.fbClearBtn} onClick={clearFilters}>
                     <Eraser size={12} />
                     مسح
                  </button>
               )}

               {/* Filter icon with kbd */}
               <button className={styles.fbFilterIcon}>
                  <Filter size={14} />
                  <kbd className={styles.fbKbd}>⌘ K</kbd>
               </button>

               <div className={styles.fbDivider} />

               {/* Social toggles */}
               <div className={styles.fbSocials}>
                  {(
                     [
                        "facebook",
                        "x",
                        "youtube",
                        "instagram",
                        "tiktok",
                     ] as SocialPlatform[]
                  ).map((s) => {
                     const active = social === s;
                     return (
                        <button
                           key={s}
                           className={`${styles.fbSocialBtn} ${active ? styles.fbSocialBtnActive : ""}`}
                           onClick={() => setSocial(active ? "" : s)}
                           style={
                              active
                                 ? {
                                      background: SOCIAL_ICONS[s].color,
                                      color: "#fff",
                                   }
                                 : {}
                           }
                        >
                           {SOCIAL_ICONS[s].label}
                        </button>
                     );
                  })}
               </div>

               <div className={styles.fbDivider} />

               {/* Budget */}
               <div className={styles.fbDropdownWrap} data-dropdown>
                  <button
                     className={styles.fbDropdown}
                     onClick={() =>
                        setOpenDropdown(
                           openDropdown === "budget" ? null : "budget",
                        )
                     }
                  >
                     <span className={styles.fbIconText}>💰</span>
                     {budget === "any"
                        ? "الميزانية"
                        : BUDGET_RANGES.find((b) => b.key === budget)?.label}
                     <ChevronDown size={12} />
                  </button>
                  {openDropdown === "budget" && (
                     <div className={styles.fbMenu} data-dropdown>
                        {BUDGET_RANGES.map((b) => (
                           <button
                              key={b.key}
                              className={styles.fbMenuItem}
                              onClick={() => {
                                 setBudget(b.key);
                                 setOpenDropdown(null);
                              }}
                           >
                              <span className={styles.checkBox}>
                                 {budget === b.key && <Check size={12} />}
                              </span>
                              {b.label}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Category */}
               <div className={styles.fbDropdownWrap} data-dropdown>
                  <button
                     className={styles.fbDropdown}
                     onClick={() =>
                        setOpenDropdown(
                           openDropdown === "category" ? null : "category",
                        )
                     }
                  >
                     <span className={styles.fbIconText}>📂</span>
                     {category === "all" ? "الفئة" : category}
                     <ChevronDown size={12} />
                  </button>
                  {openDropdown === "category" && (
                     <div
                        className={`${styles.fbMenu} ${styles.fbMenuTall}`}
                        data-dropdown
                     >
                        <button
                           className={styles.fbMenuItem}
                           onClick={() => {
                              setCategory("all");
                              setOpenDropdown(null);
                           }}
                        >
                           <span className={styles.checkBox}>
                              {category === "all" && <Check size={12} />}
                           </span>
                           كل الفئات
                        </button>
                        {CATEGORIES.map((c) => (
                           <button
                              key={c}
                              className={styles.fbMenuItem}
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

               {/* Format */}
               <div className={styles.fbDropdownWrap} data-dropdown>
                  <button
                     className={styles.fbDropdown}
                     onClick={() =>
                        setOpenDropdown(
                           openDropdown === "format" ? null : "format",
                        )
                     }
                  >
                     <span className={styles.fbIconText}>{"{ }"}</span>
                     {format === "any"
                        ? "النموذج"
                        : FORMATS.find((f) => f.key === format)?.label}
                     <ChevronDown size={12} />
                  </button>
                  {openDropdown === "format" && (
                     <div className={styles.fbMenu} data-dropdown>
                        {FORMATS.map((f) => (
                           <button
                              key={f.key}
                              className={styles.fbMenuItem}
                              onClick={() => {
                                 setFormat(f.key);
                                 setOpenDropdown(null);
                              }}
                           >
                              <span className={styles.checkBox}>
                                 {format === f.key && <Check size={12} />}
                              </span>
                              {f.label}
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Sort */}
               <div className={styles.fbDropdownWrap} data-dropdown>
                  <button
                     className={styles.fbDropdown}
                     onClick={() =>
                        setOpenDropdown(openDropdown === "sort" ? null : "sort")
                     }
                  >
                     <span className={styles.fbIconText}>≡</span>
                     {sort === "top"
                        ? "ترتيب"
                        : SORTS.find((s) => s.key === sort)?.label}
                     <ChevronDown size={12} />
                  </button>
                  {openDropdown === "sort" && (
                     <div className={styles.fbMenu} data-dropdown>
                        {SORTS.map((s) => (
                           <button
                              key={s.key}
                              className={styles.fbMenuItem}
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

               <div className={styles.fbDivider} />

               {/* Type tabs */}
               <div className={styles.fbTypeTabs}>
                  {TYPE_TABS.map((t) => (
                     <button
                        key={t.key}
                        className={`${styles.fbTypeTab} ${typeTab === t.key ? styles.fbTypeTabActive : ""}`}
                        onClick={() => setTypeTab(t.key)}
                     >
                        {t.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Row 2: Search + scroll top */}
            <div className={styles.fbRow2}>
               <button
                  className={styles.fbScrollTop}
                  onClick={() =>
                     window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  aria-label="Scroll to top"
               >
                  <ArrowUp size={14} />
               </button>

               <div className={styles.fbSearch}>
                  <Search size={14} />
                  <input
                     className={styles.fbSearchInput}
                     placeholder="حملات CPM الأعلى أجرأ"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
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
                  Try adjusting your filters.
               </div>
               {hasFilters && (
                  <button className={styles.emptyCta} onClick={clearFilters}>
                     مسح الفلاتر
                  </button>
               )}
            </div>
         ) : (
            <div className={styles.grid}>
               {campaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
               ))}
            </div>
         )}
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

         <div className={styles.cardSocials}>
            <div className={styles.socialsIcons}>
               {campaign.socials.map((s) => (
                  <span
                     key={s}
                     className={styles.socialIcon}
                     style={{ color: SOCIAL_ICONS[s]?.color || "#888" }}
                  >
                     {SOCIAL_ICONS[s]?.label || "•"}
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

         <div className={styles.cardTitle}>{campaign.title}</div>

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

         <div className={styles.progressBar}>
            <div
               className={styles.progressFill}
               style={{ width: `${percentRaised}%` }}
            />
         </div>
      </div>
   );
}
