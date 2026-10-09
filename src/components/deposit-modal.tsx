"use client";

import React, { useState } from "react";
import { X, Landmark, ChevronDown } from "lucide-react";
import styles from "../styles/modal.module.css";

interface Props {
   isOpen: boolean;
   onClose: () => void;
   businessId: string;
   onSuccess: () => void;
}

const DepositModal: React.FC<Props> = ({
   isOpen,
   onClose,
   businessId,
   onSuccess,
}) => {
   const [amount, setAmount] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");

   const handleSubmit = async () => {
      const num = parseFloat(amount);
      if (!num || num <= 0) {
         setError("Enter a valid amount");
         return;
      }
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/business/deposit", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            businessId,
            amount: num,
            method: "bank_transfer",
         }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
         setError(data.error || "Deposit failed");
         return;
      }

      setAmount("");
      onClose();
      onSuccess();
   };

   if (!isOpen) return null;

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={onClose}>
               <X size={18} />
            </button>

            <h2 className={styles.title}>Add money</h2>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.amountInputWrap}>
               <span className={styles.currencySymbol}>$</span>
               <input
                  type="number"
                  className={styles.amountInput}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
               />
            </div>

            <button className={styles.methodBtn}>
               <Landmark size={16} />
               <span>Bank transfer</span>
               <ChevronDown size={16} />
            </button>

            <button
               className={styles.primaryBtn}
               onClick={handleSubmit}
               disabled={submitting}
            >
               {submitting ? "Processing..." : "Verify Identity"}
            </button>
         </div>
      </div>
   );
};

export default DepositModal;
