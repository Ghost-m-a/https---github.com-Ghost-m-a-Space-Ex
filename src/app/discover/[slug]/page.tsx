"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
   ChevronLeft,
   Users,
   Check,
   Loader2,
   Clock,
   Link as LinkIcon,
   Lock,
   Star,
   ArrowLeft,
} from "lucide-react";
import ConnectAccountsModal from "@/components/ConnectAccountsModal";
import styles from "@/styles/pages/campaign.module.css";

type SocialPlatform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

interface PlatformRate {
   platform: string;
   minViews: number;
   maxViews: number;
   cpm: number;
}

interface Campaign {
   id: string;
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   coverImage: string;
   brandName: string;
   brandVerified: boolean;
   socials: SocialPlatform[];
   platformRates: PlatformRate[];
   requirements: string[];
   instructions: string[];
   summary: string;
   budget: number;
   budgetSpent: number;
   budgetRemaining: number;
   cpm: number;
   joinedUsers: number;
   totalViews: number;
   duration: string;
   requestStatus: string | null;
   reviewNote: string;
}

interface LeaderEntry {
   rank: number;
   name: string;
   avatar: string;
   earnings: number;
   totalViews: number;
}

interface ViewPoint {
   date: string;
   views: number;
}

const SOCIALS: Record<SocialPlatform, { label: string; color: string }> = {
   facebook: { label: "f", color: "#1877F2" },
   youtube: { label: "▶", color: "#ff0000" },
   tiktok: { label: "♪", color: "#ffffff" },
   instagram: { label: "◉", color: "#E1306C" },
   x: { label: "𝕏", color: "#ffffff" },
};

const PLATFORM_LABEL: Record<string, string> = {
   tiktok: "TikTok",
   instagram: "Instagram",
   youtube: "YouTube",
   x: "X",
   facebook: "Facebook",
};

