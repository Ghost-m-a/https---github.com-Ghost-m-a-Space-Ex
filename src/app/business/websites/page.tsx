"use client";

import React, { useEffect, useState } from "react";
import { Plus, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/websites.module.css";

interface Website {
   id: string;
   domain: string;
   name: string;
   status: "live" | "draft" | "building";
   visits: number;
   pageViews: number;
   checkouts: number;
}

interface Blueprint {
   id: string;
   name: string;
   category: string;
   usersCount: number;
   previewColors: string[];
   icon: string;
}

const BLUEPRINTS: Blueprint[] = [
   {
      id: "neobank",
      name: "Neobank",
      category: "Fintech",
      usersCount: 1344,
      previewColors: ["#1a1a1a", "#3b82f6"],
      icon: "🏦",
   },
   {
      id: "clothing",
      name: "Clothing Store",
      category: "E-commerce",
      usersCount: 6094,
      previewColors: ["#f5e6d3", "#8b6f47"],
      icon: "👕",
   },
   {
      id: "b2b-saas",
      name: "B2B SaaS",
      category: "Software",
      usersCount: 3333,
      previewColors: ["#0a0a0a", "#10b981"],
      icon: "💼",
   },
   {
      id: "pressure",
      name: "Pressure Washing Business",
      category: "Services",
      usersCount: 1264,
      previewColors: ["#ffffff", "#3b82f6"],
      icon: "💦",
   },
   {
      id: "merch",
      name: "Merchandise Store",
      category: "E-commerce",
      usersCount: 88,
      previewColors: ["#000", "#fff"],
      icon: "👚",
   },
   {
      id: "gym",
      name: "In-Person Gym",
      category: "Fitness",
      usersCount: 1421,
      previewColors: ["#1a1a1a", "#f59e0b"],
      icon: "🏋️",
   },
   {
      id: "trading",
      name: "Trading Course",
      category: "Education",
      usersCount: 916,
      previewColors: ["#0f172a", "#10b981"],
      icon: "📈",
   },
   {
      id: "marketplace",
      name: "Clothing Marketplace",
      category: "E-commerce",
      usersCount: 668,
      previewColors: ["#f5f5f5", "#000"],
      icon: "🛍️",
   },
];

export default function WebsitesPage() {
   const { activeBusiness } = useWorkspace();
   const [websites, setWebsites] = useState<Website[]>([]);
   const [loading, setLoading] = useState(true);
   const [creating, setCreating] = useState<string | null>(null);

   useEffect(() => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      fetch(`/api/business/websites?businessId=${activeBusiness.id}`)
         .then((r) => r.json())
         .then((d) => setWebsites(d.websites || []))
         .catch(() => setWebsites([]))
         .finally(() => setLoading(false));
   }, [activeBusiness?.id]);

   const createFromBlueprint = async (bp: Blueprint) => {
      if (!activeBusiness?.id) return;
      setCreating(bp.id);
      try {
         const slug = bp.name.toLowerCase().replace(/\s+/g, "-");
         const res = await fetch("/api/business/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               domain: `${slug}.space-ex.com`,
               name: bp.name,
               blueprintId: bp.id,
            }),
         });
         if (res.ok) {
            const data = await res.json();
            setWebsites((prev) => [...prev, data.website]);
         }
      } finally {
         setCreating(null);
      }
   };

   const formatNumber = (n: number) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
      return n.toString();
   };

   return (
      <div className={styles.page}>
         <h1 className={styles.title}>Websites</h1>

         {/* Hero */}
         <div className={styles.hero}>
            <div className={styles.heroLeft}>
               <h2 className={styles.heroTitle}>Big ideas deserve a home.</h2>
               <p className={styles.heroSub}>
                  Create something new, bring your existing site, or start with
                  a blueprint. Your next chapter starts here.
               </p>
               <button className={styles.heroBtn}>
                  <Plus size={16} /> New website
               </button>
            </div>
            <div className={styles.heroRight}>
               <div className={styles.heroMockup}>
                  <div className={styles.heroMockupHeader}>
                     <span>
                        Handmade teddy bears, built for a lifetime of hugs.
                     </span>
                  </div>
                  <div className={styles.heroMockupGrid}>
                     <div className={styles.heroMockupCard}>🧸 $29</div>
                     <div className={styles.heroMockupCard}>🐼 $44</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Existing websites */}
         {!loading && websites.length > 0 && (
            <section className={styles.section}>
               <h3 className={styles.sectionTitle}>Your websites</h3>
               <div className={styles.websitesGrid}>
                  {websites.map((w) => (
                     <div key={w.id} className={styles.websiteCard}>
                        <div className={styles.websiteHeader}>
                           <div className={styles.websiteDomain}>
                              {w.domain}
                           </div>
                           <span
                              className={`${styles.badge} ${styles[`badge_${w.status}`]}`}
                           >
                              {w.status}
                           </span>
                        </div>
                        <div className={styles.websiteName}>{w.name}</div>
                        <div className={styles.websiteStats}>
                           <div>
                              <div className={styles.statValue}>
                                 {formatNumber(w.visits)}
                              </div>
                              <div className={styles.statLabel}>Visits</div>
                           </div>
                           <div>
                              <div className={styles.statValue}>
                                 {formatNumber(w.pageViews)}
                              </div>
                              <div className={styles.statLabel}>Page views</div>
                           </div>
                           <div>
                              <div className={styles.statValue}>
                                 {w.checkouts}
                              </div>
                              <div className={styles.statLabel}>Checkouts</div>
                           </div>
                        </div>
                        <div className={styles.websiteActions}>
                           <button className={styles.ghostBtn}>
                              <ExternalLink size={14} /> Open
                           </button>
                           <button className={styles.iconGhostBtn}>
                              <ChevronRight size={16} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         )}

         {/* Blueprints */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h3 className={styles.sectionTitle}>Business blueprints</h3>
               <Link href="#" className={styles.exploreLink}>
                  Explore more <ChevronRight size={14} />
               </Link>
            </div>

            <div className={styles.blueprintsGrid}>
               {BLUEPRINTS.map((bp) => (
                  <button
                     key={bp.id}
                     className={styles.blueprintCard}
                     onClick={() => createFromBlueprint(bp)}
                     disabled={creating === bp.id}
                  >
                     <div
                        className={styles.blueprintPreview}
                        style={{
                           background: `linear-gradient(135deg, ${bp.previewColors[0]} 0%, ${bp.previewColors[1]} 100%)`,
                        }}
                     >
                        <div className={styles.blueprintMockContent}>
                           <div className={styles.blueprintMockIcon}>
                              {bp.icon}
                           </div>
                           <div className={styles.blueprintMockTitle}>
                              {bp.name}
                           </div>
                           <div className={styles.blueprintMockSub}>
                              Get started →
                           </div>
                        </div>
                     </div>
                     <div className={styles.blueprintInfo}>
                        <div className={styles.blueprintName}>{bp.name}</div>
                        <div className={styles.blueprintMeta}>
                           <span className={styles.blueprintDot} />
                           <span>
                              {formatNumber(bp.usersCount)} businesses use this
                           </span>
                        </div>
                     </div>
                     {creating === bp.id && (
                        <div className={styles.blueprintLoading}>
                           Creating...
                        </div>
                     )}
                  </button>
               ))}
            </div>
         </section>
      </div>
   );
}
