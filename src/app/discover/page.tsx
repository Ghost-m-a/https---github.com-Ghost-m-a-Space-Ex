"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
   ChevronLeft,
   ChevronRight,
   Users,
   Check,
   Clock,
   X,
} from "lucide-react";
import styles from "@/styles/pages/discover.module.css";

type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

interface Campaign {
   id: string;
   slug: string;
   title: string;
   subtitle: string;
   coverImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;
   socials: SocialPlatform[];
   cpm: number;
   duration: string;
   budget: number;
   budgetSpent: number;
   budgetRemaining: number;
   joinedUsers: number;
   totalViews: number;
   objective: string;
   adFormat: string;
   category: string;
   featured: boolean;
   requestStatus: string | null;
   joined: boolean;
}

interface Feed {
   featured: Campaign[];
   yourCampaigns: Campaign[];
   popular: Campaign[];
   newCampaigns: Campaign[];
}

const SOCIALS: Record<SocialPlatform, { label: string; color: string }> = {
   facebook: { label: "f", color: "#1877F2" },
   youtube: { label: "▶", color: "#ff0000" },
   tiktok: { label: "♪", color: "#ffffff" },
   instagram: { label: "◉", color: "#E1306C" },
   x: { label: "𝕏", color: "#ffffff" },
};

