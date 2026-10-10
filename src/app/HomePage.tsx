"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
   ChevronRight,
   Zap,
   Trophy,
   Clock,
   Check,
   X,
   DollarSign,
   Eye,
} from "lucide-react";
import SubmitContentModal from "@/components/SubmitContentModal";
import styles from "@/styles/pages/home.module.css";

// =========================================
// TYPES
// =========================================
interface Balance {
   id: string;
   name: string;
   avatar: string;
   amount: number;
   href: string;
}

interface PulseEvent {
   id: string;
   kind: string;
   actorName: string;
   actorAvatar: string;
   businessName: string;
   amount: number;
   message: string;
   location: string;
   countryCode: string;
   createdAt: string;
}

type SignupStatus = "pending" | "approved" | "rejected" | "withdrawn" | "left";

interface JoinedCampaign {
   contributionId: string;
   joinedAt: string;
   totalViews: number;
   totalEarned: number;
   status: SignupStatus;
   reviewNote: string;
   reviewedAt: string | null;
   campaign: {
      id: string;
      slug: string;
      title: string;
      coverImage: string;
      brandName: string;
      budget: number;
      budgetSpent: number;
      budgetRemaining: number;
      cpm: number;
      status: string;
   };
}

interface Stats {
   totalEarned: number;
   totalViews: number;
   activeCampaigns: number;
   joinedCount: number;
   pendingCount: number;
}

