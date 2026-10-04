"use client";

import React, { useEffect, useState } from "react";
import { Plus, Snowflake, Play } from "lucide-react";
import { BusinessCard } from "../../lib/types";
import styles from "../business.module.css";

export default function CardsPage() {
   const [cards, setCards] = useState<BusinessCard[]>([]);

   const load = () =>
      fetch("/api/business/cards")
         .then((r) => r.json())
         .then((d) => setCards(d.cards));
   useEffect(() => {
      load();
   }, []);

   const toggle = async (id: string) => {
      await fetch("/api/business/cards", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id }),
      });
      load();
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Cards</h1>
            <button className={styles.primaryBtn}>
               <Plus size={16} /> Issue Card
            </button>
         </div>

         <div className={styles.cardGrid}>
            {cards.map((c) => (
               <div
                  key={c.id}
                  className={`${styles.creditCard} ${c.status === "frozen" ? styles.frozen : ""}`}
               >
                  <div className={styles.creditTop}>
                     <div className={styles.creditBrand}>{c.brand}</div>
                     <div
                        className={`${styles.status} ${c.status === "active" ? styles.succeeded : styles.pending}`}
                     >
                        {c.status}
                     </div>
                  </div>
                  <div className={styles.creditNumber}>
                     •••• •••• •••• {c.last4}
                  </div>
                  <div className={styles.creditBottom}>
                     <div>
                        <div className={styles.creditLabel}>Card Holder</div>
                        <div className={styles.creditValue}>{c.holder}</div>
                     </div>
                     <div>
                        <div className={styles.creditLabel}>Expires</div>
                        <div className={styles.creditValue}>{c.expiry}</div>
                     </div>
                  </div>
                  <div className={styles.creditBalance}>
                     <div>
                        <div className={styles.creditLabel}>Balance</div>
                        <div className={styles.creditBalanceValue}>
                           ${c.balance.toLocaleString()}
                        </div>
                     </div>
                     <button
                        className={styles.iconBtn}
                        onClick={() => toggle(c.id)}
                     >
                        {c.status === "active" ? (
                           <Snowflake size={16} />
                        ) : (
                           <Play size={16} />
                        )}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
