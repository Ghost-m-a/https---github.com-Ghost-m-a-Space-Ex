"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/invoice-new.module.css";

type Preview = "email" | "checkout" | "pdf";

export default function NewInvoicePage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [preview, setPreview] = useState<Preview>("email");
   const [customer, setCustomer] = useState("");
   const [product, setProduct] = useState("");
   const [productName, setProductName] = useState("Premium Membership");
   const [paymentMethod, setPaymentMethod] = useState<"send" | "auto">("send");
   const [dueInDays, setDueInDays] = useState(7);
   const [description, setDescription] = useState("");
   const [pricingType, setPricingType] = useState<"one-time" | "recurring">(
      "one-time",
   );
   const [price, setPrice] = useState(0);
   const [currency, setCurrency] = useState("USD");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   const dueDate = new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000);
   const dueDateStr = dueDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
   });

   const submit = async () => {
      if (!activeBusiness?.id) {
         setError("No active business");
         return;
      }
      setSaving(true);
      setError("");
      try {
         const res = await fetch("/api/business/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               customerName: customer,
               customerEmail: customer,
               product,
               productName,
               price,
               description,
               pricingType,
               dueDate: dueDate.toISOString(),
            }),
         });
         const d = await res.json();
         if (!res.ok) {
            setError(d.error || "Failed to create");
            return;
         }
         router.push("/business/invoices");
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.page}>
         <header className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/invoices")}
            >
               <X size={16} /> Invoices
            </button>
            <div className={styles.previewTabs}>
               {(["email", "checkout", "pdf"] as Preview[]).map((p) => (
                  <button
                     key={p}
                     className={`${styles.previewTab} ${preview === p ? styles.previewTabActive : ""}`}
                     onClick={() => setPreview(p)}
                  >
                     {p === "email" && "Email preview"}
                     {p === "checkout" && "Checkout link preview"}
                     {p === "pdf" && "Invoice PDF"}
                  </button>
               ))}
            </div>
         </header>

         <div className={styles.body}>
            <aside className={styles.leftPanel}>
               <div className={styles.warningBox}>
                  <div className={styles.warningTitle}>
                     ⚠ Email notifications are disabled until you verify your
                     identity
                  </div>
                  <div className={styles.warningSub}>
                     Your customer won&apos;t receive this invoice by email
                     until your account completes identity verification. You can
                     still share the invoice&apos;s payment link directly.
                  </div>
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Customer</label>
                  <input
                     className={styles.input}
                     placeholder="Find or add a customer"
                     value={customer}
                     onChange={(e) => setCustomer(e.target.value)}
                  />
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Product</label>
                  <select
                     className={styles.input}
                     value={product}
                     onChange={(e) => setProduct(e.target.value)}
                  >
                     <option value="">Find or add a product</option>
                     <option value="pro">Pro Membership</option>
                     <option value="starter">Starter Course</option>
                  </select>
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Product name</label>
                  <input
                     className={styles.input}
                     value={productName}
                     onChange={(e) => setProductName(e.target.value)}
                  />
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Payment collection</label>
                  <label className={styles.radioRow}>
                     <input
                        type="radio"
                        checked={paymentMethod === "send"}
                        onChange={() => setPaymentMethod("send")}
                     />
                     <span>Send invoice</span>
                  </label>
                  <label className={styles.radioRow}>
                     <input
                        type="radio"
                        checked={paymentMethod === "auto"}
                        onChange={() => setPaymentMethod("auto")}
                     />
                     <span>Charge automatically</span>
                  </label>
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Due date</label>
                  <select
                     className={styles.input}
                     value={dueInDays}
                     onChange={(e) => setDueInDays(Number(e.target.value))}
                  >
                     <option value={7}>Due in 7 days · {dueDateStr}</option>
                     <option value={14}>Due in 14 days</option>
                     <option value={30}>Due in 30 days</option>
                  </select>
               </div>

               <label className={styles.checkboxRow}>
                  <input type="checkbox" />
                  <span>Schedule send date</span>
               </label>

               <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                     className={styles.textarea}
                     placeholder="Describe what your customers will get with this plan"
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     rows={3}
                  />
               </div>

               <div className={styles.pricingTabs}>
                  <button
                     className={`${styles.pricingTab} ${pricingType === "one-time" ? styles.pricingTabActive : ""}`}
                     onClick={() => setPricingType("one-time")}
                  >
                     One-time
                  </button>
                  <button
                     className={`${styles.pricingTab} ${pricingType === "recurring" ? styles.pricingTabActive : ""}`}
                     onClick={() => setPricingType("recurring")}
                  >
                     Recurring
                  </button>
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Price</label>
                  <div className={styles.priceRow}>
                     <span className={styles.currency}>$</span>
                     <input
                        type="number"
                        className={styles.priceInput}
                        value={price || ""}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                        placeholder="0"
                     />
                     <select
                        className={styles.currencySelect}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                     >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                     </select>
                  </div>
               </div>

               <div className={styles.presetsRow}>
                  {[50, 100, 250].map((p) => (
                     <button
                        key={p}
                        className={styles.presetBtn}
                        onClick={() => setPrice(p)}
                     >
                        ${p}
                     </button>
                  ))}
               </div>

               {error && <div className={styles.error}>{error}</div>}

               <button
                  className={styles.submitBtn}
                  onClick={submit}
                  disabled={saving}
               >
                  {saving ? "Sending..." : "Send invoice"}
               </button>
            </aside>

            <main className={styles.rightPanel}>
               {preview === "email" && (
                  <div className={styles.emailPreview}>
                     <div className={styles.emailHeader}>
                        <div className={styles.emailBrand}>
                           <div className={styles.emailLogo}>S</div>
                           <span>Space/Ex</span>
                           <span className={styles.viaWhop}>via Whop</span>
                        </div>
                        <div className={styles.emailSubject}>
                           You have a new invoice
                        </div>
                        <div className={styles.emailTo}>
                           To: {customer || "customer@example.com"}
                        </div>
                     </div>
                     <div className={styles.emailBody}>
                        <div className={styles.invoiceBrand}>
                           <div className={styles.invoiceLogo}>S</div>
                           <span>Space/Ex</span>
                        </div>
                        <div className={styles.invoiceAmount}>
                           ${price.toFixed(2)}
                        </div>
                        <div className={styles.invoiceDue}>
                           Due {dueDateStr}
                        </div>
                        <button className={styles.downloadBtn}>
                           ⬇ Download invoice
                        </button>
                        <div className={styles.invoiceNumberLabel}>
                           Invoice number
                        </div>
                        <div className={styles.invoiceNumber}>#00000001</div>
                        <button className={styles.payNowBtn} disabled>
                           Pay now
                        </button>
                     </div>
                     <div className={styles.emailFooter}>
                        <div>
                           {new Date().toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                           })}
                        </div>
                        <div className={styles.lineItem}>
                           <span>Select a product</span>
                           <span>${price.toFixed(2)}</span>
                        </div>
                        <div className={styles.lineItemTotal}>
                           <span>Total</span>
                           <span>${price.toFixed(2)}</span>
                        </div>
                        <div className={styles.helpText}>
                           If you need any help, please reach out to support
                           here.
                        </div>
                     </div>
                  </div>
               )}

               {preview === "checkout" && (
                  <div className={styles.phoneFrame}>
                     <div className={styles.phoneNotch} />
                     <div className={styles.phoneContent}>
                        <div className={styles.checkoutHeader}>
                           <div className={styles.checkoutBrand}>
                              <div className={styles.checkoutLogo}>S</div>
                              <span>Space/Ex</span>
                           </div>
                           <div className={styles.checkoutPromo}>
                              Promo code & details
                           </div>
                        </div>
                        <div className={styles.checkoutSeller}>Space/Ex</div>
                        <div className={styles.checkoutPrice}>
                           ${price.toFixed(2)}
                        </div>
                        <label className={styles.checkoutLabel}>Email</label>
                        <input
                           className={styles.checkoutInput}
                           value="johnappleseed@gmail.com"
                           readOnly
                        />
                        <div className={styles.checkoutMethodTitle}>
                           Payment method
                        </div>
                        <button className={styles.checkoutMethodBtn}>
                           💳 Card
                        </button>
                        <label className={styles.checkoutLabel}>
                           Card information
                        </label>
                        <input
                           className={styles.checkoutInput}
                           placeholder="1234 1234 1234 1234"
                        />
                        <div className={styles.cardRow}>
                           <input
                              className={styles.checkoutInput}
                              placeholder="MM / YY"
                           />
                           <input
                              className={styles.checkoutInput}
                              placeholder="CVC"
                           />
                        </div>
                        <label className={styles.checkoutLabel}>
                           Billing details
                        </label>
                        <input
                           className={styles.checkoutInput}
                           placeholder="Name"
                        />
                        <select className={styles.checkoutInput}>
                           <option>United States</option>
                        </select>
                     </div>
                  </div>
               )}

               {preview === "pdf" && (
                  <div className={styles.pdfPreview}>
                     <div className={styles.pdfHeader}>
                        <div className={styles.pdfTitle}>Invoice</div>
                        <div className={styles.pdfBrand}>Space/Ex</div>
                     </div>
                     <div className={styles.pdfMeta}>
                        <div>
                           Invoice number <strong>00000001</strong>
                        </div>
                        <div>
                           Date of issue{" "}
                           <strong>
                              {new Date().toLocaleDateString("en-US", {
                                 month: "long",
                                 day: "numeric",
                                 year: "numeric",
                              })}
                           </strong>
                        </div>
                        <div>
                           Date due <strong>{dueDateStr}</strong>
                        </div>
                     </div>
                     <div className={styles.pdfBillRow}>
                        <div>Space/Ex</div>
                        <div>Bill to</div>
                     </div>
                     <table className={styles.pdfTable}>
                        <thead>
                           <tr>
                              <th>Product</th>
                              <th>Amount</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr>
                              <td>{productName}</td>
                              <td>${price.toFixed(2)}</td>
                           </tr>
                           <tr className={styles.pdfTotal}>
                              <td>Subtotal</td>
                              <td>${price.toFixed(2)}</td>
                           </tr>
                           <tr className={styles.pdfTotalBold}>
                              <td>Amount due</td>
                              <td>${price.toFixed(2)}</td>
                           </tr>
                        </tbody>
                     </table>
                     <div className={styles.pdfFooter}>
                        Invoice has been issued by the seller Whop Inc in the
                        name and on behalf of Space/Ex
                        <br />
                        No: 2025796559466
                     </div>
                  </div>
               )}
            </main>
         </div>
      </div>
   );
}
