"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import styles from "../../styles/settings.module.css";

type Provider =
   | "x"
   | "instagram"
   | "discord"
   | "telegram"
   | "tradingview"
   | "youtube"
   | "tiktok"
   | "linkedin";

interface SocialAccounts {
   [key: string]: { connected: boolean; username?: string };
}

const PROVIDERS: { key: Provider; name: string; color: string }[] = [
   { key: "x", name: "X", color: "#000" },
   { key: "instagram", name: "Instagram", color: "#E1306C" },
   { key: "discord", name: "Discord", color: "#5865F2" },
   { key: "telegram", name: "Telegram", color: "#229ED9" },
   { key: "tradingview", name: "TradingView", color: "#2962FF" },
   { key: "youtube", name: "YouTube", color: "#FF0000" },
   { key: "tiktok", name: "TikTok", color: "#000" },
   { key: "linkedin", name: "LinkedIn", color: "#0A66C2" },
];

const SocialTab = () => {
   const [accounts, setAccounts] = useState<SocialAccounts>({});
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => setAccounts(d.user?.socialAccounts || {}))
         .finally(() => setLoading(false));
   }, []);

   const toggle = async (provider: Provider) => {
      const current = accounts[provider]?.connected || false;
      const next = {
         ...accounts,
         [provider]: {
            connected: !current,
            username: current
               ? undefined
               : "user_" + Math.floor(Math.random() * 1000),
         },
      };
      setAccounts(next);
      await fetch("/api/user/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ socialAccounts: next }),
      });
   };

   if (loading) return <div className={styles.loading}>Loading...</div>;

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Connect account</h4>
            <p className={styles.sectionSubtitle}>
               Connect your social accounts to let people know where to find
               you.
            </p>

            <div className={styles.socialList}>
               {PROVIDERS.map((p) => {
                  const isConnected = accounts[p.key]?.connected || false;
                  return (
                     <div key={p.key} className={styles.socialRow}>
                        <div
                           className={styles.socialIcon}
                           style={{ backgroundColor: p.color }}
                        >
                           {p.name[0]}
                        </div>
                        <div className={styles.socialName}>{p.name}</div>
                        <button
                           className={
                              isConnected
                                 ? styles.btnSecondary
                                 : styles.btnPrimary
                           }
                           onClick={() => toggle(p.key)}
                        >
                           {isConnected ? (
                              "Disconnect"
                           ) : (
                              <>
                                 <Plus size={14} /> Add
                              </>
                           )}
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

export default SocialTab;
