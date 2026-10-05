"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/settings.module.css";

interface PartnerReq {
   id: string;
   partnerName: string;
   partnerAvatar: string;
   message: string;
   status?: string;
}

const PartnersTab = () => {
   const [tab, setTab] = useState<"pending" | "all">("pending");
   const [pending, setPending] = useState<PartnerReq[]>([]);
   const [all, setAll] = useState<PartnerReq[]>([]);
   const [loading, setLoading] = useState(true);

   const load = () => {
      setLoading(true);
      fetch("/api/user/partners")
         .then((r) => r.json())
         .then((d) => {
            setPending(d.pending || []);
            setAll(d.all || []);
         })
         .finally(() => setLoading(false));
   };

   useEffect(load, []);

   const respond = async (id: string, action: "accept" | "decline") => {
      await fetch("/api/user/partners", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, action }),
      });
      load();
   };

   const list = tab === "pending" ? pending : all;

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <p className={styles.sectionSubtitle}>
               Review requests from partners who referred you to Space-Ex. You
               can accept or decline each request.
            </p>

            <div className={styles.subTabs}>
               <button
                  className={`${styles.subTab} ${tab === "pending" ? styles.subTabActive : ""}`}
                  onClick={() => setTab("pending")}
               >
                  Pending Invites
               </button>
               <button
                  className={`${styles.subTab} ${tab === "all" ? styles.subTabActive : ""}`}
                  onClick={() => setTab("all")}
               >
                  All requests
               </button>
            </div>

            {loading ? (
               <div className={styles.emptyBox}>Loading...</div>
            ) : list.length === 0 ? (
               <div className={styles.emptyBox}>
                  {tab === "pending"
                     ? "No pending invites."
                     : "No partner requests yet"}
               </div>
            ) : (
               <div className={styles.listBox}>
                  {list.map((p) => (
                     <div key={p.id} className={styles.listItem}>
                        <div className={styles.listAvatar}>
                           {p.partnerAvatar || p.partnerName[0]}
                        </div>
                        <div className={styles.listInfo}>
                           <div className={styles.listTitle}>
                              {p.partnerName}
                           </div>
                           <div className={styles.listSub}>
                              {p.message || "Would like to partner with you"}
                           </div>
                        </div>
                        {tab === "pending" && (
                           <div className={styles.listActions}>
                              <button
                                 className={styles.btnSecondary}
                                 onClick={() => respond(p.id, "decline")}
                              >
                                 Decline
                              </button>
                              <button
                                 className={styles.btnPrimary}
                                 onClick={() => respond(p.id, "accept")}
                              >
                                 Accept
                              </button>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default PartnersTab;
