"use client";

import React, { useEffect, useState } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import styles from "@/styles/components/settings.module.css";

interface PaymentMethod {
   id: string;
   brand: string;
   last4: string;
   expiry: string;
   holderName: string;
   country: string;
   addressLine1: string;
   isDefault: boolean;
}

const COUNTRIES = [
   "United States",
   "United Kingdom",
   "France",
   "Germany",
   "Canada",
   "Australia",
   "Japan",
];

const PaymentTab = () => {
   const [methods, setMethods] = useState<PaymentMethod[]>([]);
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   const [form, setForm] = useState({
      cardNumber: "",
      expiry: "",
      cvc: "",
      holderName: "",
      country: "United States",
      addressLine1: "",
   });

   const load = () => {
      setLoading(true);
      fetch("/api/user/payment-methods")
         .then((r) => r.json())
         .then((d) => setMethods(d.methods || []))
         .finally(() => setLoading(false));
   };

   useEffect(load, []);

   const formatCard = (value: string) =>
      value
         .replace(/\D/g, "")
         .slice(0, 16)
         .replace(/(\d{4})(?=\d)/g, "$1 ");

   const formatExpiry = (value: string) =>
      value
         .replace(/\D/g, "")
         .slice(0, 4)
         .replace(/(\d{2})(?=\d)/, "$1 / ");

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      const res = await fetch("/api/user/payment-methods", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(form),
      });
      setSaving(false);
      if (res.ok) {
         setForm({
            cardNumber: "",
            expiry: "",
            cvc: "",
            holderName: "",
            country: "United States",
            addressLine1: "",
         });
         setShowForm(false);
         load();
      }
   };

   const remove = async (id: string) => {
      await fetch(`/api/user/payment-methods?id=${id}`, { method: "DELETE" });
      load();
   };

   if (showForm) {
      return (
         <div className={styles.tabContent}>
            <button
               className={styles.backBtn}
               onClick={() => setShowForm(false)}
            >
               <ChevronLeft size={16} /> Back
            </button>

            <h4 className={styles.sectionTitle}>Add payment method</h4>
            <p className={styles.sectionSubtitle}>
               Add a new payment method to your Space-Ex account.
            </p>

            <form onSubmit={submit} className={styles.paymentForm}>
               <div className={styles.formField}>
                  <label className={styles.formLabel}>Card number</label>
                  <input
                     className={styles.formInput}
                     placeholder="1234 1234 1234 1234"
                     value={form.cardNumber}
                     onChange={(e) =>
                        setForm({
                           ...form,
                           cardNumber: formatCard(e.target.value),
                        })
                     }
                     required
                  />
               </div>

               <div className={styles.formRow}>
                  <div className={styles.formField}>
                     <label className={styles.formLabel}>Expiration date</label>
                     <input
                        className={styles.formInput}
                        placeholder="MM / YY"
                        value={form.expiry}
                        onChange={(e) =>
                           setForm({
                              ...form,
                              expiry: formatExpiry(e.target.value),
                           })
                        }
                        required
                     />
                  </div>
                  <div className={styles.formField}>
                     <label className={styles.formLabel}>Security code</label>
                     <input
                        className={styles.formInput}
                        placeholder="CVC"
                        value={form.cvc}
                        onChange={(e) =>
                           setForm({
                              ...form,
                              cvc: e.target.value
                                 .replace(/\D/g, "")
                                 .slice(0, 4),
                           })
                        }
                        required
                     />
                  </div>
               </div>

               <div className={styles.formField}>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                     className={styles.formInput}
                     placeholder="John Smith"
                     value={form.holderName}
                     onChange={(e) =>
                        setForm({ ...form, holderName: e.target.value })
                     }
                     required
                  />
               </div>

               <div className={styles.formField}>
                  <label className={styles.formLabel}>Country</label>
                  <select
                     className={styles.formInput}
                     value={form.country}
                     onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                     }
                  >
                     {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                     ))}
                  </select>
               </div>

               <div className={styles.formField}>
                  <label className={styles.formLabel}>Address line 1 *</label>
                  <input
                     className={styles.formInput}
                     placeholder="123 Main St"
                     value={form.addressLine1}
                     onChange={(e) =>
                        setForm({ ...form, addressLine1: e.target.value })
                     }
                     required
                  />
               </div>

               <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving}
               >
                  {saving ? "Adding..." : "Add"}
               </button>
            </form>
         </div>
      );
   }

   return (
      <div className={styles.tabContent}>
         <h4 className={styles.sectionTitle}>Your payment methods</h4>
         <p className={styles.sectionSubtitle}>
            View and manage payment methods attached to your Space-Ex account.
         </p>

         {loading ? (
            <div className={styles.emptyBox}>Loading...</div>
         ) : methods.length === 0 ? (
            <button
               className={styles.btnPrimaryOutline}
               onClick={() => setShowForm(true)}
            >
               <Plus size={14} /> Add payment method
            </button>
         ) : (
            <>
               <button
                  className={styles.btnPrimaryOutline}
                  onClick={() => setShowForm(true)}
               >
                  <Plus size={14} /> Add payment method
               </button>
               <div className={styles.listBox} style={{ marginTop: 16 }}>
                  {methods.map((m) => (
                     <div key={m.id} className={styles.listItem}>
                        <div className={styles.cardBrand}>{m.brand}</div>
                        <div className={styles.listInfo}>
                           <div className={styles.listTitle}>
                              •••• •••• •••• {m.last4}{" "}
                              {m.isDefault && (
                                 <span className={styles.badgeSmall}>
                                    Default
                                 </span>
                              )}
                           </div>
                           <div className={styles.listSub}>
                              {m.holderName} · Expires {m.expiry}
                           </div>
                        </div>
                        <button
                           className={styles.btnDangerSmall}
                           onClick={() => remove(m.id)}
                        >
                           Remove
                        </button>
                     </div>
                  ))}
               </div>
            </>
         )}
      </div>
   );
};

export default PaymentTab;
