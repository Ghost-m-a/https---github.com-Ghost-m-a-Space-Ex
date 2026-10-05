"use client";

import React from "react";
import { Star, Apple } from "lucide-react";
import Toggle from "./toggle";
import styles from "../../styles/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const CheckoutTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const c = business.checkout || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ checkout: { ...c, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         {/* Payment orchestration card (highlighted) */}
         <div className={styles.highlightCard}>
            <div className={styles.highlightTop}>
               <div>
                  <div className={styles.highlightTitle}>
                     Payment orchestration
                  </div>
                  <div className={styles.highlightSub}>
                     With payment orchestration enabled, Space-Ex will
                     automatically route payments to multiple payment providers
                     to increase your payment authorization rate by up to 10%.
                     Space-Ex will charge you a fee of 0.8% per transaction.
                  </div>
               </div>
               <button
                  className={`${styles.switch} ${c.paymentOrchestration ? styles.switchOn : ""}`}
                  onClick={() =>
                     update("paymentOrchestration", !c.paymentOrchestration)
                  }
               >
                  <span className={styles.switchThumb} />
               </button>
            </div>
         </div>

         <div className={styles.listBox}>
            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Checkout success redirect URL
                  </div>
                  <div className={styles.toggleSub}>
                     Users will be redirected to a custom URL immediately after
                     checkout
                  </div>
               </div>
               <div className={styles.configActions}>
                  <button className={styles.btnSecondarySmall}>
                     Configure
                  </button>
                  <button
                     className={`${styles.switch} ${c.successRedirectUrl ? styles.switchOn : ""}`}
                     onClick={() =>
                        update(
                           "successRedirectUrl",
                           c.successRedirectUrl ? "" : "https://",
                        )
                     }
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            </div>

            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     Custom statement descriptor
                  </div>
                  <div className={styles.toggleSub}>
                     Customize the name that appears on your customers' credit
                     card statements
                  </div>
               </div>
               <div className={styles.configActions}>
                  <button className={styles.btnSecondarySmall}>
                     Configure
                  </button>
                  <button
                     className={`${styles.switch} ${c.customStatementDescriptor ? styles.switchOn : ""}`}
                     onClick={() =>
                        update(
                           "customStatementDescriptor",
                           c.customStatementDescriptor ? "" : "Space-Ex",
                        )
                     }
                  >
                     <span className={styles.switchThumb} />
                  </button>
               </div>
            </div>

            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>
                     <Apple
                        size={14}
                        style={{ display: "inline", verticalAlign: "middle" }}
                     />{" "}
                     Apple Pay and Google Pay for embedded checkout
                  </div>
                  <div className={styles.toggleSub}>
                     To enable Apple Pay and Google Pay when using embedded
                     checkout, you must first verify your domains.
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>Configure</button>
            </div>

            <Toggle
               label="Share domains with connect accounts"
               sub="Share your verified payment domains with your connect accounts so they can accept Apple Pay and Google Pay at checkout without verifying their own."
               checked={!!c.shareDomainsWithConnect}
               onChange={(v) => update("shareDomainsWithConnect", v)}
            />

            <div className={styles.configRow}>
               <div className={styles.configText}>
                  <div className={styles.toggleLabel}>💳 Payment methods</div>
                  <div className={styles.toggleSub}>
                     Configure which payment methods customers can use at
                     checkout
                  </div>
               </div>
               <button className={styles.btnSecondarySmall}>Configure</button>
            </div>

            <Toggle
               label="Collect phone number at checkout"
               sub="Ask customers to provide a phone number during checkout."
               checked={!!c.collectPhoneAtCheckout}
               onChange={(v) => update("collectPhoneAtCheckout", v)}
            />

            <Toggle
               label="Keep access while past due"
               sub="Members keep access while a renewal payment is failing. Turn off to remove access until they pay."
               checked={!!c.keepAccessWhilePastDue}
               onChange={(v) => update("keepAccessWhilePastDue", v)}
            />

            <Toggle
               label="Cancel subscriptions after failed payments"
               sub="When a renewal payment keeps failing, cancel the membership. Turn off to keep it past due and keep billing each period until the member pays."
               checked={!!c.cancelSubsAfterFailedPayments}
               onChange={(v) => update("cancelSubsAfterFailedPayments", v)}
            />

            <Toggle
               label="Send transactional emails to your members"
               sub="Send emails regarding purchases, upcoming renewals, and payment attempts to users."
               checked={!!c.sendTransactionalEmails}
               onChange={(v) => update("sendTransactionalEmails", v)}
            />
         </div>
      </div>
   );
};

export default CheckoutTab;
