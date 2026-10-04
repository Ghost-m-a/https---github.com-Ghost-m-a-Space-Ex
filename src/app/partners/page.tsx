"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Link2, CheckCircle2 } from "lucide-react";
import { Referral } from "../lib/types";
import styles from "./partners.module.css";

export default function PartnersPage() {
   const [referrals, setReferrals] = useState<Referral[]>([]);
   const [search, setSearch] = useState("");
   const [tab, setTab] = useState<"businesses" | "users">("businesses");

   useEffect(() => {
      fetch("/api/partners")
         .then((r) => r.json())
         .then((d) => setReferrals(d.referrals));
   }, []);

   const filtered = referrals.filter((r) =>
      r.business.toLowerCase().includes(search.toLowerCase()),
   );

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <div className={styles.earningsLabel}>Total earnings</div>
               <div className={styles.earningsValue}>$0.00</div>
            </div>
            <div className={styles.headerControls}>
               <button className={styles.dropdown}>Earnings ▼</button>
               <button className={styles.dropdown}>Per period ▼</button>
               <button className={styles.dropdown}>Weekly ▼</button>
            </div>
         </div>

         <div className={styles.chartPlaceholder}>
            <svg
               viewBox="0 0 800 200"
               className={styles.growthChart}
               preserveAspectRatio="none"
            >
               <path
                  d="M0,200 Q400,200 800,20 L800,200 Z"
                  fill="rgba(255,255,255,0.03)"
               />
               <path
                  d="M0,200 Q400,200 800,20"
                  fill="none"
                  stroke="#555"
                  strokeWidth="1.5"
               />
            </svg>
         </div>

         <div className={styles.referralsHeader}>
            <div className={styles.sectionTitle}>Your referrals</div>
            <div className={styles.tabSwitch}>
               <button
                  className={`${styles.tab} ${tab === "businesses" ? styles.tabActive : ""}`}
                  onClick={() => setTab("businesses")}
               >
                  Businesses
               </button>
               <button
                  className={`${styles.tab} ${tab === "users" ? styles.tabActive : ""}`}
                  onClick={() => setTab("users")}
               >
                  Users
               </button>
            </div>
         </div>

         <div className={styles.searchBar}>
            <Search size={16} />
            <input
               placeholder="Search businesses"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className={styles.table}>
            <div className={styles.tableHead}>
               <div>Business</div>
               <div>Volume (30d) ↓</div>
               <div>Your earnings</div>
               <div>Referred user</div>
               <div>Joined on</div>
            </div>
            {filtered.length === 0 ? (
               <div className={styles.tableEmpty}>
                  Refer businesses and see their performance here.
               </div>
            ) : (
               filtered.map((r) => (
                  <div key={r.id} className={styles.tableRow}>
                     <div>{r.business}</div>
                     <div>${r.volume.toLocaleString()}</div>
                     <div>${r.earnings.toLocaleString()}</div>
                     <div>{r.referredUser}</div>
                     <div>{r.joinedOn}</div>
                  </div>
               ))
            )}
         </div>

         <div className={styles.partnerCard}>
            <div className={styles.partnerHeader}>
               <div className={styles.partnerAvatar}>DZ</div>
               <div>
                  <div className={styles.partnerName}>Dr. Zakarinović</div>
                  <div className={styles.partnerRole}>Whop Partner</div>
               </div>
            </div>
            <div className={styles.statsRow}>
               <div>
                  <div className={styles.statValue}>$0</div>
                  <div className={styles.statLabel}>Total earned</div>
               </div>
               <div>
                  <div className={styles.statValue}>—</div>
                  <div className={styles.statLabel}>Last 30 days</div>
               </div>
            </div>
            <div className={styles.actionRow}>
               <button className={styles.primaryAction}>
                  <Mail size={16} /> Email invite
               </button>
               <button className={styles.secondaryAction}>
                  <Link2 size={16} /> Links
               </button>
            </div>
         </div>

         <div className={styles.verifiedCard}>
            <div className={styles.verifiedTitle}>
               Become a Verified Partner
            </div>
            <ul className={styles.verifiedList}>
               <li>
                  <CheckCircle2 size={16} /> Adjust fees for your referred
                  businesses
               </li>
               <li>
                  <CheckCircle2 size={16} /> Attribute your deals without a
                  referral link
               </li>
               <li>
                  <CheckCircle2 size={16} /> Join a private network of other
                  Verified Partners
               </li>
            </ul>
            <button className={styles.enrollBtn}>Enroll</button>
         </div>
      </div>
   );
}
