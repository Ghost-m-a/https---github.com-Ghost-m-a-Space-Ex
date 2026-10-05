"use client";

import React from "react";
import { Upload } from "lucide-react";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const OpenGraphTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const o = business.openGraph || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ openGraph: { ...o, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <p className={styles.sectionSubtitle}>
            Upload your own open graph image to promote your business. We
            recommend using 1200x630 resolution.
         </p>

         <div className={styles.ogLayout}>
            <div className={styles.ogPreview}>
               <div className={styles.ogCard}>
                  <div className={styles.ogLeft}>
                     <div className={styles.ogBrand}>
                        <div className={styles.ogBrandIcon}>
                           {business.name?.[0] || "S"}
                        </div>
                        <span>{business.name}</span>
                     </div>
                     <div className={styles.ogTitle}>
                        Providing everyone a sustainable income on the internet.
                     </div>
                     <div className={styles.ogFooter}>Space-Ex</div>
                  </div>
                  <div className={styles.ogRight}>
                     <div className={styles.ogImagePlaceholder} />
                  </div>
               </div>

               <div className={styles.ogColors}>
                  <div
                     className={styles.ogColor}
                     style={{ background: "#3b82f6" }}
                  />
                  <div
                     className={styles.ogColor}
                     style={{ background: "#000" }}
                  />
                  <div
                     className={styles.ogColor}
                     style={{ background: "#ef4444" }}
                  />
               </div>

               <label className={styles.checkboxRow}>
                  <input
                     type="checkbox"
                     checked={!!o.useLogoAsFallback}
                     onChange={(e) =>
                        update("useLogoAsFallback", e.target.checked)
                     }
                  />
                  Use logo as fallback graph image
               </label>
            </div>

            <div className={styles.ogUpload}>
               <button className={styles.btnSecondarySmall}>
                  <Upload size={14} /> Upload media
               </button>
               <div className={styles.ogUploadHint}>
                  We recommend using 1200x630 resolution
               </div>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Use media via URL</h4>
            <p className={styles.sectionSubtitle}>
               Upload your own media in case you have social assets.
            </p>

            <div className={styles.fieldStack}>
               <label className={styles.fieldLabel}>URL</label>
               <div className={styles.inputWithButton}>
                  <input
                     className={styles.fieldInput}
                     placeholder="URL"
                     value={o.mediaUrl || ""}
                     onChange={(e) => update("mediaUrl", e.target.value)}
                  />
                  <button className={styles.btnSecondarySmall}>Save URL</button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OpenGraphTab;
