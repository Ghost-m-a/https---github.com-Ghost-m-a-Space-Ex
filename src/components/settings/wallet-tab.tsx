"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/components/settings.module.css";

const WalletTab = () => {
   const [wallet, setWallet] = useState<{
      address: string;
      balance: number;
      exported: boolean;
   } | null>(null);
   const [confirm, setConfirm] = useState(false);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => setWallet(d.user?.wallet));
   }, []);

   const exportKey = async () => {
      const newAddress = "0x" + Math.random().toString(16).slice(2, 42);
      await fetch("/api/user/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            wallet: { address: newAddress, balance: 0, exported: true },
         }),
      });
      setWallet({ address: newAddress, balance: 0, exported: true });
      setConfirm(false);
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <div className={styles.rowCard}>
               <div className={styles.rowCardLeft}>
                  <div>
                     <div className={styles.toggleLabel}>Export wallet key</div>
                     <div className={styles.toggleSub}>
                        Once exported, this account can no longer use Space-Ex
                        Wallet.
                     </div>
                  </div>
               </div>
               <button
                  className={styles.btnDangerSmall}
                  onClick={() => setConfirm(true)}
               >
                  {wallet?.exported
                     ? "Re-export wallet key"
                     : "Export wallet key"}
               </button>
            </div>

            {wallet?.exported && wallet.address && (
               <div className={styles.walletAddress}>
                  <div className={styles.formLabel}>Wallet address</div>
                  <code className={styles.addressCode}>{wallet.address}</code>
               </div>
            )}

            {confirm && (
               <div className={styles.confirmBox}>
                  <div>Are you sure? This action cannot be undone.</div>
                  <div className={styles.confirmActions}>
                     <button
                        className={styles.btnSecondary}
                        onClick={() => setConfirm(false)}
                     >
                        Cancel
                     </button>
                     <button className={styles.btnDanger} onClick={exportKey}>
                        Yes, export
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default WalletTab;
