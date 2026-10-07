"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
   ChevronLeft,
   ChevronRight,
   Check,
   Link2,
   FileText,
   Shield,
   TrendingUp,
   Users,
   Wallet,
   ExternalLink,
} from "lucide-react";
import styles from "./campaign.module.css";

const SOCIALS: Record<string, { label: string; color: string }> = {
   facebook: { label: "f", color: "#1877F2" },
   youtube: { label: "▶", color: "#ff0000" },
   tiktok: { label: "♪", color: "#fff" },
   instagram: { label: "◉", color: "#E1306C" },
   x: { label: "𝕏", color: "#fff" },
};

export default function CampaignDetailPage() {
   const params = useParams();
   const router = useRouter();
   const slug = params.slug as string;

   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [joining, setJoining] = useState(false);
   const [showSubmit, setShowSubmit] = useState(false);
   const [platform, setPlatform] = useState("");
   const [videoUrl, setVideoUrl] = useState("");
   const [views, setViews] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [submitMsg, setSubmitMsg] = useState("");

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const res = await fetch(`/api/discover/campaigns/${slug}`);
         const d = await res.json();
         if (!res.ok) {
            setData(null);
         } else {
            setData(d);
         }
      } finally {
         setLoading(false);
      }
   }, [slug]);

   useEffect(() => {
      load();
   }, [load]);

   const handleJoin = async () => {
      setJoining(true);
      try {
         const res = await fetch(`/api/discover/campaigns/${slug}/join`, {
            method: "POST",
         });
         if (res.status === 401) {
            router.push("/login");
            return;
         }
         await load();
      } finally {
         setJoining(false);
      }
   };

   const handleSubmitViews = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitMsg("");
      try {
         const res = await fetch(`/api/discover/campaigns/${slug}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform, videoUrl, views: Number(views) }),
         });
         const d = await res.json();
         if (!res.ok) {
            setSubmitMsg(d.error || "Failed");
            return;
         }
         setSubmitMsg(`✅ ${d.message}`);
         setVideoUrl("");
         setViews("");
         setShowSubmit(false);
         await load();
      } finally {
         setSubmitting(false);
      }
   };

   const fmtMoney = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `$${n.toLocaleString()}`;
      return `$${n.toFixed(2)}`;
   };

   if (loading)
      return <div className={styles.loading}>Loading campaign...</div>;
   if (!data?.campaign) {
      return (
         <div className={styles.notFound}>
            <div>Campaign not found</div>
            <Link href="/discover" className={styles.backBtn}>
               Back to Discover
            </Link>
         </div>
      );
   }

   const c = data.campaign;
   const myContribution = data.myContribution;
   const topContributors = data.topContributors || [];
   const pct =
      c.budget > 0 ? Math.min(100, (c.budgetSpent / c.budget) * 100) : 0;

   return (
      <div className={styles.page}>
         {/* Top bar */}
         <div className={styles.topBar}>
            <Link href="/discover" className={styles.backLink}>
               <ChevronLeft size={16} />
               <span>Discover Content Rewards</span>
            </Link>
            <button className={styles.installBtn}>
               Install app in your whop
            </button>
         </div>

         {/* Cover */}
         <div className={styles.coverWrap}>
            {c.coverImage && (
               <img
                  src={c.coverImage}
                  alt={c.title}
                  className={styles.coverImg}
               />
            )}
            <div className={styles.coverOverlay} />
            <div className={styles.coverContent}>
               <div className={styles.coverLeft}>
                  <div className={styles.coverAvatar}>{c.brandAvatar}</div>
                  <div>
                     <div className={styles.coverBrandName}>
                        {c.brandName}{" "}
                        {c.brandVerified && (
                           <span className={styles.check}>✓</span>
                        )}
                     </div>
                     <div className={styles.coverDescription}>{c.subtitle}</div>
                  </div>
               </div>
               <h1 className={styles.coverTitle}>{c.title}</h1>
            </div>
         </div>

         {/* Stats bar */}
         <div className={styles.statsBar}>
            <button
               className={styles.acceptBtn}
               onClick={handleJoin}
               disabled={joining || myContribution}
            >
               {myContribution
                  ? "✓ Joined"
                  : joining
                    ? "Joining..."
                    : "Accept Campaign"}
            </button>
            <div className={styles.statsRow}>
               <span className={styles.stat}>
                  <span className={styles.statIcon}>💰</span> CPM
               </span>
               <span className={styles.stat}>
                  <Users size={14} /> {c.joinedUsers}
               </span>
               <span className={styles.stat}>{c.category}</span>
               <div className={styles.statSocials}>
                  {c.socials.map((s: string) => (
                     <span
                        key={s}
                        style={{ color: SOCIALS[s]?.color || "#fff" }}
                     >
                        {SOCIALS[s]?.label || "•"}
                     </span>
                  ))}
               </div>
               <span className={styles.stat}>Accept Campaign</span>
            </div>
         </div>

         {/* Submit message */}
         {submitMsg && <div className={styles.submitMsg}>{submitMsg}</div>}

         {/* Submit views button */}
         {myContribution && (
            <div className={styles.submitSection}>
               <div className={styles.submitStats}>
                  <div>
                     <div className={styles.submitLabel}>Your views</div>
                     <div className={styles.submitValue}>
                        {myContribution.totalViews.toLocaleString()}
                     </div>
                  </div>
                  <div>
                     <div className={styles.submitLabel}>Your earnings</div>
                     <div className={styles.submitValue}>
                        {fmtMoney(myContribution.totalEarned)}
                     </div>
                  </div>
               </div>
               <button
                  className={styles.submitBtn}
                  onClick={() => setShowSubmit(!showSubmit)}
               >
                  {showSubmit ? "Cancel" : "Submit New Video"}
               </button>
            </div>
         )}

         {/* Submit form */}
         {showSubmit && (
            <form className={styles.submitForm} onSubmit={handleSubmitViews}>
               <div className={styles.formRow}>
                  <label className={styles.label}>Platform</label>
                  <select
                     className={styles.input}
                     value={platform}
                     onChange={(e) => setPlatform(e.target.value)}
                     required
                  >
                     <option value="">Select platform</option>
                     {c.socials.map((s: string) => (
                        <option key={s} value={s}>
                           {s}
                        </option>
                     ))}
                  </select>
               </div>
               <div className={styles.formRow}>
                  <label className={styles.label}>Video URL</label>
                  <input
                     className={styles.input}
                     placeholder="https://..."
                     value={videoUrl}
                     onChange={(e) => setVideoUrl(e.target.value)}
                     required
                  />
               </div>
               <div className={styles.formRow}>
                  <label className={styles.label}>Views</label>
                  <input
                     className={styles.input}
                     type="number"
                     placeholder="1000"
                     value={views}
                     onChange={(e) => setViews(e.target.value)}
                     min="1"
                     required
                  />
               </div>
               <button
                  type="submit"
                  className={styles.submitFormBtn}
                  disabled={submitting}
               >
                  {submitting ? "Submitting..." : "Submit for credit"}
               </button>
            </form>
         )}

         {/* Platform rates table */}
         {c.platformRates && c.platformRates.length > 0 && (
            <div className={styles.ratesGrid}>
               {c.platformRates.map((r: any) => (
                  <div key={r.platform} className={styles.rateCard}>
                     <div
                        className={styles.rateHeader}
                        style={{ color: SOCIALS[r.platform]?.color || "#fff" }}
                     >
                        {SOCIALS[r.platform]?.label}{" "}
                        {r.platform.charAt(0).toUpperCase() +
                           r.platform.slice(1)}
                     </div>
                     <div className={styles.rateRow}>
                        <div>
                           <div className={styles.rateLabel}>Min Views</div>
                           <div className={styles.rateValue}>
                              {r.minViews.toLocaleString()}
                           </div>
                        </div>
                        <div>
                           <div className={styles.rateLabel}>Max Views</div>
                           <div className={styles.rateValue}>
                              {r.maxViews.toLocaleString()}
                           </div>
                        </div>
                        <div>
                           <div className={styles.rateLabel}>CPM</div>
                           <div className={styles.rateValue}>${r.cpm}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Info Grid */}
         <div className={styles.infoGrid}>
            {/* Budget */}
            <div className={styles.infoCard}>
               <div className={styles.infoCardTitle}>The Budget</div>
               <div className={styles.budgetBig}>{fmtMoney(c.budget)}</div>
               <div className={styles.budgetSub}>
                  Spent: {fmtMoney(c.budgetSpent)}
               </div>
               <div className={styles.budgetTrack}>
                  <div
                     className={styles.budgetFill}
                     style={{ width: `${pct}%` }}
                  />
               </div>
               <div className={styles.budgetRemaining}>
                  <span className={styles.remainingDot} />{" "}
                  {fmtMoney(c.budgetRemaining)} remaining
               </div>
            </div>

            {/* Resources */}
            <div className={styles.infoCard}>
               <div className={styles.infoCardTitle}>Resources</div>
               <a className={styles.resourceRow} href="#" target="_blank">
                  <span className={styles.resourceIcon}>🔗</span>
                  <span>Instructions</span>
                  <ExternalLink size={12} />
               </a>
               <a className={styles.resourceRow} href="#" target="_blank">
                  <span className={styles.resourceIcon}>🔗</span>
                  <span>Assets</span>
                  <ExternalLink size={12} />
               </a>
            </div>
         </div>

         {/* Summary */}
         {c.summary && (
            <div className={styles.section}>
               <div className={styles.sectionTitle}>Summary</div>
               <div className={styles.summaryText}>{c.summary}</div>
            </div>
         )}

         {/* Requirements + Instructions */}
         <div className={styles.requirementsGrid}>
            {c.requirements?.length > 0 && (
               <div className={styles.section}>
                  <div className={styles.sectionTitle}>
                     Content Requirements
                  </div>
                  <ul className={styles.bulletList}>
                     {c.requirements.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                     ))}
                  </ul>
               </div>
            )}
            {c.instructions?.length > 0 && (
               <div className={styles.section}>
                  <div className={styles.sectionTitle}>
                     Content Creator Requirements
                  </div>
                  <ul className={styles.bulletList}>
                     {c.instructions.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                     ))}
                  </ul>
               </div>
            )}
         </div>

         {/* Top Contributors */}
         {topContributors.length > 0 && (
            <div className={styles.section}>
               <div className={styles.sectionTitle}>Top Clippers</div>
               <div className={styles.leadersGrid}>
                  {topContributors.map((t: any, i: number) => (
                     <div key={t.id} className={styles.leaderCard}>
                        <div className={styles.leaderRank}>#{i + 1}</div>
                        <div className={styles.leaderAvatar}>{t.avatar}</div>
                        <div className={styles.leaderName}>{t.name}</div>
                        <div className={styles.leaderEarned}>
                           {fmtMoney(t.earned)}
                        </div>
                        <div className={styles.leaderViews}>
                           {t.views.toLocaleString()} views
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
