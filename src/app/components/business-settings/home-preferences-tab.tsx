"use client";

import React from "react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const HomePreferencesTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const h = business.homePreferences || {};

   return (
      <div className={styles.tabContent}>
         <div className={styles.listBox}>
            <Toggle
               label="Hide member count"
               sub="Hide the number of members on your public page"
               checked={!!h.hideMemberCount}
               onChange={(v) =>
                  updateBusiness({
                     homePreferences: { ...h, hideMemberCount: v },
                  })
               }
            />
            <Toggle
               label="Hide members card"
               sub="Hide the members list in the sidebar on your public page. Team members will still be shown."
               checked={!!h.hideMembersCard}
               onChange={(v) =>
                  updateBusiness({
                     homePreferences: { ...h, hideMembersCard: v },
                  })
               }
            />
         </div>
      </div>
   );
};

export default HomePreferencesTab;
