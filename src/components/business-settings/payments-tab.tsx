"use client";

import React from "react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const PaymentsTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const p = business?.payments || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ payments: { ...p, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>3D Secure</h4>
            {[
               {
                  key: "mandate",
                  label: "Mandate challenge",
                  sub: "Require bank verification for fraud protection; may lower conversion.",
               },
               {
                  key: "if_required",
                  label: "Challenge if required",
                  sub: "Verify with the bank only when required.",
               },
               {
                  key: "frictionless",
                  label: "Frictionless",
                  sub: "Verify in the background when possible.",
               },
            ].map((opt) => (
               <button
                  key={opt.key}
                  className={`${styles.methodCard} ${
                     p.threeDSecure === opt.key ? styles.methodCardActive : ""
                  }`}
                  onClick={() => update("threeDSecure", opt.key)}
               >
                  <div className={styles.methodRadio}>
                     {p.threeDSecure === opt.key && (
                        <div className={styles.methodRadioDot} />
                     )}
                  </div>
                  <div>
                     <div className={styles.methodTitle}>{opt.label}</div>
                     <div className={styles.methodSub}>{opt.sub}</div>
                  </div>
               </button>
            ))}
         </div>

         <div className={styles.section}>
            <Toggle
               label="Dispute Fighter"
               sub="Space-Ex prepares and files each response for you."
               checked={!!p.disputeFighter}
               onChange={(v) => update("disputeFighter", v)}
            />
         </div>
      </div>
   );
};

export default PaymentsTab;
