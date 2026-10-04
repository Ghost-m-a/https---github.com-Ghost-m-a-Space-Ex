"use client";

import React, { useEffect, useState } from "react";
import {
   Plus,
   Mic,
   ArrowUp,
   Star,
   Users,
   Eye,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import { DiscoveredBusiness } from "../lib/types";
import styles from "./discover.module.css";

export default function DiscoverPage() {
   const [businesses, setBusinesses] = useState<DiscoveredBusiness[]>([]);
   const [prompt, setPrompt] = useState("");
   const [tab, setTab] = useState<"launch" | "discover">("launch");

   useEffect(() => {
      fetch("/api/discover")
         .then((r) => r.json())
         .then((d) => setBusinesses(d.businesses));
   }, []);

   return (
      <div className={styles.page}>
         {/* Hero */}
         <div className={styles.hero}>
            <div className={styles.heroTabs}>
               <button
                  className={`${styles.heroTab} ${tab === "launch" ? styles.heroTabActive : ""}`}
                  onClick={() => setTab("launch")}
               >
                  Launch
               </button>
               <button
                  className={`${styles.heroTab} ${tab === "discover" ? styles.heroTabActive : ""}`}
                  onClick={() => setTab("discover")}
               >
                  Discover
               </button>
            </div>

            <h1 className={styles.heroTitle}>
               Where the internet
               <br />
               does business.
            </h1>
            <p className={styles.heroSubtitle}>
               Build your business and get discovered by
               <br />
               over 21M+ customers on Whop.
            </p>

            <div className={styles.promptBox}>
               <button className={styles.promptIcon}>
                  <Plus size={18} />
               </button>
               <input
                  className={styles.promptInput}
                  placeholder=""
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
               />
               <button className={styles.promptIcon}>
                  <Mic size={18} />
               </button>
               <button className={styles.promptSubmit}>
                  <ArrowUp size={18} />
               </button>
            </div>

            <div className={styles.heroStats}>
               <span>
                  <strong>$5,499,254,040</strong> earned
               </span>
               <span className={styles.dot}>·</span>
               <span>
                  <strong>37,949,085</strong> users
               </span>
               <span className={styles.dot}>·</span>
               <span>
                  <strong>4,680,435</strong> businesses
               </span>
            </div>
         </div>

         {/* Getting Started Cards */}
         <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Getting started</h2>
            <div className={styles.promoGrid}>
               <div className={`${styles.promoCard} ${styles.promoOrange}`}>
                  <div className={styles.promoLabel}>Clipping</div>
                  <div className={styles.promoBig}>Content Rewards</div>
                  <div className={styles.promoSub}>
                     Get paid to create content for top brands
                  </div>
               </div>
               <div className={`${styles.promoCard} ${styles.promoGray}`}>
                  <div className={styles.promoLabel}>Whop University</div>
                  <div className={styles.promoBig}>
                     Learn how to build and grow on Whop
                  </div>
               </div>
            </div>
         </section>

         {/* Verified Businesses */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h2 className={styles.sectionTitle}>Verified businesses</h2>
               <div className={styles.pagination}>
                  <button className={styles.pageBtn}>
                     <ChevronLeft size={16} />
                  </button>
                  <button className={styles.pageBtn}>
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>
            <div className={styles.businessGrid}>
               {businesses.map((b) => (
                  <div key={b.id} className={styles.businessCard}>
                     <div className={styles.businessImage}>{b.image}</div>
                     <div className={styles.businessInfo}>
                        <div className={styles.businessName}>
                           {b.name}{" "}
                           {b.verified && (
                              <span className={styles.verified}>✓</span>
                           )}
                        </div>
                        <div className={styles.businessDesc}>
                           {b.description}
                        </div>
                        <div className={styles.businessStats}>
                           <span>
                              <Star size={12} /> {b.rating}
                           </span>
                           <span>
                              <Users size={12} /> {b.users.toLocaleString()}
                           </span>
                           <span>
                              <Eye size={12} /> {b.views.toLocaleString()}
                           </span>
                           <span className={styles.launched}>
                              Launched {b.launchedAgo}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}
