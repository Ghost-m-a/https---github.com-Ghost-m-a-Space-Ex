"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import styles from "@/styles/components/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
   onClose: () => void;
}

const GeneralTab: React.FC<Props> = ({ business, updateBusiness, onClose }) => {
   const [name, setName] = useState(business?.name || "");
   const [description, setDescription] = useState(business?.description || "");
   const [saving, setSaving] = useState(false);
   const [confirmDelete, setConfirmDelete] = useState(false);

   const handleSave = async () => {
      setSaving(true);
      await updateBusiness({ name, description });
      setSaving(false);
   };

   const handleDelete = async () => {
      const res = await fetch(`/api/business/settings?id=${business._id}`, {
         method: "DELETE",
      });
      if (res.ok) {
         onClose();
         window.location.reload();
      }
   };

   const initial = (name || "B").charAt(0).toUpperCase();

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Business</h4>
            <p className={styles.sectionSubtitle}>
               Changes here will update your business details on all pages.
            </p>

            <div className={styles.logoRow}>
               <div className={styles.businessLogo}>{initial}</div>
               <button className={styles.btnSecondarySmall}>
                  <Camera size={14} /> Change logo
               </button>
            </div>

            <div className={styles.fieldStack}>
               <label className={styles.fieldLabel}>Business name</label>
               <input
                  className={styles.fieldInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={150}
               />
               <div className={styles.fieldHint}>{name.length} / 150</div>
            </div>

            <div className={styles.fieldStack}>
               <label className={styles.fieldLabel}>Business description</label>
               <textarea
                  className={styles.fieldTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                  maxLength={400}
                  rows={4}
               />
               <div className={styles.fieldHint}>
                  {description.length} / 400
               </div>
            </div>

            <div className={styles.fieldStack}>
               <label className={styles.fieldLabel}>
                  Industry classification
               </label>
               <div className={styles.industryRow}>
                  <span className={styles.industryTag}>
                     Business type{" "}
                     <strong>
                        {business?.industry?.businessType || "Other"}
                     </strong>
                  </span>
                  <span className={styles.industryTag}>
                     Industry group{" "}
                     <strong>
                        {business?.industry?.industryGroup || "Miscellaneous"}
                     </strong>
                  </span>
                  <span className={styles.industryTag}>
                     Industry type{" "}
                     <strong>
                        {business?.industry?.industryType || "Other general"}
                     </strong>
                  </span>
               </div>
            </div>

            <div className={styles.saveRow}>
               <button
                  className={styles.btnPrimary}
                  onClick={handleSave}
                  disabled={saving}
               >
                  {saving ? "Saving..." : "Save changes"}
               </button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Danger zone</h4>

            <div className={styles.dangerRow}>
               <div>
                  <div className={styles.toggleLabel}>Delete business</div>
                  <div className={styles.toggleSub}>
                     This will permanently delete all payments, products and
                     customers.
                  </div>
               </div>
               {!confirmDelete ? (
                  <button
                     className={styles.btnDanger}
                     onClick={() => setConfirmDelete(true)}
                  >
                     Delete business
                  </button>
               ) : (
                  <div className={styles.confirmActions}>
                     <button
                        className={styles.btnSecondarySmall}
                        onClick={() => setConfirmDelete(false)}
                     >
                        Cancel
                     </button>
                     <button
                        className={styles.btnDanger}
                        onClick={handleDelete}
                     >
                        Yes, delete
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default GeneralTab;
