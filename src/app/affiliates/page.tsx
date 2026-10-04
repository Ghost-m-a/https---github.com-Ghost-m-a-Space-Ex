"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, HelpCircle } from "lucide-react";
import { AffiliateProduct } from "../lib/types";
import styles from "./affiliates.module.css";

export default function AffiliatesPage() {
   const [products, setProducts] = useState<AffiliateProduct[]>([]);
   const [tab, setTab] = useState<"dashboard" | "refer-buyers">("dashboard");

   useEffect(() => {
      fetch("/api/affiliates")
         .then((r) => r.json())
         .then((d) => setProducts(d.products));
   }, []);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <div>
               <div className={styles.title}>Affiliates</div>
               <div className={styles.tabs}>
                  <button
                     className={`${styles.tab} ${tab === "dashboard" ? styles.tabActive : ""}`}
                     onClick={() => setTab("dashboard")}
                  >
                     Dashboard
                  </button>
                  <button
                     className={`${styles.tab} ${tab === "refer-buyers" ? styles.tabActive : ""}`}
                     onClick={() => setTab("refer-buyers")}
                  >
                     Refer buyers
                  </button>
               </div>
            </div>
            <button className={styles.helpBtn}>
               <HelpCircle size={18} />
            </button>
         </div>

         <div className={styles.emptyState}>
            <div className={styles.megaphone}>📣</div>
            <div className={styles.emptyTitle}>
               You are not promoting any products yet
            </div>
            <div className={styles.emptySubtitle}>
               Browse the marketplace to find products to promote.
            </div>
            <button className={styles.browseBtn}>Browse products</button>
         </div>

         <div className={styles.productsGrid}>
            {products.map((p) => (
               <div key={p.id} className={styles.productCard}>
                  <div className={styles.productIcon}>{p.image}</div>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productCategory}>{p.category}</div>
                  <div className={styles.productStats}>
                     <div className={styles.productCommission}>
                        <div className={styles.commissionValue}>
                           {p.commission}%
                        </div>
                        <div className={styles.commissionLabel}>Commission</div>
                     </div>
                     <div className={styles.productEpc}>
                        <div className={styles.epcValue}>
                           ${p.epc.toFixed(2)}
                        </div>
                        <div className={styles.epcLabel}>EPC</div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
