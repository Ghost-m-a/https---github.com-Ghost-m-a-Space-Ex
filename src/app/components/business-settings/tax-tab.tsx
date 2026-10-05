"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const TaxTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const t = business.tax || {};
   const registrations = t.taxRegistrations || [];

   const update = (key: string, value: unknown) => {
      updateBusiness({ tax: { ...t, [key]: value } });
   };

   const addRegistration = () => {
      update("taxRegistrations", [...registrations, { idType: "", value: "" }]);
   };

   const removeRegistration = (index: number) => {
      update(
         "taxRegistrations",
         registrations.filter((_: unknown, i: number) => i !== index),
      );
   };

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
            <a className={styles.linkText} href="#">
               View your complete tax implications
            </a>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Business address</h4>
            <button className={styles.btnSecondaryOutline}>
               <Plus size={14} /> Add business address
            </button>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Tax registrations</h4>

            {registrations.map((reg: any, i: number) => (
               <div key={i} className={styles.taxRow}>
                  <select
                     className={styles.fieldSelect}
                     value={reg.idType}
                     onChange={(e) => {
                        const next = [...registrations];
                        next[i] = { ...next[i], idType: e.target.value };
                        update("taxRegistrations", next);
                     }}
                  >
                     <option value="">Tax ID type</option>
                     <option value="vat">VAT</option>
                     <option value="gst">GST</option>
                     <option value="sales_tax">Sales tax</option>
                     <option value="ein">EIN</option>
                  </select>
                  <input
                     className={styles.fieldInput}
                     value={reg.value}
                     onChange={(e) => {
                        const next = [...registrations];
                        next[i] = { ...next[i], value: e.target.value };
                        update("taxRegistrations", next);
                     }}
                  />
                  <button
                     className={styles.iconBtn}
                     onClick={() => removeRegistration(i)}
                  >
                     <Trash2 size={14} />
                  </button>
               </div>
            ))}

            <button
               className={styles.btnSecondaryOutline}
               onClick={addRegistration}
            >
               <Plus size={14} /> Add another registration
            </button>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Checkout</h4>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>Tax type</div>
                  <div className={styles.toggleSub}>Inclusive or exclusive</div>
               </div>
               <button className={styles.btnSecondarySmall}>
                  {t.taxType === "inclusive" ? "Inclusive" : "Exclusive"} →
               </button>
            </div>

            <Toggle
               label="Collect VAT IDs from users"
               sub="On checkout, users will be able to input their VAT ID"
               checked={!!t.collectVatFromUsers}
               onChange={(v) => update("collectVatFromUsers", v)}
            />
         </div>
      </div>
   );
};

export default TaxTab;
