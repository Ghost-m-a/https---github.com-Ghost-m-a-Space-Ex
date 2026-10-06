"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link2, FileText, Search, Check, X } from "lucide-react";
import { useWorkspace } from "../../../context/workspace-context";
import styles from "../affiliates.module.css";
import portalStyles from "./portal.module.css";

export default function AffiliatePortalPage() {
   const { activeBusiness } = useWorkspace();
   const [settings, setSettings] = useState<any>(null);
   const [pending, setPending] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [copied, setCopied] = useState(false);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/affiliates/portal?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setSettings(d.settings);
         setPending(d.pending || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const update = async (patch: Record<string, unknown>) => {
      if (!activeBusiness?.id) return;
      setSettings((prev: any) => ({ ...prev, ...patch }));
      await fetch("/api/business/affiliates/portal", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ businessId: activeBusiness.id, ...patch }),
      });
   };

   const copyPortalLink = () => {
      if (!settings?.portalLink) return;
      navigator.clipboard.writeText(settings.portalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleAction = async (id: string, action: "approve" | "reject") => {
      await fetch("/api/business/affiliates/signups", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, action }),
      });
      load();
   };

   if (loading) return <div className={styles.loading}>Loading...</div>;

   return (
      <>
         <div className={styles.topTabs}>
            {[
               { href: "/business/affiliates", label: "Creator dashboard" },
               { href: "/business/affiliates/signups", label: "Signups" },
               {
                  href: "/business/affiliates/portal",
                  label: "Affiliate portal",
                  active: true,
               },
               {
                  href: "/business/affiliates/revenue-share",
                  label: "Revenue share",
               },
            ].map((t) => (
               <a
                  key={t.label}
                  href={t.href}
                  className={`${styles.topTab} ${t.active ? styles.topTabActive : ""}`}
               >
                  {t.label}
               </a>
            ))}
         </div>

         {/* Affiliate setup */}
         <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Affiliate setup</h3>

            <div className={portalStyles.setupCard}>
               <div className={portalStyles.setupRow}>
                  <div className={portalStyles.setupIcon}>
                     <Link2 size={16} />
                  </div>
                  <div className={portalStyles.setupText}>
                     <div className={portalStyles.setupTitle}>Portal link</div>
                     <div className={portalStyles.setupSub}>
                        Give your affiliates a place to organize their resources
                     </div>
                  </div>
                  <button
                     className={portalStyles.copyBtn}
                     onClick={copyPortalLink}
                  >
                     {copied ? <Check size={14} /> : null}
                     {copied ? "Copied" : "Copy link"}
                  </button>
               </div>

               <div className={portalStyles.setupRow}>
                  <div className={portalStyles.setupIcon}>
                     <FileText size={16} />
                  </div>
                  <div className={portalStyles.setupText}>
                     <div className={portalStyles.setupTitle}>Waitlist</div>
                     <div className={portalStyles.setupSub}>
                        Set up a waitlist for your affiliates program
                     </div>
                  </div>
                  <button
                     className={`${portalStyles.switch} ${settings?.waitlistEnabled ? portalStyles.switchOn : ""}`}
                     onClick={() =>
                        update({ waitlistEnabled: !settings?.waitlistEnabled })
                     }
                  >
                     <span className={portalStyles.switchThumb} />
                  </button>
               </div>
            </div>
         </div>

         {/* Affiliate management */}
         <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Affiliate management</h3>

            <div className={styles.tableFilters}>
               <div className={styles.searchWrap}>
                  <Search size={16} />
                  <input
                     className={styles.searchInput}
                     placeholder="Search..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <button
                  className={`${styles.filterTab} ${styles.filterTabActive}`}
               >
                  Status: Pending <X size={12} />
               </button>
            </div>

            {pending.length === 0 ? (
               <div className={styles.emptyLarge}>
                  <div className={styles.emptyIcon}>✉️</div>
                  <div className={styles.emptyTitle}>
                     No pending applications
                  </div>
                  <div className={styles.emptySub}>
                     When someone applies to become an affiliate, their
                     <br />
                     application will show up here for you to review.
                  </div>
               </div>
            ) : (
               <div className={styles.tableWrap}>
                  <table className={styles.table}>
                     <thead>
                        <tr>
                           <th>User</th>
                           <th>Date</th>
                           <th>Status</th>
                           <th></th>
                        </tr>
                     </thead>
                     <tbody>
                        {pending.map((p) => (
                           <tr key={p.id}>
                              <td>{p.name}</td>
                              <td>{new Date(p.date).toLocaleDateString()}</td>
                              <td>Pending</td>
                              <td>
                                 <button
                                    className={portalStyles.approveBtn}
                                    onClick={() =>
                                       handleAction(p.id, "approve")
                                    }
                                 >
                                    Approve
                                 </button>
                                 <button
                                    className={portalStyles.rejectBtn}
                                    onClick={() => handleAction(p.id, "reject")}
                                 >
                                    Reject
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            <div className={styles.tableFooter}>
               <span>
                  0-{pending.length} of {pending.length} results
               </span>
               <div className={styles.rowsPerPage}>
                  Rows per page{" "}
                  <select className={styles.rowsSelect}>
                     <option>20</option>
                  </select>
               </div>
            </div>
         </div>
      </>
   );
}
