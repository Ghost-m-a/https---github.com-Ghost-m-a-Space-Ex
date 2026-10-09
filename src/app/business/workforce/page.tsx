"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { WorkforceMember } from "@/lib/types";
import styles from "@/styles/pages/business.module.css";

export default function WorkforcePage() {
   const [members, setMembers] = useState<WorkforceMember[]>([]);
   const [showInvite, setShowInvite] = useState(false);
   const [email, setEmail] = useState("");
   const [role, setRole] = useState("Member");

   const load = () =>
      fetch("/api/business/workforce")
         .then((r) => r.json())
         .then((d) => setMembers(d.members));
   useEffect(() => {
      load();
   }, []);

   const invite = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch("/api/business/workforce", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, role }),
      });
      setEmail("");
      setRole("Member");
      setShowInvite(false);
      load();
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Workforce</h1>
            <button
               className={styles.primaryBtn}
               onClick={() => setShowInvite(true)}
            >
               <Plus size={16} /> Invite Member
            </button>
         </div>

         <div className={styles.tableCard}>
            <div className={styles.tableHead}>
               <div>Member</div>
               <div>Role</div>
               <div>Status</div>
               <div>Joined</div>
            </div>
            {members.map((m) => (
               <div key={m.id} className={styles.tableRow}>
                  <div className={styles.custCell}>
                     <div className={styles.custAvatar}>{m.avatar}</div>
                     <div>
                        <div className={styles.custName}>{m.name}</div>
                        <div className={styles.custEmail}>{m.email}</div>
                     </div>
                  </div>
                  <div className={styles.cell}>{m.role}</div>
                  <div className={styles.cell}>
                     <span
                        className={`${styles.status} ${m.status === "active" ? styles.succeeded : styles.pending}`}
                     >
                        {m.status}
                     </span>
                  </div>
                  <div className={styles.cell}>{m.joinedOn}</div>
               </div>
            ))}
         </div>

         {showInvite && (
            <div
               className={styles.modalOverlay}
               onClick={() => setShowInvite(false)}
            >
               <form
                  className={styles.modal}
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={invite}
               >
                  <h2 className={styles.modalTitle}>Invite Member</h2>
                  <input
                     className={styles.input}
                     type="email"
                     placeholder="Email address"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
                  <select
                     className={styles.input}
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                  >
                     <option>Member</option>
                     <option>Admin</option>
                     <option>Support Agent</option>
                     <option>Marketing</option>
                  </select>
                  <button type="submit" className={styles.primaryBtn}>
                     Send Invite
                  </button>
               </form>
            </div>
         )}
      </div>
   );
}