export default function CampaignDetailPage() {
   const params = useParams<{ slug: string }>();
   const router = useRouter();

   const [campaign, setCampaign] = useState<Campaign | null>(null);
   const [loading, setLoading] = useState(true);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [showApply, setShowApply] = useState(false);
   const [message, setMessage] = useState("");

   const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
   const [avgEarn, setAvgEarn] = useState(0);
   const [totalCreators, setTotalCreators] = useState(0);

   const [chart, setChart] = useState<ViewPoint[]>([]);

   const [connectOpen, setConnectOpen] = useState(false);

   const load = async () => {
      try {
         const res = await fetch(`/api/discover/campaigns/${params.slug}`, {
            credentials: "include",
         });
         if (!res.ok) throw new Error("Campaign not found");
         const data = await res.json();
         setCampaign(data.campaign);
      } catch (e) {
         setError((e as Error).message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (params?.slug) load();
   }, [params?.slug]);

   useEffect(() => {
      if (!campaign?.id) return;
      fetch(`/api/discover/campaigns/${campaign.id}/leaderboard`)
         .then((r) => r.json())
         .then((d) => {
            setLeaderboard(d.leaderboard ?? []);
            setAvgEarn(d.average ?? 0);
            setTotalCreators(d.total ?? 0);
         });
      fetch(`/api/discover/campaigns/${campaign.id}/views-chart`)
         .then((r) => r.json())
         .then((d) => setChart(d.points ?? []));
   }, [campaign?.id]);

   const submitRequest = async () => {
      if (!campaign) return;
      setBusy(true);
      setError(null);
      try {
         const res = await fetch(
            `/api/discover/campaigns/${campaign.id}/join`,
            {
               method: "POST",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ message }),
            },
         );
         if (res.status === 401) {
            router.push(
               "/login?from=" +
                  encodeURIComponent(`/discover/${campaign.slug}`),
            );
            return;
         }
         const data = await res.json();
         if (!res.ok) {
            setError(data?.error ?? "Failed to submit");
            return;
         }
         setShowApply(false);
         setMessage("");
         await load();
         router.refresh();
      } finally {
         setBusy(false);
      }
   };

   const leave = async () => {
      if (!campaign) return;
      const wasApproved = campaign.requestStatus === "approved";
      const ok = window.confirm(
         wasApproved ? "Leave this campaign?" : "Withdraw your request?",
      );
      if (!ok) return;
      setBusy(true);
      try {
         const res = await fetch(
            `/api/discover/campaigns/${campaign.id}/leave`,
            { method: "POST", credentials: "include" },
         );
         if (res.ok) {
            await load();
            router.refresh();
         }
      } finally {
         setBusy(false);
      }
   };

   const fmtMoney = (n: number) =>
      `$${(n ?? 0).toLocaleString(undefined, {
         maximumFractionDigits: 0,
      })}`;

   if (loading) return <div className={styles.loading}>Loading campaign…</div>;
   if (error || !campaign)
      return <div className={styles.loading}>{error ?? "Not found"}</div>;

   const status = campaign.requestStatus;
   const pct =
      campaign.budget > 0
         ? Math.min(100, (campaign.budgetSpent / campaign.budget) * 100)
         : 0;

   return (
      <div className={styles.page}>
         {/* Header */}
         <div className={styles.topBar}>
            <Link href="/discover" className={styles.backLink}>
               <ArrowLeft size={16} />
               <span>Discover Content Rewards</span>
            </Link>
            <button className={styles.installBtn}>
               Install app in your space
            </button>
         </div>

         {/* Cover */}
         <div className={styles.coverWrap}>
            {campaign.coverImage && (
               <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className={styles.coverImg}
               />
            )}
            <div className={styles.coverOverlay} />
            <button
               className={styles.shareBtn}
               onClick={() => {
                  if (navigator.share) {
                     navigator.share({
                        title: campaign.title,
                        url: window.location.href,
                     });
                  } else {
                     navigator.clipboard.writeText(window.location.href);
                  }
               }}
            >
               <LinkIcon size={14} />
            </button>
            <div className={styles.coverInfo}>
               <div className={styles.coverText}>{campaign.summary}</div>
               <div className={styles.coverBrandRow}>
                  <div className={styles.coverBrandPill}>
                     <span className={styles.coverBrandCheck}>✓</span>
                     <span>{campaign.brandName}</span>
                  </div>
               </div>
               <div className={styles.coverTitle}>{campaign.title}</div>
            </div>
         </div>

         {/* Action row */}
         <div className={styles.actionRow}>
            {status === null && !showApply && (
               <button
                  className={styles.joinBigBtn}
                  onClick={() => {
                     if (!status) setShowApply(true);
                  }}
                  disabled={busy}
               >
                  Join campaign
               </button>
            )}
            {status === "pending" && (
               <button
                  className={styles.pendingBigBtn}
                  onClick={leave}
                  disabled={busy}
               >
                  <Clock size={14} /> Request pending · Withdraw
               </button>
            )}
            {status === "approved" && (
               <button
                  className={styles.approvedBigBtn}
                  onClick={leave}
                  disabled={busy}
               >
                  <Check size={14} /> Joined · Leave
               </button>
            )}
            {(status === "rejected" ||
               status === "withdrawn" ||
               status === "left") && (
               <button
                  className={styles.joinBigBtn}
                  onClick={() => setShowApply(true)}
                  disabled={busy}
               >
                  Request again
               </button>
            )}

            <div className={styles.actionMeta}>
               <span className={styles.cpmPill}>CPM</span>
               <span className={styles.metaCount}>
                  <Users size={12} /> {campaign.joinedUsers}
               </span>
               <span className={styles.metaSocials}>
                  {campaign.socials.map((s) => (
                     <span key={s} style={{ color: SOCIALS[s]?.color }}>
                        {SOCIALS[s]?.label}
                     </span>
                  ))}
               </span>
               <button
                  className={styles.connectBtn}
                  onClick={() => setConnectOpen(true)}
               >
                  <span className={styles.connectDot} />
                  Connect accounts
               </button>
            </div>
         </div>

         {/* Apply panel */}
         {showApply && (
            <div className={styles.applyPanel}>
               <label className={styles.applyLabel}>
                  Tell the business why you'd be a great fit
               </label>
               <textarea
                  className={styles.applyTextarea}
                  rows={3}
                  maxLength={800}
                  placeholder="e.g. I've made 30+ TikToks averaging 80k views in this niche."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
               />
               <div className={styles.applyActions}>
                  <button
                     className={styles.btnGhost}
                     onClick={() => {
                        setShowApply(false);
                        setMessage("");
                     }}
                     disabled={busy}
                  >
                     Cancel
                  </button>
                  <button
                     className={styles.joinBigBtn}
                     onClick={submitRequest}
                     disabled={busy}
                  >
                     {busy ? (
                        <>
                           <Loader2 size={14} className={styles.spin} />{" "}
                           Submitting…
                        </>
                     ) : (
                        "Submit request"
                     )}
                  </button>
               </div>
            </div>
         )}

         {/* Platform reward grid */}
         {campaign.platformRates.length > 0 && (
            <div className={styles.rewardGrid}>
               {campaign.platformRates.map((r) => (
                  <div key={r.platform} className={styles.rewardCard}>
                     <div className={styles.rewardHeader}>
                        <span
                           style={{
                              color: SOCIALS[r.platform as SocialPlatform]
                                 ?.color,
                           }}
                        >
                           {SOCIALS[r.platform as SocialPlatform]?.label}
                        </span>
                        <span>{PLATFORM_LABEL[r.platform] ?? r.platform}</span>
                     </div>
                     <div className={styles.rewardCols}>
                        <div>
                           <div className={styles.rewardColLabel}>
                              CPM per 1k views
                           </div>
                           <div className={styles.rewardColValue}>
                              ${r.cpm.toFixed(2)}
                           </div>
                        </div>
                        <div>
                           <div className={styles.rewardColLabel}>
                              Minimum views
                           </div>
                           <div className={styles.rewardColValue}>
                              ${r.minViews}
                           </div>
                        </div>
                        <div>
                           <div className={styles.rewardColLabel}>
                              Maximum views
                           </div>
                           <div className={styles.rewardColValue}>
                              ${r.maxViews}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Budget card */}
         <div className={styles.budgetCard}>
            <div className={styles.budgetHeader}>
               <span>Budget</span>
               <span className={styles.budgetValue}>
                  {fmtMoney(campaign.budget)}
               </span>
            </div>
            <div className={styles.budgetProgress}>
               <div
                  className={styles.budgetProgressFill}
                  style={{ width: `${pct}%` }}
               />
            </div>
            <div className={styles.budgetFooter}>
               {fmtMoney(campaign.budgetSpent)} spent
               <span className={styles.budgetAvailable}>
                  {fmtMoney(campaign.budgetRemaining)} still available, big
                  reward for creators
               </span>
            </div>
         </div>

         {/* Reference materials + requirements */}
         <div className={styles.lockedSection}>
            <div className={styles.lockedHeader}>
               <Lock size={12} /> Reference materials
            </div>
            <div className={styles.lockedBody}>
               <div className={styles.lockedSkeleton} />
               <div className={styles.lockedSkeleton} />
            </div>
         </div>

         <div className={styles.lockedSection}>
            <div className={styles.lockedHeader}>
               <Lock size={12} /> Content requirements
            </div>
            <div className={styles.lockedBody}>
               <div className={styles.lockedSkeleton} />
               <div className={styles.lockedSkeleton} />
            </div>
         </div>

         {/* Bottom join CTA */}
         <div className={styles.bottomCta}>
            {status === "approved" ? (
               <div className={styles.bottomApproved}>
                  <Check size={14} /> You're on this campaign
               </div>
            ) : (
               <button
                  className={styles.joinBigBtn}
                  onClick={() =>
                     status === "pending" ? undefined : setShowApply(true)
                  }
                  disabled={busy || status === "pending"}
               >
                  {status === "pending" ? "Request pending" : "Join campaign"}
               </button>
            )}
            <div className={styles.bottomLocked}>
               <Lock size={11} /> Unlock 1 file
            </div>
         </div>

         {/* Top clippers */}
         {leaderboard.length > 0 && (
            <section className={styles.leaderSection}>
               <h2 className={styles.sectionHeading}>Top clippers</h2>
               <div className={styles.leaderGrid}>
                  {leaderboard.map((e) => (
                     <div key={e.rank} className={styles.leaderCard}>
                        <div className={styles.leaderRank}>
                           Ranking {e.rank}
                        </div>
                        <div
                           className={`${styles.medal} ${
                              e.rank === 1
                                 ? styles.medalGold
                                 : e.rank === 2
                                   ? styles.medalSilver
                                   : styles.medalBronze
                           }`}
                        >
                           <Star size={20} />
                           <div className={styles.medalNumber}>{e.rank}</div>
                        </div>
                        <div className={styles.leaderEarnings}>
                           {fmtMoney(e.earnings)}
                        </div>
                        <div className={styles.leaderName}>
                           {e.name}
                           <span className={styles.leaderOnline} />
                        </div>
                     </div>
                  ))}
               </div>
               <div className={styles.leaderStats}>
                  Joining {totalCreators} creators, earn {fmtMoney(avgEarn)} on
                  average in this campaign.
               </div>
            </section>
         )}

         {/* Views chart */}
         <section className={styles.chartSection}>
            <div className={styles.chartHeader}>
               <div>
                  <div className={styles.chartTitle}>Views</div>
                  <div className={styles.chartTotal}>
                     {campaign.totalViews.toLocaleString()}
                  </div>
               </div>
               <div className={styles.chartTabs}>
                  <button className={styles.chartTab}>Views</button>
                  <button className={styles.chartTab}>Submissions</button>
               </div>
            </div>
            <div className={styles.chartMeta}>
               Views across all platforms, aggregated per creator per day
            </div>
            <ViewsChart points={chart} />
         </section>

         <ConnectAccountsModal
            isOpen={connectOpen}
            onClose={() => setConnectOpen(false)}
         />
      </div>
   );
}

function ViewsChart({ points }: { points: ViewPoint[] }) {
   if (points.length === 0) {
      return <div className={styles.chartEmpty}>No views data yet</div>;
   }
   const width = 800;
   const height = 160;
   const max = Math.max(1, ...points.map((p) => p.views));
   const path = points
      .map((p, i) => {
         const x = (i / Math.max(1, points.length - 1)) * width;
         const y = height - (p.views / max) * (height * 0.85) - 10;
         return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

   return (
      <div className={styles.chartWrap}>
         <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={styles.chartSvg}
         >
            <defs>
               <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(249, 115, 22, 0.25)" />
                  <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
               </linearGradient>
            </defs>
            <path
               d={`${path} L ${width} ${height} L 0 ${height} Z`}
               fill="url(#viewsFill)"
            />
            <path
               d={path}
               fill="none"
               stroke="#f97316"
               strokeWidth="2"
               strokeLinecap="round"
            />
         </svg>
      </div>
   );
}
