"use client";

import React from "react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const PaymentsTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const p = business.payments || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ payments: { ...p, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Financing</h4>
            <div className={styles.financingRow}>
               <div className={styles.financingLogos}>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#FF3EB5" }}
                  >
                     K
                  </span>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#5A31F4" }}
                  >
                     S
                  </span>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#2E2E2E" }}
                  >
                     Z
                  </span>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#00C26E" }}
                  >
                     $
                  </span>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#1B2A4E" }}
                  >
                     A
                  </span>
                  <span
                     className={styles.financingLogo}
                     style={{ background: "#7C3AED" }}
                  >
                     Z
                  </span>
                  <span className={styles.financingText}>
                     Apply for financing
                  </span>
               </div>
               <button className={styles.btnSecondarySmall}>Apply →</button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Maximum price</h4>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Apply for a higher maximum price
                  </div>
                  <div className={styles.toggleSub}>
                     ${p.maxPrice || 2500} maximum price per checkout today
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>
                  Request increase →
               </button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>3D Secure</h4>
            <p className={styles.sectionSubtitle}>
               Set the default for your products. Individual plans can override
               this setting.
            </p>

            {[
               {
                  key: "mandate",
                  label: "Mandate challenge",
                  sub: "Require bank verification for fraud protection; may lower conversion.",
               },
               {
                  key: "if_required",
                  label: "Challenge if required",
                  sub: "Verify with the bank only when required.",
               },
               {
                  key: "frictionless",
                  label: "Frictionless",
                  sub: "Verify in the background when possible.",
               },
            ].map((opt) => (
               <button
                  key={opt.key}
                  className={`${styles.methodCard} ${p.threeDSecure === opt.key ? styles.methodCardActive : ""}`}
                  onClick={() => update("threeDSecure", opt.key)}
               >
                  <div className={styles.methodRadio}>
                     {p.threeDSecure === opt.key && (
                        <div className={styles.methodRadioDot} />
                     )}
                  </div>
                  <div>
                     <div className={styles.methodTitle}>{opt.label}</div>
                     <div className={styles.methodSub}>{opt.sub}</div>
                  </div>
               </button>
            ))}
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Additional payment methods</h4>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Setup PayPal to accept PayPal payments
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>Setup →</button>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Migrations</h4>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>Stripe</div>
                  <div className={styles.toggleSub}>
                     Migrate subscriptions from Stripe
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>→</button>
            </div>
         </div>

         <div className={styles.section}>
            <Toggle
               label="Dispute Fighter"
               sub="Space-Ex prepares and files each response for you."
               checked={!!p.disputeFighter}
               onChange={(v) => update("disputeFighter", v)}
            />
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
               Auto respond to resolution center cases
            </h4>

            <div className={styles.sectionInner}>
               <h5 className={styles.sectionSubTitle}>Buy Now Pay Later</h5>
               <p className={styles.sectionSubtitle}>
                  Any resolution center cases for purchases made with financing
                  options (Splitit, Sezzle, Klarna, AfterPay, or Zip Pay) are
                  automatically refunded. This is to protect your payments, keep
                  your dispute rates low, and make sure we can preserve your
                  access to financing options.
               </p>

               <h5 className={styles.sectionSubTitle}>
                  Credit and debit cards
               </h5>
               <div className={styles.fieldStack}>
                  <label className={styles.fieldLabel}>
                     Auto-refund card payments below
                  </label>
                  <div className={styles.inputWithSuffix}>
                     <span className={styles.inputPrefix}>$</span>
                     <input
                        type="number"
                        className={styles.fieldInput}
                        value={p.autoRefundCardBelow || 0}
                        onChange={(e) =>
                           update("autoRefundCardBelow", Number(e.target.value))
                        }
                     />
                     <span className={styles.inputSuffix}>USD</span>
                  </div>
               </div>

               <h5 className={styles.sectionSubTitle}>PayPal</h5>
               <div className={styles.fieldStack}>
                  <label className={styles.fieldLabel}>
                     Auto-refund PayPal payments below
                  </label>
                  <div className={styles.inputWithSuffix}>
                     <span className={styles.inputPrefix}>$</span>
                     <input
                        type="number"
                        className={styles.fieldInput}
                        value={p.autoRefundPaypalBelow || 0}
                        onChange={(e) =>
                           update(
                              "autoRefundPaypalBelow",
                              Number(e.target.value),
                           )
                        }
                     />
                     <span className={styles.inputSuffix}>USD</span>
                  </div>
               </div>

               <div className={styles.flowSteps}>
                  <div className={styles.flowStep}>
                     <span className={styles.flowNumber}>1</span>
                     If user opens a case, and the amount is below threshold
                  </div>
                  <div className={styles.flowStep}>
                     <span className={styles.flowNumber}>2</span>
                     Refund and send this message
                  </div>
               </div>

               <textarea
                  className={styles.fieldTextarea}
                  value={p.autoRefundMessage || ""}
                  onChange={(e) => update("autoRefundMessage", e.target.value)}
                  rows={3}
               />

               <div className={styles.saveRow}>
                  <button className={styles.btnPrimary}>Save</button>
               </div>
            </div>
         </div>

         <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Early dispute alerts</h4>
            <div className={styles.sectionInner}>
               <h5 className={styles.sectionSubTitle}>
                  What is an early dispute alert?
               </h5>
               <p className={styles.sectionSubtitle}>
                  When a user contacts their bank to dispute a transaction,
                  Space-Ex will receive a notification allowing you to refund
                  the transaction and resolve the alert before it becomes a
                  formal dispute.
               </p>

               <h5 className={styles.sectionSubTitle}>
                  How early dispute alerts can help you
               </h5>
               <ul className={styles.bulletList}>
                  <li>
                     Automatically refund transactions lower than{" "}
                     <strong>${p.earlyDisputeAlertBelow || 500}</strong> before
                     they turn into disputes
                  </li>
                  <li>
                     Helps keep your dispute rate low and protect you from
                     potential holds or account closures
                  </li>
               </ul>

               <div className={styles.fieldStack}>
                  <label className={styles.fieldLabel}>
                     Refund transactions lower than:
                  </label>
                  <div className={styles.inputWithSuffix}>
                     <span className={styles.inputPrefix}>$</span>
                     <input
                        type="number"
                        className={styles.fieldInput}
                        value={p.earlyDisputeAlertBelow || 500}
                        onChange={(e) =>
                           update(
                              "earlyDisputeAlertBelow",
                              Number(e.target.value),
                           )
                        }
                     />
                     <span className={styles.inputSuffix}>USD</span>
                  </div>
               </div>

               <div className={styles.saveRow}>
                  <button className={styles.btnPrimary}>Save</button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PaymentsTab;
