"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./connected.module.css";

export default function SubAccountsPage() {
   const { activeBusiness } = useWorkspace();
   const [subs, setSubs] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [email, setEmail] = useState("");
   const [accountName, setAccountName] = useState("");
   const [kind, setKind] = useState<
      "pay_workers" | "client_payments" | "marketplace_sellers"
   >("marketplace_sellers");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/sub-accounts?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setSubs(d.subAccounts || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const create = async () => {
      if (!email.trim()) {
         setError("Email is required");
         return;
      }
      if (!activeBusiness?.id) return;
      setSaving(true);
      setError("");
      try {
         const res = await fetch("/api/business/sub-accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               email,
               accountName,
               kind,
            }),
         });
         const d = await res.json();
         if (!res.ok) {
            setError(d.error || "Failed");
            return;
         }
         setShowModal(false);
         setEmail("");
         setAccountName("");
         load();
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.page}>
         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : subs.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyTag}>Connected accounts</div>
               <h1 className={styles.emptyTitle}>Who do you help get paid?</h1>

               <div className={styles.cardsGrid}>
                  <button
                     className={styles.card}
                     onClick={() => {
                        setKind("pay_workers");
                        setShowModal(true);
                     }}
                  >
                     <div className={styles.cardIcon}>💵</div>
                     <div className={styles.cardTitle}>
                        Pay people for their work
                     </div>
                     <div className={styles.cardSub}>
                        For creators, contractors, etc. that you pay
                     </div>
                  </button>

                  <button
                     className={styles.card}
                     onClick={() => {
                        setKind("client_payments");
                        setShowModal(true);
                     }}
                  >
                     <div className={styles.cardIcon}>🏙️</div>
                     <div className={styles.cardTitle}>
                        Help your clients get paid
                     </div>
                     <div className={styles.cardSub}>
                        For businesses collecting payments through your product
                     </div>
                  </button>

                  <button
                     className={styles.card}
                     onClick={() => {
                        setKind("marketplace_sellers");
                        setShowModal(true);
                     }}
                  >
                     <div className={styles.cardIcon}>🧾</div>
                     <div className={styles.cardTitle}>
                        Manage payments for sellers
                     </div>
                     <div className={styles.cardSub}>
                        For marketplaces with independent sellers
                     </div>
                  </button>
               </div>

               <button
                  className={styles.emptyCta}
                  onClick={() => setShowModal(true)}
               >
                  Create my first connected account
               </button>
            </div>
         ) : (
            <>
               <div className={styles.header}>
                  <h1 className={styles.title}>Connected accounts</h1>
                  <button
                     className={styles.primaryBtn}
                     onClick={() => setShowModal(true)}
                  >
                     + Create connected account
                  </button>
               </div>

               <div className={styles.tableWrap}>
                  <table className={styles.table}>
                     <thead>
                        <tr>
                           <th>Account</th>
                           <th>Email</th>
                           <th>Type</th>
                           <th>Status</th>
                           <th>KYC</th>
                           <th>Created</th>
                        </tr>
                     </thead>
                     <tbody>
                        {subs.map((s) => (
                           <tr key={s.id}>
                              <td className={styles.bold}>{s.accountName}</td>
                              <td>{s.email}</td>
                              <td>{s.kind.replace(/_/g, " ")}</td>
                              <td>
                                 <span className={styles.badge}>
                                    {s.status}
                                 </span>
                              </td>
                              <td>{s.kycStatus.replace(/_/g, " ")}</td>
                              <td>
                                 {new Date(s.createdAt).toLocaleDateString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </>
         )}

         {showModal && (
            <div className={styles.overlay} onClick={() => setShowModal(false)}>
               <div
                  className={styles.modal}
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     className={styles.closeBtn}
                     onClick={() => setShowModal(false)}
                  >
                     <X size={16} />
                  </button>

                  <h2 className={styles.modalTitle}>Create sub account</h2>
                  <p className={styles.modalSub}>
                     Create a new sub account. Whop handles KYC, tax forms, and
                     payouts.
                  </p>

                  <div className={styles.field}>
                     <label className={styles.label}>Email</label>
                     <input
                        className={styles.input}
                        placeholder="seller@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                     />
                  </div>

                  <div className={styles.field}>
                     <label className={styles.label}>
                        Account name{" "}
                        <span className={styles.optional}>(optional)</span>
                     </label>
                     <input
                        className={styles.input}
                        placeholder="Acme Trading"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                     />
                  </div>

                  {error && <div className={styles.error}>{error}</div>}

                  <button
                     className={styles.submitBtn}
                     onClick={create}
                     disabled={saving}
                  >
                     {saving ? "Creating..." : "Create sub account"}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
