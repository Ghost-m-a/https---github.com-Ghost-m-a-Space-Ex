"use client";

import React from "react";
import { Plus } from "lucide-react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const TaxTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const t = business.tax || {};

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>Tax collection</div>
                  <div className={styles.toggleSub}>
                     Choose how tax is handled on your sales
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>
                  Space-Ex collects and remits →
               </button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Business address</h4>
            <button className={styles.btnSecondaryOutline}>
               <Plus size={14} /> Add business address
            </button>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Tax registrations</h4>
            <button className={styles.btnSecondaryOutline}>
               <Plus size={14} /> Add another registration
            </button>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Checkout</h4>
            <Toggle
               label="Collect VAT IDs from users"
               sub="On checkout, users will be able to input their VAT ID"
               checked={!!t.collectVatFromUsers}
               onChange={(v) =>
                  updateBusiness({ tax: { ...t, collectVatFromUsers: v } })
               }
            />
         </div>
      </div>
   );
};

export default TaxTab;
