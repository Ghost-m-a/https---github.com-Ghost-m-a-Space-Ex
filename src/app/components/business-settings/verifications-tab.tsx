"use client";

import React from "react";
import { Info, DollarSign, CreditCard, Landmark, Sparkles } from "lucide-react";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const VerificationsTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const v = business?.verification || {};

   const start = (kind: string) => {
      updateBusiness({ verification: { ...v, [kind]: "pending" } });
   };

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

            <div className={styles.rowCard}>
               <div className={styles.rowCardLeft}>
                  <Info size={16} />
                  <span>Individual verification</span>
               </div>
               <button
                  className={styles.btnPrimary}
                  onClick={() => start("individual")}
               >
                  Get verified
               </button>
            </div>

            <div className={styles.rowCard}>
               <div className={styles.rowCardLeft}>
                  <Info size={16} />
                  <span>Business verification</span>
               </div>
               <button
                  className={styles.btnPrimary}
                  onClick={() => start("business")}
               >
                  Get verified
               </button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Capabilities</h4>

            {[
               {
                  key: "payouts",
                  label: "Payouts",
                  sub: "Verify your identity to unlock",
                  icon: <DollarSign size={16} />,
               },
               {
                  key: "spaceExCard",
                  label: "Space-Ex Card",
                  sub: "Verify your identity to unlock",
                  icon: <CreditCard size={16} />,
               },
               {
                  key: "bankDeposits",
                  label: "Bank deposits",
                  sub: "Verify your identity to unlock",
                  icon: <Landmark size={16} />,
               },
               {
                  key: "financing",
                  label: "Financing",
                  sub: "Apply for financing to unlock",
                  icon: <Sparkles size={16} />,
               },
            ].map((cap) => (
               <div key={cap.key} className={styles.rowCard}>
                  <div className={styles.rowCardLeft}>
                     {cap.icon}
                     <div>
                        <div className={styles.toggleLabel}>{cap.label}</div>
                        <div className={styles.toggleSub}>{cap.sub}</div>
                     </div>
                  </div>
                  <span className={styles.badgeMuted}>
                     {v[cap.key] === "active" ? "Active" : "Inactive"}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
};

export default VerificationsTab;
