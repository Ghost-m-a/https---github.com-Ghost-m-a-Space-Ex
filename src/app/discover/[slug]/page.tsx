"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Check, Loader2 } from "lucide-react";
import styles from "@/styles/pages/campaign.module.css";

interface Campaign {
   id: string;
   slug: string;
   title: string;
   subtitle: string;
   category: string;
   coverImage: string;
   brandName: string;
   brandAvatar: string;
   brandVerified: boolean;
   socials: string[];
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
   joined: boolean;
}

export default function CampaignDetailPage() {
   const params = useParams<{ slug: string }>();
   const router = useRouter();
   const [campaign, setCampaign] = useState<Campaign | null>(null);
   const [loading, setLoading] = useState(true);
   const [joining, setJoining] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (!params?.slug) return;
      (async () => {
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
      })();
   }, [params?.slug]);

   const handleJoin = async () => {
      if (!campaign || campaign.joined) return;
      setJoining(true);
      setError(null);
      try {
         const res = await fetch(
            `/api/discover/campaigns/${campaign.id}/join`,
            { method: "POST", credentials: "include" },
         );

         if (res.status === 401) {
            router.push(
               "/login?from=" +
                  encodeURIComponent(`/discover/${campaign.slug}`),
            );
            return;
         }

         const data = await res.json().catch(() => ({}));

         if (!res.ok) {
            // Show the real reason from the server
            setError(
               data?.error
                  ? `${data.error}${data.step ? ` (at: ${data.step})` : ""}`
                  : `Failed to join (${res.status})`,
            );
            return;
         }

         setCampaign((c) =>
            c ? { ...c, joined: true, joinedUsers: c.joinedUsers + 1 } : c,
         );
         router.refresh();
      } catch {
         setError("Network error");
      } finally {
         setJoining(false);
      }
   };

   if (loading) return <div className={styles.loading}>Loading campaign…</div>;
   if (error || !campaign)
      return <div className={styles.loading}>{error ?? "Not found"}</div>;

   const pct =
      campaign.budget > 0
         ? Math.min(100, (campaign.budgetSpent / campaign.budget) * 100)
         : 0;

   return (
      <div className={styles.page}>
         <Link href="/discover" className={styles.back}>
            <ChevronLeft size={16} /> Back to Discover
         </Link>

         {campaign.coverImage && (
            <img
               src={campaign.coverImage}
               alt={campaign.title}
               className={styles.cover}
            />
         )}

         <div className={styles.header}>
            <h1 className={styles.title}>{campaign.title}</h1>
            <div className={styles.brandRow}>
               <span className={styles.brandName}>{campaign.brandName}</span>
               {campaign.brandVerified && (
                  <span className={styles.verified}>✓</span>
               )}
               <span className={styles.dot}>·</span>
               <span>{campaign.category}</span>
            </div>
            <p className={styles.subtitle}>{campaign.subtitle}</p>
         </div>

         <div className={styles.stats}>
            <div className={styles.stat}>
               <div className={styles.statValue}>${campaign.cpm}/1k</div>
               <div className={styles.statLabel}>CPM</div>
            </div>
            <div className={styles.stat}>
               <div className={styles.statValue}>
                  ${campaign.budget.toLocaleString()}
               </div>
               <div className={styles.statLabel}>Budget</div>
            </div>
            <div className={styles.stat}>
               <div className={styles.statValue}>
                  <Users size={14} /> {campaign.joinedUsers}
               </div>
               <div className={styles.statLabel}>Creators</div>
            </div>
            <div className={styles.stat}>
               <div className={styles.statValue}>{campaign.duration}</div>
               <div className={styles.statLabel}>Duration</div>
            </div>
         </div>

         <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
         </div>
         <div className={styles.progressMeta}>
            <span>${campaign.budgetSpent.toLocaleString()} spent</span>
            <span>${campaign.budgetRemaining.toLocaleString()} remaining</span>
         </div>

         {campaign.summary && (
            <section className={styles.section}>
               <h2>About this campaign</h2>
               <p>{campaign.summary}</p>
            </section>
         )}

         {campaign.requirements.length > 0 && (
            <section className={styles.section}>
               <h2>Requirements</h2>
               <ul>
                  {campaign.requirements.map((r, i) => (
                     <li key={i}>{r}</li>
                  ))}
               </ul>
            </section>
         )}

         {campaign.instructions.length > 0 && (
            <section className={styles.section}>
               <h2>Instructions</h2>
               <ul>
                  {campaign.instructions.map((r, i) => (
                     <li key={i}>{r}</li>
                  ))}
               </ul>
            </section>
         )}

         <button
            className={`${styles.joinBtn} ${
               campaign.joined ? styles.joined : ""
            }`}
            onClick={handleJoin}
            disabled={joining || campaign.joined}
         >
            {campaign.joined ? (
               <>
                  <Check size={16} /> Joined
               </>
            ) : joining ? (
               <>
                  <Loader2 size={16} className={styles.spin} /> Joining…
               </>
            ) : (
               "Join campaign"
            )}
         </button>
      </div>
   );
}
