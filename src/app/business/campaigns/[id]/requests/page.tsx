"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
   ChevronLeft,
   Check,
   X,
   Loader2,
   User as UserIcon,
   Clock,
   CheckCircle2,
   XCircle,
} from "lucide-react";
import styles from "@/styles/pages/requests.module.css";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

interface RequestRow {
   id: string;
   userId: string;
   name: string;
   email: string;
   username: string;
   avatar: string;
   applicationMessage: string;
   status: "pending" | "approved" | "rejected";
   reviewNote: string;
   reviewedAt: string | null;
   signedUpAt: string;
   totalSubmissions: number;
}

export default function RequestsPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const [campaign, setCampaign] = useState<{
      id: string;
      title: string;
      slug: string;
      coverImage: string;
   } | null>(null);
   const [requests, setRequests] = useState<RequestRow[]>([]);
   const [status, setStatus] = useState<StatusFilter>("pending");
   const [loading, setLoading] = useState(true);
   const [busyId, setBusyId] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);

   const load = (s: StatusFilter) => {
      setLoading(true);
      fetch(`/api/business/campaigns/${params.id}/requests?status=${s}`, {
         credentials: "include",
      })
         .then((r) => r.json())
         .then((d) => {
            setCampaign(d.campaign ?? null);
            setRequests(d.requests ?? []);
         })
         .finally(() => setLoading(false));
   };

   useEffect(() => {
      if (params?.id) load(status);
   }, [params?.id, status]);

   const review = async (requestId: string, action: "approve" | "reject") => {
      setError(null);
      let note = "";
      if (action === "reject") {
         const input = window.prompt(
            "Optional note to the creator (why was it declined?)",
            "",
         );
         if (input === null) return;
         note = input;
      }

      setBusyId(requestId);
      try {
         const res = await fetch(
            `/api/business/campaigns/${params.id}/requests/${requestId}`,
            {
               method: "POST",
               credentials: "include",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ action, note }),
            },
         );
         const data = await res.json();
         if (!res.ok) {
            setError(data?.error ?? "Failed to review");
            return;
         }
         load(status);
      } finally {
         setBusyId(null);
      }
   };

   const fmtTime = (t: string) => {
      const diff = Date.now() - new Date(t).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return "just now";
      if (min < 60) return `${min}m ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      const days = Math.floor(hr / 24);
      return `${days}d ago`;
   };

   return (
      <div className={styles.page}>
         <div className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/campaigns")}
            >
               <ChevronLeft size={16} />
            </button>
            <div className={styles.crumbs}>
               <span className={styles.crumb}>Campaigns</span>
               <span className={styles.crumbSep}>›</span>
               <span className={styles.crumbActive}>
                  {campaign?.title ?? "Requests"}
               </span>
            </div>
         </div>

         <div className={styles.header}>
            <h1 className={styles.title}>Join requests</h1>
            <p className={styles.subtitle}>
               Review creators who want to join this campaign. Approve the ones
               whose content fits your brief.
            </p>
         </div>

         <div className={styles.tabs}>
            {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map(
               (s) => (
                  <button
                     key={s}
                     className={`${styles.tab} ${
                        status === s ? styles.tabActive : ""
                     }`}
                     onClick={() => setStatus(s)}
                  >
                     {s === "pending" && <Clock size={12} />}
                     {s === "approved" && <CheckCircle2 size={12} />}
                     {s === "rejected" && <XCircle size={12} />}
                     {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
               ),
            )}
         </div>

         {error && <div className={styles.errorBox}>{error}</div>}

         {loading ? (
            <div className={styles.loading}>Loading…</div>
         ) : requests.length === 0 ? (
            <div className={styles.emptyState}>
               <UserIcon size={32} />
               <div className={styles.emptyTitle}>
                  No {status === "all" ? "" : status} requests
               </div>
               <div className={styles.emptySub}>
                  {status === "pending"
                     ? "You're all caught up."
                     : "Nothing to show here yet."}
               </div>
            </div>
         ) : (
            <div className={styles.list}>
               {requests.map((r) => (
                  <div key={r.id} className={styles.card}>
                     <div className={styles.cardHead}>
                        <div className={styles.avatar}>
                           {r.avatar || r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.creatorInfo}>
                           <div className={styles.creatorName}>{r.name}</div>
                           <div className={styles.creatorMeta}>
                              {r.username && `@${r.username} · `}
                              {r.email}
                           </div>
                           <div className={styles.creatorStats}>
                              <span>{r.totalSubmissions} submissions</span>
                              <span className={styles.dot}>·</span>
                              <span>Requested {fmtTime(r.signedUpAt)}</span>
                           </div>
                        </div>
                        <div className={styles.cardBadge}>
                           {r.status === "pending" && (
                              <span className={styles.badgePending}>
                                 <Clock size={10} /> Pending
                              </span>
                           )}
                           {r.status === "approved" && (
                              <span className={styles.badgeApproved}>
                                 <Check size={10} /> Approved
                              </span>
                           )}
                           {r.status === "rejected" && (
                              <span className={styles.badgeRejected}>
                                 <X size={10} /> Declined
                              </span>
                           )}
                        </div>
                     </div>

                     {r.applicationMessage && (
                        <div className={styles.messageBox}>
                           <div className={styles.messageLabel}>
                              Application message
                           </div>
                           <div className={styles.messageText}>
                              {r.applicationMessage}
                           </div>
                        </div>
                     )}

                     {r.reviewNote && r.status !== "pending" && (
                        <div className={styles.noteBox}>
                           <strong>Your note:</strong> {r.reviewNote}
                        </div>
                     )}

                     {r.status === "pending" && (
                        <div className={styles.cardActions}>
                           <Link
                              href={`/discover/${campaign?.slug ?? ""}`}
                              className={styles.btnGhost}
                              target="_blank"
                           >
                              View campaign
                           </Link>
                           <div className={styles.actionsRight}>
                              <button
                                 className={styles.rejectBtn}
                                 onClick={() => review(r.id, "reject")}
                                 disabled={busyId === r.id}
                              >
                                 {busyId === r.id ? (
                                    <Loader2
                                       size={14}
                                       className={styles.spin}
                                    />
                                 ) : (
                                    <X size={14} />
                                 )}
                                 Decline
                              </button>
                              <button
                                 className={styles.approveBtn}
                                 onClick={() => review(r.id, "approve")}
                                 disabled={busyId === r.id}
                              >
                                 {busyId === r.id ? (
                                    <Loader2
                                       size={14}
                                       className={styles.spin}
                                    />
                                 ) : (
                                    <Check size={14} />
                                 )}
                                 Approve
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
