"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const PIXELS = [
   { key: "spaceExPixel", name: "Space-Ex Pixel", color: "#3b82f6" },
   { key: "googleAnalytics", name: "Google Analytics", color: "#f59e0b" },
   { key: "hyros", name: "Hyros", color: "#6b7280" },
   { key: "meta", name: "Meta", color: "#1877F2" },
   { key: "tiktok", name: "TikTok", color: "#000" },
   { key: "x", name: "X", color: "#000" },
   { key: "reddit", name: "Reddit", color: "#FF4500" },
   { key: "pinterest", name: "Pinterest", color: "#E60023" },
   { key: "hubspot", name: "Hubspot", color: "#FF7A59" },
];

const AnalyticsTab: React.FC<Props> = ({ business }) => {
   const pixels = business?.analyticsPixels || {};

   return (
      <div className={styles.tabContent}>
         <div className={styles.listBox}>
            {PIXELS.map((p) => (
               <button key={p.key} className={styles.pixelRow}>
                  <div
                     className={styles.pixelIcon}
                     style={{ backgroundColor: p.color }}
                  >
                     {p.name[0]}
                  </div>
                  <div className={styles.pixelInfo}>
                     <div className={styles.pixelName}>{p.name}</div>
                     <div className={styles.pixelStatus}>
                        {pixels[p.key]
                           ? "Pixel is active"
                           : "Pixel is inactive"}
                     </div>
                  </div>
                  <ChevronRight size={16} className={styles.pixelChevron} />
               </button>
            ))}
         </div>
      </div>
   );
};

export default AnalyticsTab;