export default function DiscoverPage() {
   const [feed, setFeed] = useState<Feed | null>(null);
   const [loading, setLoading] = useState(true);
   const [featuredIndex, setFeaturedIndex] = useState(0);

   useEffect(() => {
      fetch("/api/discover/feed", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setFeed(d))
         .finally(() => setLoading(false));
   }, []);

   useEffect(() => {
      if (!feed || feed.featured.length < 2) return;
      const t = setInterval(() => {
         setFeaturedIndex((i) => (i + 1) % feed.featured.length);
      }, 8000);
      return () => clearInterval(t);
   }, [feed]);

   const fmtMoney = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
      return `$${n.toFixed(0)}`;
   };

   if (loading) {
      return (
         <div className={styles.page}>
            <div className={styles.loading}>Loading…</div>
         </div>
      );
   }
   if (!feed) {
      return (
         <div className={styles.page}>
            <div className={styles.loading}>Failed to load</div>
         </div>
      );
   }

   const featured = feed.featured[featuredIndex];

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.topBar}>
            <Link href="/discover" className={styles.backLink}>
               <ChevronLeft size={16} />
               <span>Discover Content Rewards</span>
            </Link>
            <button className={styles.installBtn}>
               Install app in your space
            </button>
         </div>

         {/* Featured hero carousel */}
         {featured && (
            <div className={styles.heroWrap}>
               <Link
                  href={`/discover/${featured.slug}`}
                  className={styles.hero}
               >
                  {featured.coverImage && (
                     <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className={styles.heroImg}
                     />
                  )}
                  <div className={styles.heroOverlay} />
                  <div className={styles.heroContent}>
                     <div className={styles.heroBadge}>
                        <span className={styles.heroDot} />
                        <span>Featured campaign</span>
                     </div>
                     <div className={styles.heroTitle}>{featured.title}</div>
                     <div className={styles.heroMetaRow}>
                        <span>
                           {fmtMoney(featured.budget)} ·{" "}
                           {featured.totalViews.toLocaleString()} views
                        </span>
                        <span className={styles.heroDotSep}>·</span>
                        <span>${featured.cpm}/1K</span>
                        <span className={styles.heroDotSep}>·</span>
                        <span className={styles.heroCategory}>
                           {featured.category}
                        </span>
                     </div>
                  </div>
                  <div className={styles.heroBrand}>
                     <span className={styles.heroBrandCheck}>✓</span>
                     <span>{featured.brandName}</span>
                  </div>
                  <button className={styles.heroView}>View campaign</button>
               </Link>

               {feed.featured.length > 1 && (
                  <div className={styles.heroDots}>
                     {feed.featured.map((_, i) => (
                        <button
                           key={i}
                           className={`${styles.heroDotItem} ${
                              i === featuredIndex ? styles.heroDotActive : ""
                           }`}
                           onClick={() => setFeaturedIndex(i)}
                        />
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* Your campaigns */}
         {feed.yourCampaigns.length > 0 && (
            <Row
               title="Your campaigns"
               campaigns={feed.yourCampaigns}
               fmtMoney={fmtMoney}
            />
         )}

         {/* Popular this week */}
         <Row
            title="Popular this week"
            campaigns={feed.popular}
            fmtMoney={fmtMoney}
         />

         {/* New campaigns */}
         <Row
            title="New campaigns"
            campaigns={feed.newCampaigns}
            fmtMoney={fmtMoney}
         />
      </div>
   );
}

// =========================================
// SECTION ROW (horizontal carousel)
// =========================================
function Row({
   title,
   campaigns,
   fmtMoney,
}: {
   title: string;
   campaigns: Campaign[];
   fmtMoney: (n: number) => string;
}) {
   const scrollerRef = useRef<HTMLDivElement>(null);

   const scroll = (dir: "left" | "right") => {
      const el = scrollerRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.85;
      el.scrollBy({
         left: dir === "left" ? -amount : amount,
         behavior: "smooth",
      });
   };

   if (campaigns.length === 0) return null;

   return (
      <section className={styles.rowSection}>
         <div className={styles.rowHeader}>
            <div className={styles.rowTitle}>{title}</div>
            <div className={styles.rowNav}>
               <button
                  className={styles.navBtn}
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
               >
                  <ChevronLeft size={14} />
               </button>
               <button
                  className={styles.navBtn}
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
               >
                  <ChevronRight size={14} />
               </button>
            </div>
         </div>

         <div className={styles.scroller} ref={scrollerRef}>
            {campaigns.map((c) => (
               <CampaignCard key={c.id} c={c} fmtMoney={fmtMoney} />
            ))}
         </div>
      </section>
   );
}

// =========================================
// CAMPAIGN CARD
// =========================================
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
         <div className={styles.cardCover}>
            {c.coverImage ? (
               <img src={c.coverImage} alt={c.title} />
            ) : (
               <div className={styles.cardCoverFallback}>🎬</div>
            )}

            {/* Left-top platform icons */}
            <div className={styles.cardCoverLeft}>
               {c.socials.slice(0, 3).map((s) => (
                  <span
                     key={s}
                     className={styles.cardPlatformIcon}
                     style={{ color: SOCIALS[s]?.color ?? "#fff" }}
                  >
                     {SOCIALS[s]?.label ?? "?"}
                  </span>
               ))}
            </div>

            {/* Right-top status dot */}
            <div className={styles.cardCoverRight}>
               {c.requestStatus === "pending" && (
                  <span className={styles.cardStatusPending}>
                     <Clock size={10} /> Pending
                  </span>
               )}
               {c.requestStatus === "approved" && (
                  <span className={styles.cardStatusApproved}>
                     <Check size={10} /> Joined
                  </span>
               )}
               {c.requestStatus === "rejected" && (
                  <span className={styles.cardStatusRejected}>
                     <X size={10} /> Declined
                  </span>
               )}
            </div>
         </div>

         <div className={styles.cardBody}>
            {/* Row 1 — socials + duration + brand */}
            <div className={styles.cardMetaRow}>
               <div className={styles.cardSocialsMini}>
                  {c.socials.map((s) => (
                     <span
                        key={s}
                        style={{ color: SOCIALS[s]?.color ?? "#fff" }}
                     >
                        {SOCIALS[s]?.label}
                     </span>
                  ))}
               </div>
               <span className={styles.cardDuration}>{c.duration}</span>
               <span className={styles.cardDot}>·</span>
               <span className={styles.cardBrandName}>{c.brandName}</span>
               {c.brandVerified && (
                  <span className={styles.cardBrandCheck}>✓</span>
               )}
            </div>

            {/* Row 2 — title */}
            <div className={styles.cardTitle}>{c.title}</div>

            {/* Row 3 — stats */}
            <div className={styles.cardStatsRow}>
               <span className={styles.cardCpm}>${c.cpm}/1k</span>
               <span className={styles.cardJoins}>
                  <Users size={10} /> {c.joinedUsers}
               </span>
               <span className={styles.cardSpend}>
                  {fmtMoney(c.budgetSpent)}/{fmtMoney(c.budget)}
               </span>
            </div>

            {/* Progress bar */}
            <div className={styles.cardProgressTrack}>
               <div
                  className={styles.cardProgressFill}
                  style={{ width: `${pct}%` }}
               />
            </div>
         </div>
      </Link>
   );
}
