"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, Star, X } from "lucide-react";
import { Suspense } from "react";
import styles from "./app-store.module.css";

const CATEGORIES = [
   { key: "all", label: "All" },
   { key: "ecommerce", label: "E-commerce & Shopping" },
   { key: "business", label: "Business & Productivity" },
   { key: "ai", label: "AI" },
   { key: "sales-crm", label: "Sales & CRM" },
   { key: "marketing", label: "Marketing & Growth" },
   { key: "finance", label: "Finance & Payments" },
   { key: "support", label: "Customer Support & Agents" },
];

function AppStoreInner() {
   const params = useSearchParams();
   const [category, setCategory] = useState(params.get("category") || "all");
   const [search, setSearch] = useState("");
   const [sort, setSort] = useState("most_weekly");
   const [showSortMenu, setShowSortMenu] = useState(false);
   const [apps, setApps] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const p = new URLSearchParams();
         if (category && category !== "all") p.set("category", category);
         if (search) p.set("q", search);
         if (sort) p.set("sort", sort);
         const res = await fetch(`/api/app-store?${p}`);
         const d = await res.json();
         setApps(d.apps || []);
      } finally {
         setLoading(false);
      }
   }, [category, search, sort]);

   useEffect(() => {
      load();
   }, [load]);

   const install = async (slug: string) => {
      await fetch("/api/app-store", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ slug }),
      });
      setApps((prev) =>
         prev.map((a) =>
            a.slug === slug ? { ...a, installed: !a.installed } : a,
         ),
      );
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>App store</h1>
            <div className={styles.headerRight}>
               <div className={styles.searchWrap}>
                  <Search size={14} />
                  <input
                     className={styles.searchInput}
                     placeholder="Search apps..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <div className={styles.sortWrap}>
                  <button
                     className={styles.sortBtn}
                     onClick={() => setShowSortMenu((v) => !v)}
                  >
                     {sort === "most_weekly" && "Most weekly installs"}
                     {sort === "most_addicting" && "Most addicting"}
                     {sort === "newest" && "Newest"}
                     <ChevronDown size={14} />
                  </button>
                  {showSortMenu && (
                     <div
                        className={styles.sortMenu}
                        onMouseLeave={() => setShowSortMenu(false)}
                     >
                        {[
                           {
                              key: "most_weekly",
                              label: "Most weekly installs",
                           },
                           { key: "most_addicting", label: "Most addicting" },
                           { key: "newest", label: "Newest" },
                        ].map((s) => (
                           <button
                              key={s.key}
                              className={styles.sortItem}
                              onClick={() => {
                                 setSort(s.key);
                                 setShowSortMenu(false);
                              }}
                           >
                              {sort === s.key && "✓ "}
                              {s.label}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className={styles.categories}>
            {CATEGORIES.map((c) => (
               <button
                  key={c.key}
                  className={`${styles.categoryTab} ${category === c.key ? styles.categoryTabActive : ""}`}
                  onClick={() => setCategory(c.key)}
               >
                  {c.label}
               </button>
            ))}
         </div>

         {loading ? (
            <div className={styles.loading}>Loading apps...</div>
         ) : apps.length === 0 ? (
            <div className={styles.empty}>
               <div className={styles.emptyIcon}>🎓</div>
               <div className={styles.emptyTitle}>
                  No apps yet in this category
               </div>
            </div>
         ) : (
            <div className={styles.grid}>
               {apps.map((a) => (
                  <div key={a.id} className={styles.appCard}>
                     <div className={styles.appHeader}>
                        <div
                           className={styles.appIcon}
                           style={{ background: a.iconColor }}
                        >
                           {a.iconEmoji}
                        </div>
                        <div className={styles.appInfo}>
                           <div className={styles.appName}>{a.name}</div>
                           <div className={styles.appTagline}>{a.tagline}</div>
                           <div className={styles.appRating}>
                              <Star size={11} fill="#eab308" stroke="none" />
                              <span>
                                 {a.rating} · {a.reviewCount}
                              </span>
                           </div>
                        </div>
                        <button
                           className={`${styles.addBtn} ${a.installed ? styles.addBtnInstalled : ""}`}
                           onClick={() => install(a.slug)}
                        >
                           {a.installed ? "Installed" : "Add"}
                        </button>
                     </div>
                     <div
                        className={styles.appPreview}
                        style={{
                           background: `linear-gradient(135deg, ${a.iconColor}30, ${a.iconColor}10)`,
                        }}
                     >
                        <div className={styles.appPreviewEmoji}>
                           {a.iconEmoji}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

export default function AppStorePage() {
   return (
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
         <AppStoreInner />
      </Suspense>
   );
}
