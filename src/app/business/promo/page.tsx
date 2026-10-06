"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Download, Settings2, X } from "lucide-react";
import { useWorkspace } from "../../context/workspace-context";
import styles from "./promo.module.css";

export default function PromoCodesPage() {
   const { activeBusiness } = useWorkspace();
   const [codes, setCodes] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [showCreate, setShowCreate] = useState(false);

   // Form state
   const [code, setCode] = useState("");
   const [discount, setDiscount] = useState(10);
   const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
      "percentage",
   );
   const [discountDuration, setDiscountDuration] = useState("forever");
   const [eligibleUsers, setEligibleUsers] = useState("everyone");
   const [affiliate, setAffiliate] = useState("");
   const [setExpiration, setSetExpiration] = useState(false);
   const [setMaxRedemptions, setSetMaxRedemptions] = useState(false);
   const [onePerUser, setOnePerUser] = useState(true);
   const [appliesToProducts, setAppliesToProducts] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/promo-codes?businessId=${activeBusiness.id}`,
         );
         const d = await res.json();
         setCodes(d.codes || []);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const create = async () => {
      if (!code.trim()) {
         setError("Code is required");
         return;
      }
      if (!activeBusiness?.id) return;
      setSaving(true);
      setError("");
      try {
         const res = await fetch("/api/business/promo-codes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               code,
               discount,
               discountType,
               discountDuration,
               eligibleUsers,
               onePerUser,
            }),
         });
         const d = await res.json();
         if (!res.ok) {
            setError(d.error || "Failed");
            return;
         }
         setShowCreate(false);
         setCode("");
         load();
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>Promo codes</h1>
            <button
               className={styles.primaryBtn}
               onClick={() => setShowCreate(true)}
            >
               <Plus size={14} /> Create promo code
            </button>
         </div>

         <div className={styles.filtersRow}>
            <button className={styles.filterBtn}>
               Status: Active <X size={12} />
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
               <button className={styles.filterBtn}>
                  <Download size={14} /> Export
               </button>
               <button className={styles.iconBtn}>
                  <Settings2 size={16} />
               </button>
            </div>
         </div>

         {loading ? (
            <div className={styles.loading}>Loading...</div>
         ) : codes.length === 0 ? (
            <div className={styles.emptyState}>
               <div className={styles.emptyIcon}>🎫</div>
               <div className={styles.emptyTitle}>
                  Create your first promo code
               </div>
               <div className={styles.emptySub}>
                  Get more sales by creating your first
                  <br />
                  promo code to share with users.
               </div>
               <button
                  className={styles.primaryBtn}
                  onClick={() => setShowCreate(true)}
               >
                  Create promo code
               </button>
            </div>
         ) : (
            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>Promo code</th>
                        <th>Products</th>
                        <th>Discount</th>
                        <th>Limit</th>
                        <th>Uses</th>
                        <th>Affiliate</th>
                        <th>Status</th>
                        <th>Created</th>
                     </tr>
                  </thead>
                  <tbody>
                     {codes.map((c) => (
                        <tr key={c.id}>
                           <td className={styles.code}>{c.code}</td>
                           <td>All</td>
                           <td>
                              {c.discountType === "percentage"
                                 ? `${c.discount}%`
                                 : `$${c.discount}`}
                           </td>
                           <td>{c.maxRedemptions || "∞"}</td>
                           <td>{c.uses}</td>
                           <td>—</td>
                           <td>
                              <span className={styles.badge}>{c.status}</span>
                           </td>
                           <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {showCreate && (
            <div
               className={styles.overlay}
               onClick={() => setShowCreate(false)}
            >
               <div
                  className={styles.drawer}
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className={styles.drawerHeader}>
                     <div className={styles.drawerTitle}>Create promo code</div>
                     <button
                        className={styles.closeBtn}
                        onClick={() => setShowCreate(false)}
                     >
                        <X size={16} />
                     </button>
                  </div>

                  <div className={styles.drawerBody}>
                     <div className={styles.field}>
                        <label className={styles.label}>Code</label>
                        <input
                           className={styles.input}
                           placeholder="SUMMER_SALE"
                           value={code}
                           onChange={(e) =>
                              setCode(e.target.value.toUpperCase())
                           }
                        />
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Discount</label>
                        <div className={styles.discountRow}>
                           <input
                              type="number"
                              className={styles.input}
                              value={discount}
                              onChange={(e) =>
                                 setDiscount(Number(e.target.value))
                              }
                           />
                           <select
                              className={styles.input}
                              value={discountType}
                              onChange={(e) =>
                                 setDiscountType(e.target.value as any)
                              }
                           >
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                           </select>
                        </div>
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>
                           Discount duration
                        </label>
                        <select
                           className={styles.input}
                           value={discountDuration}
                           onChange={(e) => setDiscountDuration(e.target.value)}
                        >
                           <option value="forever">Forever</option>
                           <option value="once">Once</option>
                           <option value="repeating">Repeating</option>
                        </select>
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Eligible users</label>
                        <select
                           className={styles.input}
                           value={eligibleUsers}
                           onChange={(e) => setEligibleUsers(e.target.value)}
                        >
                           <option value="everyone">Everyone</option>
                           <option value="new_customers">New customers</option>
                           <option value="specific">Specific users</option>
                        </select>
                     </div>

                     <div className={styles.field}>
                        <div className={styles.labelRow}>
                           <label className={styles.label}>Affiliate</label>
                           <button className={styles.linkBtn}>
                              Set affiliate
                           </button>
                        </div>
                        <div className={styles.affiliateSub}>
                           Select the affiliate to attach to this promo code
                        </div>
                        <input
                           className={styles.input}
                           placeholder="Search affiliates"
                           value={affiliate}
                           onChange={(e) => setAffiliate(e.target.value)}
                        />
                        <select className={styles.input}>
                           <option>No affiliate</option>
                        </select>
                     </div>

                     <label className={styles.checkboxRow}>
                        <input
                           type="checkbox"
                           checked={setExpiration}
                           onChange={(e) => setSetExpiration(e.target.checked)}
                        />
                        <span>Set expiration date</span>
                     </label>
                     <label className={styles.checkboxRow}>
                        <input
                           type="checkbox"
                           checked={setMaxRedemptions}
                           onChange={(e) =>
                              setSetMaxRedemptions(e.target.checked)
                           }
                        />
                        <span>Set max redemptions</span>
                     </label>
                     <label className={styles.checkboxRow}>
                        <input
                           type="checkbox"
                           checked={onePerUser}
                           onChange={(e) => setOnePerUser(e.target.checked)}
                        />
                        <span>Only allow one use per user</span>
                     </label>
                     <label className={styles.checkboxRow}>
                        <input
                           type="checkbox"
                           checked={appliesToProducts}
                           onChange={(e) =>
                              setAppliesToProducts(e.target.checked)
                           }
                        />
                        <span>Apply to specific products</span>
                     </label>

                     {error && <div className={styles.error}>{error}</div>}
                  </div>

                  <div className={styles.drawerFooter}>
                     <button
                        className={styles.cancelBtn}
                        onClick={() => setShowCreate(false)}
                     >
                        Cancel
                     </button>
                     <button
                        className={styles.submitBtn}
                        onClick={create}
                        disabled={saving}
                     >
                        {saving ? "Creating..." : "Create promo code"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
