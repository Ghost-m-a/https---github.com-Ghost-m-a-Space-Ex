"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
   onClose: () => void;
}

const GeneralTab: React.FC<Props> = ({ business, updateBusiness, onClose }) => {
   const [name, setName] = useState(business.name || "");
   const [description, setDescription] = useState(business.description || "");
   const [saving, setSaving] = useState(false);

   const handleSave = async () => {
      setSaving(true);
      await updateBusiness({ name, description });
      setSaving(false);
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Business</h4>
            <p className={styles.sectionSubtitle}>
               Changes here will update your business details on all pages.
            </p>

            <div className={styles.logoRow}>
               <div className={styles.businessLogo}>
                  {(name || "B").charAt(0).toUpperCase()}
               </div>
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
      </div>
   );
};

export default GeneralTab;
