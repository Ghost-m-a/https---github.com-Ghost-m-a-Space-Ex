"use client";

import React from "react";
import { FileText, Info } from "lucide-react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const LegalTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const l = business.legal || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ legal: { ...l, [key]: value } });
   };

   const docs = [
      { key: "termsUrl", label: "Terms of Service" },
      { key: "privacyUrl", label: "Privacy policy" },
      { key: "returnUrl", label: "Return policy" },
      { key: "eulaUrl", label: "EULA" },
   ];

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Policy documents</h4>

            <div className={styles.listBox}>
               {docs.map((d) => (
                  <div key={d.key} className={styles.listItem}>
                     <FileText size={16} className={styles.listItemIcon} />
                     <div className={styles.listInfo}>
                        <div className={styles.listTitle}>{d.label}</div>
                        <div className={styles.listSub}>
                           {l[d.key]
                              ? "Document uploaded"
                              : "No document uploaded"}
                        </div>
                     </div>
                     <button className={styles.btnSecondarySmall}>
                        Upload PDF
                     </button>
                  </div>
               ))}
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Options</h4>

            <Toggle
               label="Require terms and conditions acceptance"
               sub="On checkout, users will be required to accept the terms and conditions"
               checked={!!l.requireTermsAcceptance}
               onChange={(v) => update("requireTermsAcceptance", v)}
            />

            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     VAT or tax ID{" "}
                     <Info size={12} style={{ display: "inline" }} />
                  </div>
                  <div className={styles.toggleSub}>
                     Your business&apos;s own tax ID. Used when your business
                     buys through Space-Ex, and shown on your withdrawal
                     invoices.
                  </div>
               </div>
               <div className={styles.configActions}>
                  <input
                     className={styles.inlineInput}
                     placeholder="Enter ID"
                     value={l.vatOrTaxId || ""}
                     onChange={(e) => update("vatOrTaxId", e.target.value)}
                  />
                  <button
                     className={styles.btnSecondarySmall}
                     onClick={() => update("vatOrTaxId", l.vatOrTaxId)}
                  >
                     ✓
                  </button>
               </div>
            </div>

            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Support contact details
                  </div>
                  <div className={styles.toggleSub}>
                     Address, name, and email
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>→</button>
            </div>
         </div>
      </div>
   );
};

export default LegalTab;
