"use client";

import React, { useEffect, useState } from "react";
import { Info } from "lucide-react";
import styles from "@/styles/components/settings.module.css";

interface Verification {
   individual: string;
   business: string;
   payouts: string;
   bankDeposits: string;
}

const VerificationTab = () => {
   const [v, setV] = useState<Verification | null>(null);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => setV(d.user?.verification));
   }, []);

   const start = async (kind: "individual" | "business") => {
      if (!v) return;
      const next = { ...v, [kind]: "pending" };
      setV(next);
      await fetch("/api/user/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ verification: next }),
      });
   };

   if (!v) return <div className={styles.loading}>Loading...</div>;

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
               Identity and business verification
            </h4>
            <p className={styles.sectionSubtitle}>
               Review your status, continue an application, or start a new
               verification.
            </p>

            {[
               { key: "individual", label: "Individual verification" },
               { key: "business", label: "Business verification" },
            ].map((item) => {
               const status = v[item.key as keyof Verification];
               const statusLabel =
                  status === "verified"
                     ? "Verified"
                     : status === "pending"
                       ? "Pending"
                       : "Get verified";
               return (
                  <div key={item.key} className={styles.rowCard}>
                     <div className={styles.rowCardLeft}>
                        <Info size={16} />
                        <span>{item.label}</span>
                     </div>
                     <button
                        className={
                           status === "none"
                              ? styles.btnPrimary
                              : styles.btnSecondarySmall
                        }
                        onClick={() =>
                           start(item.key as "individual" | "business")
                        }
                        disabled={status !== "none"}
                     >
                        {statusLabel}
                     </button>
                  </div>
               );
            })}
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Capabilities</h4>
            {[
               {
                  key: "payouts",
                  label: "Payouts",
                  sub: "Verify your identity to unlock",
               },
               {
                  key: "bankDeposits",
                  label: "Bank deposits",
                  sub: "Verify your identity to unlock",
               },
            ].map((item) => {
               const status = v[item.key as keyof Verification];
               return (
                  <div key={item.key} className={styles.rowCard}>
                     <div className={styles.rowCardLeft}>
                        <div>
                           <div className={styles.toggleLabel}>
                              {item.label}
                           </div>
                           <div className={styles.toggleSub}>{item.sub}</div>
                        </div>
                     </div>
                     <span className={styles.badgeMuted}>
                        {status === "active" ? "Active" : "Inactive"}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default VerificationTab;
