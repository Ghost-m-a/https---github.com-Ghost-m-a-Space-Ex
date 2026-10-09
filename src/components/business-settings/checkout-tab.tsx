"use client";

import React from "react";
import Toggle from "./toggle";
import styles from "@/styles/components/business-settings.module.css";

interface Props {
   business: any;
   updateBusiness: (patch: Record<string, unknown>) => Promise<void>;
}

const CheckoutTab: React.FC<Props> = ({ business, updateBusiness }) => {
   const c = business?.checkout || {};

   const update = (key: string, value: unknown) => {
      updateBusiness({ checkout: { ...c, [key]: value } });
   };

   return (
      <div className={styles.tabContent}>
         <div className={styles.highlightCard}>
            <div className={styles.highlightTop}>
               <div>
                  <div className={styles.highlightTitle}>
                     Payment orchestration
                  </div>
                  <div className={styles.highlightSub}>
                     Automatically route payments to multiple providers to
                     increase authorization rates by up to 10%. A 0.8% fee per
                     transaction applies.
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
            <Toggle
               label="Collect phone number at checkout"
               sub="Ask customers to provide a phone number during checkout."
               checked={!!c.collectPhoneAtCheckout}
               onChange={(v) => update("collectPhoneAtCheckout", v)}
            />
            <Toggle
               label="Keep access while past due"
               sub="Members keep access while a renewal payment is failing."
               checked={!!c.keepAccessWhilePastDue}
               onChange={(v) => update("keepAccessWhilePastDue", v)}
            />
            <Toggle
               label="Cancel subscriptions after failed payments"
               sub="When a renewal payment keeps failing, cancel the membership."
               checked={!!c.cancelSubsAfterFailedPayments}
               onChange={(v) => update("cancelSubsAfterFailedPayments", v)}
            />
            <Toggle
               label="Send transactional emails to your members"
               sub="Send emails regarding purchases, upcoming renewals, and payment attempts."
               checked={!!c.sendTransactionalEmails}
               onChange={(v) => update("sendTransactionalEmails", v)}
            />
         </div>
      </div>
   );
};

export default CheckoutTab;
