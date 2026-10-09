"use client";

import React from "react";
import styles from "@/styles/components/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const CheckoutBrandingTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const b = business?.checkoutBranding || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ checkoutBranding: { ...b, [key]: value } });
   };

   const isDark = b.previewTheme !== "light";

   return (
      <div className={styles.brandingLayout}>
         <div className={styles.brandingControls}>
            <p className={styles.sectionSubtitle}>
               Customize the look and feel of your checkout page.
            </p>

            <div className={styles.brandingGroup}>
               <div className={styles.brandingGroupLabel}>Color</div>
               <div className={styles.brandingField}>
                  <span>Background</span>
                  <button className={styles.colorPicker}>
                     <span
                        className={styles.colorSwatch}
                        style={{ background: b.backgroundColor || "#000" }}
                     />
                     Default
                  </button>
               </div>
               <div className={styles.brandingField}>
                  <span>Button</span>
                  <button className={styles.colorPicker}>
                     <span
                        className={styles.colorSwatch}
                        style={{ background: b.buttonColor || "#fff" }}
                     />
                     Default
                  </button>
               </div>
            </div>

            <div className={styles.brandingGroup}>
               <div className={styles.brandingGroupLabel}>Typography</div>
               <div className={styles.brandingField}>
                  <span>Font</span>
                  <select
                     className={styles.fieldSelect}
                     value={b.font || "system"}
                     onChange={(e) => update("font", e.target.value)}
                  >
                     <option value="system">System font (default)</option>
                     <option value="inter">Inter</option>
                     <option value="roboto">Roboto</option>
                  </select>
               </div>
            </div>

            <div className={styles.brandingGroup}>
               <div className={styles.brandingGroupLabel}>Styles</div>
               <div className={styles.brandingField}>
                  <span>Border style</span>
                  <select
                     className={styles.fieldSelect}
                     value={b.borderStyle || "rounded"}
                     onChange={(e) => update("borderStyle", e.target.value)}
                  >
                     <option value="rounded">Rounded (default)</option>
                     <option value="pill">Pill</option>
                     <option value="square">Square</option>
                  </select>
               </div>
            </div>

            <div className={styles.saveRow}>
               <button className={styles.btnPrimary}>Save changes</button>
            </div>
         </div>

         <div className={styles.brandingPreview}>
            <div
               className={`${styles.phoneFrame} ${
                  isDark ? styles.phoneDark : styles.phoneLight
               }`}
            >
               <div className={styles.phoneContent}>
                  <div className={styles.phoneBrand}>{business?.name}</div>
                  <div className={styles.phoneSub}>
                     Subscribe to {business?.name}
                  </div>
                  <div className={styles.phonePrice}>$19.99</div>
                  <div className={styles.phonePer}>per month</div>
                  <button className={styles.phonePayBtn}>Pay</button>
               </div>
               <div className={styles.phoneThemeToggle}>
                  <button
                     className={!isDark ? styles.phoneThemeActive : ""}
                     onClick={() => update("previewTheme", "light")}
                  >
                     Light
                  </button>
                  <button
                     className={isDark ? styles.phoneThemeActive : ""}
                     onClick={() => update("previewTheme", "dark")}
                  >
                     Dark
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CheckoutBrandingTab;
