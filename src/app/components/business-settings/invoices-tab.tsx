"use client";

import React from "react";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const InvoicesTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const i = business.invoices || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ invoices: { ...i, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.listBox}>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Custom invoice prefix
                  </div>
                  <div className={styles.toggleSub}>
                     Customize the characters that appear before an invoice
                     number
                  </div>
               </div>
               <div className={styles.configActions}>
                  <button className={styles.btnSecondarySmall}>
                     Configure
                  </button>
                  <button
                     className={`${styles.switch} ${i.customPrefixEnabled ? styles.switchOn : ""}`}
                     onClick={() =>
                        update("customPrefixEnabled", !i.customPrefixEnabled)
                     }
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default InvoicesTab;
