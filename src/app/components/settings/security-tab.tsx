"use client";

import React, { useEffect, useState } from "react";
import { Mail, Smartphone, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "../../styles/settings.module.css";

const SecurityTab = () => {
   const router = useRouter();
   const [email, setEmail] = useState("");
   const [twoFactor, setTwoFactor] = useState<{
      enabled: boolean;
      method: "authenticator" | "sms" | null;
   }>({
      enabled: false,
      method: null,
   });
   const [method, setMethod] = useState<"authenticator" | "sms">(
      "authenticator",
   );
   const [confirmDelete, setConfirmDelete] = useState(false);

   useEffect(() => {
      fetch("/api/user/settings")
         .then((r) => r.json())
         .then((d) => {
            setEmail(d.user?.email || "");
            setTwoFactor(d.user?.twoFactor || { enabled: false, method: null });
            if (d.user?.twoFactor?.method) setMethod(d.user.twoFactor.method);
         });
   }, []);

   const enableTwoFa = async () => {
      await fetch("/api/user/security", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "enable-2fa", method }),
      });
      setTwoFactor({ enabled: true, method });
   };

   const disableTwoFa = async () => {
      await fetch("/api/user/security", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "disable-2fa" }),
      });
      setTwoFactor({ enabled: false, method: null });
   };

   const signOutEverywhere = async () => {
      await fetch("/api/user/security", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "signout-all" }),
      });
      router.push("/login");
   };

   const deleteAccount = async () => {
      await fetch("/api/user/delete", { method: "DELETE" });
      router.push("/login");
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <div className={styles.rowCard}>
               <div className={styles.rowCardLeft}>
                  <Mail size={16} />
                  <span>{email}</span>
               </div>
               <button className={styles.btnSecondarySmall}>Change</button>
            </div>

            <div className={styles.rowCard}>
               <div className={styles.rowCardLeft}>
                  <Smartphone size={16} />
                  <span>Add phone number</span>
               </div>
               <button className={styles.btnSecondarySmall}>Add</button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Two-factor authentication</h4>
            <p className={styles.sectionSubtitle}>
               Add an extra layer of security to your account by requiring a
               code when signing in.
            </p>

            <button
               className={`${styles.methodCard} ${method === "authenticator" ? styles.methodCardActive : ""}`}
               onClick={() => setMethod("authenticator")}
            >
               <div className={styles.methodCheck}>
                  {method === "authenticator" && <Check size={14} />}
               </div>
               <div>
                  <div className={styles.methodTitle}>
                     Authenticator app (Recommended)
                  </div>
                  <div className={styles.methodSub}>
                     Receive a code via authenticator app
                  </div>
               </div>
            </button>

            <button
               className={`${styles.methodCard} ${method === "sms" ? styles.methodCardActive : ""}`}
               onClick={() => setMethod("sms")}
            >
               <div className={styles.methodCheck}>
                  {method === "sms" && <Check size={14} />}
               </div>
               <div>
                  <div className={styles.methodTitle}>Text message</div>
                  <div className={styles.methodSub}>Receive a code via SMS</div>
               </div>
            </button>

            {twoFactor.enabled ? (
               <button className={styles.btnDanger} onClick={disableTwoFa}>
                  Disable two-factor authentication
               </button>
            ) : (
               <button className={styles.btnPrimary} onClick={enableTwoFa}>
                  Enable two-factor authentication
               </button>
            )}
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Devices</h4>
            <p className={styles.sectionSubtitle}>
               Sign out of Space-Ex on this device and every other device.
            </p>
            <button
               className={styles.btnDangerSmall}
               onClick={signOutEverywhere}
            >
               Sign out everywhere
            </button>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Connected apps</h4>
            <p className={styles.sectionSubtitle}>
               Manage apps that can access your account.
            </p>
            <div className={styles.emptyBox}>
               <div className={styles.emptyTitle}>No connected apps</div>
               <div className={styles.emptySubtitle}>
                  When you authorize an app, it will show up here.
               </div>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Danger zone</h4>
            {!confirmDelete ? (
               <button
                  className={styles.btnDangerSmall}
                  onClick={() => setConfirmDelete(true)}
               >
                  Delete account
               </button>
            ) : (
               <div className={styles.confirmBox}>
                  <div>
                     This will permanently delete your account and all data. Are
                     you sure?
                  </div>
                  <div className={styles.confirmActions}>
                     <button
                        className={styles.btnSecondary}
                        onClick={() => setConfirmDelete(false)}
                     >
                        Cancel
                     </button>
                     <button
                        className={styles.btnDanger}
                        onClick={deleteAccount}
                     >
                        Yes, delete
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default SecurityTab;
