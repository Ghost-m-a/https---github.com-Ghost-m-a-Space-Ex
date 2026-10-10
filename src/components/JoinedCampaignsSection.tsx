"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import styles from "./JoinedCampaignsSection.module.css";

interface JoinedCampaign {
   signupId: string;
   signedUpAt: string;
   totalViews: number;
   totalEarned: number;
   status: string;
   campaign: {
      id: string;
      slug: string;
      title: string;
      coverImage: string;
      brandName: string;
      category: string;
      cpm: number;
      budget: number;
      budgetSpent: number;
   };
}

export default function JoinedCampaignsSection() {
   const [items, setItems] = useState<JoinedCampaign[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      (async () => {
         try {
            const res = await fetch("/api/user/campaigns", {
               credentials: "include",
            });
            const data = await res.json();
            setItems(data.campaigns ?? []);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   if (loading) {
      return (
         <div className={styles.wrap}>
            <div className={styles.header}>
               <h2 className={styles.title}>My Campaigns</h2>
            </div>
            <div className={styles.empty}>Loading…</div>
         </div>
      );
   }

   if (items.length === 0) {
      return (
         <div className={styles.wrap}>
            <div className={styles.header}>
               <h2 className={styles.title}>My Campaigns</h2>
               <Link href="/discover" className={styles.browseLink}>
                  Browse campaigns →
               </Link>
            </div>
            <div className={styles.empty}>
               <Compass size={32} />
               <p>You haven't joined any campaigns yet.</p>
               <Link href="/discover" className={styles.emptyCta}>
                  Explore Discover
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.wrap}>
         <div className={styles.header}>
            <h2 className={styles.title}>My Campaigns</h2>
            <span className={styles.count}>{items.length} joined</span>
         </div>

         <div className={styles.grid}>
            {items.map((item) => (
               <Link
                  key={item.signupId}
                  href={`/discover/${item.campaign.slug}`}
                  className={styles.card}
               >
                  <div className={styles.cover}>
                     {item.campaign.coverImage ? (
                        <img
                           src={item.campaign.coverImage}
                           alt={item.campaign.title}
                           className={styles.coverImg}
                        />
                     ) : (
                        <div className={styles.coverFallback}>🎬</div>
                     )}
                     <span className={styles.joinedBadge}>Joined</span>
                  </div>
                  <div className={styles.body}>
                     <div className={styles.brand}>
                        {item.campaign.brandName}
                     </div>
                     <div className={styles.cardTitle}>
                        {item.campaign.title}
                     </div>
                     <div className={styles.meta}>
                        <span>${item.campaign.cpm}/1k</span>
                        <span className={styles.dot}>·</span>
                        <span>
                           {new Date(item.signedUpAt).toLocaleDateString()}
                        </span>
                     </div>
                     <div className={styles.earnings}>
                        <div>
                           <span className={styles.earnValue}>
                              ${item.totalEarned.toFixed(2)}
                           </span>
                           <span className={styles.earnLabel}>earned</span>
                        </div>
                        <div>
                           <span className={styles.earnValue}>
                              {item.totalViews.toLocaleString()}
                           </span>
                           <span className={styles.earnLabel}>views</span>
                        </div>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
}
