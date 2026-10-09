"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
   Plus,
   Download,
   Settings2,
   MoreHorizontal,
   Shield,
   ChevronDown,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/team.module.css";

export default function TeamPage() {
   const { activeBusiness } = useWorkspace();
   const [members, setMembers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [tab, setTab] = useState<"members" | "invites" | "audit" | "api">(
      "members",
   );
   const [require2fa, setRequire2fa] = useState(false);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/team?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setMembers(d.members || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <div className={styles.page}>
         {/* 2FA banner */}
         <div className={styles.banner}>
            <div className={styles.bannerLeft}>
               <Shield size={16} />
               <span>Require 2FA for every team member</span>
            </div>
            <button
               className={`${styles.switch} ${require2fa ? styles.switchOn : ""}`}
               onClick={() => setRequire2fa(!require2fa)}
            >
               <span className={styles.switchThumb} />
            </button>
         </div>

         {/* Tabs */}
         <div className={styles.tabs}>
            {(["members", "invites", "audit", "api"] as const).map((t) => (
               <button
                  key={t}
                  className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                  onClick={() => setTab(t)}
               >
                  {t === "members" && "Members"}
                  {t === "invites" && "Invites"}
                  {t === "audit" && "Audit logs"}
                  {t === "api" && "API logs"}
               </button>
            ))}
         </div>

         <div className={styles.header}>
            <h1 className={styles.title}>
               {tab === "members"
                  ? "Members"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h1>
            <div className={styles.headerActions}>
               {tab === "members" && (
                  <>
                     <button className={styles.secondaryBtn}>
                        📖 Documentation
                     </button>
                     <button className={styles.secondaryBtn}>
                        ⚙ Manage roles
                     </button>
                     <button className={styles.primaryBtn}>
                        <Plus size={14} /> Invite team member
                     </button>
                     <button className={styles.filterBtn}>
                        <Download size={14} /> Export
                     </button>
                     <button className={styles.iconBtn}>
                        <Settings2 size={16} />
                     </button>
                  </>
               )}
            </div>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : members.length === 0 ? (
            <div className={styles.empty}>No team members</div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Team member</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Auth</th>
                        <th>Added</th>
                        <th>Pay</th>
                        <th></th>
                     </tr>
                  </thead>
                  <tbody>
                     {members.map((m) => (
                        <tr key={m.id}>
                           <td>
                              <div className={styles.userCell}>
                                 <div className={styles.avatar}>{m.avatar}</div>
                                 <span>{m.name}</span>
                              </div>
                           </td>
                           <td>{m.email}</td>
                           <td>
                              <span className={styles.rolePill}>
                                 {m.role === "owner"
                                    ? "Owner"
                                    : m.role.charAt(0).toUpperCase() +
                                      m.role.slice(1)}
                                 <ChevronDown size={10} />
                              </span>
                           </td>
                           <td>
                              <span
                                 className={`${styles.authBadge} ${m.auth === "2fa_required" ? styles.auth2fa : ""}`}
                              >
                                 {m.auth === "2fa_required"
                                    ? "2FA required"
                                    : "One-step"}
                              </span>
                           </td>
                           <td>
                              {new Date(m.addedAt).toLocaleDateString("en-US", {
                                 month: "short",
                                 day: "numeric",
                                 year: "numeric",
                              })}
                           </td>
                           <td>
                              <span
                                 className={`${styles.payBadge} ${m.pay === "pay" ? styles.payGreen : ""}`}
                              >
                                 {m.pay === "pay" ? "Pay" : "Unpaid"}
                              </span>
                           </td>
                           <td>
                              <button className={styles.iconSmall}>
                                 <MoreHorizontal size={14} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