// =========================================
// PAGE
// =========================================
export default function PersonalHomePage() {
   const [balances, setBalances] = useState<Balance[]>([]);
   const [total, setTotal] = useState(0);
   const [pulse, setPulse] = useState<PulseEvent[]>([]);
   const [joined, setJoined] = useState<JoinedCampaign[]>([]);
   const [stats, setStats] = useState<Stats | null>(null);
   const [loadingBalances, setLoadingBalances] = useState(true);
   const [loadingPulse, setLoadingPulse] = useState(true);
   const [loadingCampaigns, setLoadingCampaigns] = useState(true);
   const [economicIntelligence, setEconomicIntelligence] = useState(false);
   const [busyId, setBusyId] = useState<string | null>(null);
   const [submitFor, setSubmitFor] = useState<JoinedCampaign | null>(null);

   const loadCampaigns = () => {
      setLoadingCampaigns(true);
      fetch("/api/user/campaigns", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => {
            setJoined(d.joined ?? []);
            setStats(d.stats ?? null);
         })
         .finally(() => setLoadingCampaigns(false));
   };

   useEffect(() => {
      fetch("/api/personal/balances", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => {
            setBalances(d.balances ?? []);
            setTotal(d.total ?? 0);
         })
         .finally(() => setLoadingBalances(false));

      fetch("/api/pulse?limit=10", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setPulse(d.events ?? []))
         .finally(() => setLoadingPulse(false));

      loadCampaigns();
   }, []);

   const fmtMoney = (n: number) =>
      `$${(n ?? 0).toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
      })}`;

   const leave = async (item: JoinedCampaign) => {
      const wasApproved = item.status === "approved";
      const confirmed = window.confirm(
         wasApproved
            ? "Leave this campaign? You'll need to request access again."
            : "Withdraw your request?",
      );
      if (!confirmed) return;

      setBusyId(item.contributionId);
      try {
         const res = await fetch(
            `/api/discover/campaigns/${item.campaign.id}/leave`,
            { method: "POST", credentials: "include" },
         );
         if (res.ok) loadCampaigns();
      } finally {
         setBusyId(null);
      }
   };

   return (
      <div className={styles.page}>
         <div className={styles.layout}>
            {/* ================= LEFT COLUMN ================= */}
            <div className={styles.main}>
               {/* Total balance hero */}
               <div className={styles.heroSection}>
                  <div className={styles.heroLabel}>
                     Total balance · All balances
                  </div>
                  <div className={styles.heroAmount}>
                     {loadingBalances ? "—" : fmtMoney(total)}
                  </div>
                  <BalanceChart />
               </div>

               {/* Economic Intelligence banner */}
               <div className={styles.eiCard}>
                  <div className={styles.eiText}>
                     Businesses grow <strong>3x faster</strong> with Economic
                     Intelligence.
                  </div>
                  <button
                     type="button"
                     className={styles.eiRow}
                     onClick={() => setEconomicIntelligence((v) => !v)}
                  >
                     <div className={styles.eiLeft}>
                        <Zap size={14} />
                        <span>{economicIntelligence ? "On" : "Turn on"}</span>
                     </div>
                     <div
                        className={`${styles.switch} ${
                           economicIntelligence ? styles.switchOn : ""
                        }`}
                     >
                        <span className={styles.switchKnob} />
                     </div>
                  </button>
               </div>

               {/* ---- YOUR CAMPAIGNS SECTION ---- */}
               <section className={styles.campaignsSection}>
                  <div className={styles.sectionHeader}>
                     <div className={styles.sectionHeaderLeft}>
                        <h2 className={styles.sectionTitle}>Your Campaigns</h2>
                        {stats && stats.pendingCount > 0 && (
                           <span className={styles.pendingChip}>
                              {stats.pendingCount} pending
                           </span>
                        )}
                     </div>
                     <Link href="/discover" className={styles.sectionLink}>
                        Browse more <ChevronRight size={14} />
                     </Link>
                  </div>

                  {stats && joined.length > 0 && (
                     <div className={styles.miniStatsRow}>
                        <div className={styles.miniStat}>
                           <div className={styles.miniStatIcon}>
                              <DollarSign size={13} />
                           </div>
                           <div>
                              <div className={styles.miniStatLabel}>
                                 Total earned
                              </div>
                              <div className={styles.miniStatValue}>
                                 {fmtMoney(stats.totalEarned)}
                              </div>
                           </div>
                        </div>
                        <div className={styles.miniStat}>
                           <div className={styles.miniStatIcon}>
                              <Eye size={13} />
                           </div>
                           <div>
                              <div className={styles.miniStatLabel}>
                                 Total views
                              </div>
                              <div className={styles.miniStatValue}>
                                 {stats.totalViews.toLocaleString()}
                              </div>
                           </div>
                        </div>
                        <div className={styles.miniStat}>
                           <div className={styles.miniStatIcon}>
                              <Trophy size={13} />
                           </div>
                           <div>
                              <div className={styles.miniStatLabel}>Active</div>
                              <div className={styles.miniStatValue}>
                                 {stats.activeCampaigns}
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {loadingCampaigns ? (
                     <div className={styles.campaignsLoading}>
                        Loading campaigns…
                     </div>
                  ) : joined.length === 0 ? (
                     <div className={styles.campaignsEmpty}>
                        <div className={styles.campaignsEmptyIcon}>
                           <Trophy size={28} />
                        </div>
                        <div className={styles.campaignsEmptyTitle}>
                           No campaigns yet
                        </div>
                        <div className={styles.campaignsEmptySub}>
                           Request to join campaigns to earn credits for every
                           1,000 views you generate.
                        </div>
                        <Link href="/discover" className={styles.primaryBtn}>
                           Browse campaigns
                        </Link>
                     </div>
                  ) : (
                     <div className={styles.campaignGrid}>
                        {joined.map((item) => (
                           <CampaignControlCard
                              key={item.contributionId}
                              item={item}
                              busyId={busyId}
                              onLeave={() => leave(item)}
                              onOpenSubmit={() => setSubmitFor(item)}
                              fmtMoney={fmtMoney}
                           />
                        ))}
                     </div>
                  )}
               </section>
            </div>

            {/* ================= RIGHT SIDEBAR ================= */}
            <aside className={styles.side}>
               <div className={styles.card}>
                  <div className={styles.cardHeader}>Balances</div>
                  <div className={styles.balanceList}>
                     {loadingBalances ? (
                        <div className={styles.skeletonRow} />
                     ) : (
                        balances.map((b) => (
                           <Link
                              key={b.id}
                              href={b.href}
                              className={styles.balanceRow}
                           >
                              <div className={styles.balanceAvatar}>
                                 {b.avatar}
                              </div>
                              <div className={styles.balanceName}>{b.name}</div>
                              <div className={styles.balanceAmount}>
                                 {fmtMoney(b.amount)}
                              </div>
                              <ChevronRight
                                 size={14}
                                 className={styles.balanceChev}
                              />
                           </Link>
                        ))
                     )}
                  </div>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardHeader}>
                     <span>Pulse</span>
                     <span className={styles.pulseDot} />
                  </div>
                  <div className={styles.pulseList}>
                     {loadingPulse ? (
                        <>
                           <div className={styles.skeletonRow} />
                           <div className={styles.skeletonRow} />
                           <div className={styles.skeletonRow} />
                        </>
                     ) : pulse.length === 0 ? (
                        <div className={styles.emptySmall}>No activity yet</div>
                     ) : (
                        pulse.map((e) => (
                           <div key={e.id} className={styles.pulseRow}>
                              <div className={styles.pulseAvatar}>
                                 {e.actorAvatar || "?"}
                              </div>
                              <div className={styles.pulseInfo}>
                                 <div className={styles.pulseMessage}>
                                    <span className={styles.pulseName}>
                                       {e.actorName}
                                    </span>{" "}
                                    {e.amount > 0 ? (
                                       <>
                                          just made a{" "}
                                          <strong
                                             className={styles.pulseAmount}
                                          >
                                             {fmtMoney(e.amount)}
                                          </strong>{" "}
                                          sale
                                       </>
                                    ) : (
                                       e.message
                                    )}
                                 </div>
                                 <div className={styles.pulseMeta}>
                                    {e.businessName && (
                                       <>
                                          {e.businessName}
                                          {e.location && " · "}
                                       </>
                                    )}
                                    {e.location}
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </aside>
         </div>

         {/* Submit content modal */}
         {submitFor && (
            <SubmitContentModal
               isOpen={true}
               onClose={() => setSubmitFor(null)}
               campaignId={submitFor.campaign.id}
               campaignTitle={submitFor.campaign.title}
               onSubmitted={() => {
                  loadCampaigns();
                  setSubmitFor(null);
               }}
            />
         )}
      </div>
   );
}

// =========================================
// CAMPAIGN CONTROL CARD
// =========================================
function CampaignControlCard({
   item,
   busyId,
   onLeave,
   onOpenSubmit,
   fmtMoney,
}: {
   item: JoinedCampaign;
   busyId: string | null;
   onLeave: () => void;
   onOpenSubmit: () => void;
   fmtMoney: (n: number) => string;
}) {
   const pct =
      item.campaign.budget > 0
         ? Math.min(
              100,
              (item.campaign.budgetSpent / item.campaign.budget) * 100,
           )
         : 0;
   const isPending = item.status === "pending";
   const isApproved = item.status === "approved";
   const isRejected = item.status === "rejected";
   const busy = busyId === item.contributionId;

   return (
      <div className={styles.campaignCard}>
         <Link
            href={`/discover/${item.campaign.slug}`}
            className={styles.campaignLinkWrap}
         >
            <div className={styles.campaignCover}>
               {item.campaign.coverImage ? (
                  <img
                     src={item.campaign.coverImage}
                     alt={item.campaign.title}
                  />
               ) : (
                  <div className={styles.coverFallback}>🎬</div>
               )}

               {isPending && (
                  <span className={styles.statusPending}>
                     <Clock size={10} /> Pending
                  </span>
               )}
               {isApproved && (
                  <span className={styles.statusApproved}>
                     <Check size={10} /> Joined
                  </span>
               )}
               {isRejected && (
                  <span className={styles.statusRejected}>
                     <X size={10} /> Declined
                  </span>
               )}
            </div>

            <div className={styles.campaignBody}>
               <div className={styles.campaignBrand}>
                  {item.campaign.brandName}
               </div>
               <div className={styles.campaignTitle}>{item.campaign.title}</div>

               {isApproved && (
                  <>
                     <div className={styles.campaignStats}>
                        <div>
                           <div className={styles.statMiniLabel}>
                              Your views
                           </div>
                           <div className={styles.statMiniValue}>
                              {item.totalViews.toLocaleString()}
                           </div>
                        </div>
                        <div>
                           <div className={styles.statMiniLabel}>
                              Your earnings
                           </div>
                           <div className={styles.statMiniValueEarn}>
                              {fmtMoney(item.totalEarned)}
                           </div>
                        </div>
                     </div>

                     <div className={styles.progressTrack}>
                        <div
                           className={styles.progressFill}
                           style={{ width: `${pct}%` }}
                        />
                     </div>
                     <div className={styles.progressMeta}>
                        <span>
                           ${item.campaign.budgetSpent.toLocaleString()}
                        </span>
                        <span>${item.campaign.budget.toLocaleString()}</span>
                     </div>
                  </>
               )}

               {isPending && (
                  <div className={styles.pendingNote}>
                     Waiting for the business to review your request.
                  </div>
               )}

               {isRejected && item.reviewNote && (
                  <div className={styles.rejectedNote}>{item.reviewNote}</div>
               )}
            </div>
         </Link>

         <div className={styles.cardActions}>
            {isPending && (
               <button
                  className={styles.withdrawBtn}
                  onClick={onLeave}
                  disabled={busy}
               >
                  {busy ? "Withdrawing…" : "Withdraw"}
               </button>
            )}
            {isApproved && (
               <>
                  <button className={styles.submitBtn} onClick={onOpenSubmit}>
                     Submit content
                  </button>
                  <button
                     className={styles.withdrawBtn}
                     onClick={onLeave}
                     disabled={busy}
                  >
                     {busy ? "Leaving…" : "Leave"}
                  </button>
               </>
            )}
            {isRejected && (
               <Link
                  href={`/discover/${item.campaign.slug}`}
                  className={styles.retryBtn}
               >
                  Request again
               </Link>
            )}
         </div>
      </div>
   );
}

// =========================================
// SPARKLINE CHART
// =========================================
function BalanceChart() {
   const points = [
      22, 30, 26, 35, 28, 42, 38, 45, 50, 42, 48, 46, 44, 48, 52, 45, 42, 48,
      50, 55, 52, 48, 46, 50,
   ];
   const max = Math.max(...points);
   const min = Math.min(...points);
   const range = max - min || 1;
   const width = 800;
   const height = 100;

   const path = points
      .map((p, i) => {
         const x = (i / (points.length - 1)) * width;
         const y = height - ((p - min) / range) * height;
         return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

   return (
      <div className={styles.chartWrap}>
         <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={styles.chart}
         >
            <defs>
               <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
               </linearGradient>
            </defs>
            <path
               d={`${path} L ${width} ${height} L 0 ${height} Z`}
               fill="url(#chartFill)"
            />
            <path
               d={path}
               fill="none"
               stroke="rgba(255,255,255,0.35)"
               strokeWidth="1.5"
            />
         </svg>
      </div>
   );
}
