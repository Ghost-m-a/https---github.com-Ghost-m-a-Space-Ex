"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/settings.module.css";

interface Invite {
   id: string;
   companyName: string;
   companyAvatar: string;
   invitedBy: string;
   role: string;
}

const InvitesTab = () => {
   const [invites, setInvites] = useState<Invite[]>([]);
   const [loading, setLoading] = useState(true);

   const load = () => {
      setLoading(true);
      fetch("/api/user/invites")
         .then((r) => r.json())
         .then((d) => setInvites(d.invites || []))
         .finally(() => setLoading(false));
   };

   useEffect(load, []);

   const respond = async (id: string, action: "accept" | "decline") => {
      await fetch("/api/user/invites", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, action }),
      });
      load();
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Team invites</h4>
            <p className={styles.sectionSubtitle}>
               Review the companies that have invited you to join their team.
            </p>

            {loading ? (
               <div className={styles.emptyBox}>Loading...</div>
            ) : invites.length === 0 ? (
               <div className={styles.emptyBox}>
                  <div className={styles.emptyTitle}>No pending invites</div>
                  <div className={styles.emptySubtitle}>
                     You do not have any company invites waiting for a response
                     right now.
                  </div>
               </div>
            ) : (
               <div className={styles.listBox}>
                  {invites.map((inv) => (
                     <div key={inv.id} className={styles.listItem}>
                        <div className={styles.listAvatar}>
                           {inv.companyAvatar || inv.companyName[0]}
                        </div>
                        <div className={styles.listInfo}>
                           <div className={styles.listTitle}>
                              {inv.companyName}
                           </div>
                           <div className={styles.listSub}>
                              Invited by {inv.invitedBy} · {inv.role}
                           </div>
                        </div>
                        <div className={styles.listActions}>
                           <button
                              className={styles.btnSecondary}
                              onClick={() => respond(inv.id, "decline")}
                           >
                              Decline
                           </button>
                           <button
                              className={styles.btnPrimary}
                              onClick={() => respond(inv.id, "accept")}
                           >
                              Accept
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default InvitesTab;
