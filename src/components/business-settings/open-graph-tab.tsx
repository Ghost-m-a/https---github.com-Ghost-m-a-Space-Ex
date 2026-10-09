"use client";

import React from "react";
import { Upload } from "lucide-react";
import styles from "@/styles/components/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const OpenGraphTab: React.FC<Props> = ({ business }) => (
   <div className={styles.tabContent}>
      <p className={styles.sectionSubtitle}>
         Upload your own open graph image to promote your business. We recommend
         using 1200x630 resolution.
      </p>

      <div className={styles.ogLayout}>
         <div className={styles.ogPreview}>
            <div className={styles.ogCard}>
               <div className={styles.ogLeft}>
                  <div className={styles.ogBrand}>
                     <div className={styles.ogBrandIcon}>
                        {business?.name?.[0] || "S"}
                     </div>
                     <span>{business?.name}</span>
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
   </div>
);

export default OpenGraphTab;
