"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Link2 } from "lucide-react";
import styles from "../styles/modal.module.css";

interface User {
   id: string;
   name: string;
   email: string;
   username: string;
   avatar: string;
}

interface Props {
   isOpen: boolean;
   onClose: () => void;
   businessId: string;
   balance: number;
   onSuccess: () => void;
}

const SendModal: React.FC<Props> = ({
   isOpen,
   onClose,
   businessId,
   balance,
   onSuccess,
}) => {
   const [step, setStep] = useState<"recipient" | "amount">("recipient");
   const [query, setQuery] = useState("");
   const [users, setUsers] = useState<User[]>([]);
   const [selected, setSelected] = useState<User | null>(null);
   const [amount, setAmount] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      if (!isOpen || step !== "recipient") return;
      const timer = setTimeout(() => {
         fetch(`/api/business/recipients?q=${encodeURIComponent(query)}`)
            .then((r) => r.json())
            .then((d) => setUsers(d.users || []))
            .catch(() => setUsers([]));
      }, 250);
      return () => clearTimeout(timer);
   }, [query, isOpen, step]);

   useEffect(() => {
      if (!isOpen) {
         setStep("recipient");
         setQuery("");
         setSelected(null);
         setAmount("");
         setError("");
      }
   }, [isOpen]);

   const handleSend = async () => {
      const num = parseFloat(amount);
      if (!num || num <= 0) return setError("Invalid amount");
      if (num > balance) return setError("Insufficient balance");

      setSubmitting(true);
      const res = await fetch("/api/business/send", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            businessId,
            amount: num,
            recipientId: selected?.id,
            recipientEmail: selected?.email,
         }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) return setError(data.error || "Send failed");

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

            {step === "recipient" && (
               <>
                  <h2 className={styles.title}>Choose recipient</h2>

                  <div className={styles.searchBox}>
                     <Search size={16} />
                     <input
                        className={styles.searchInput}
                        placeholder="Search by name, username, or email"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                     />
                  </div>

                  <button className={styles.sendViaLink}>
                     <Link2 size={16} />
                     <div>
                        <div className={styles.sendViaLinkTitle}>
                           Send via link
                        </div>
                        <div className={styles.sendViaLinkSub}>
                           Create claim link
                        </div>
                     </div>
                  </button>

                  <div className={styles.peopleLabel}>People</div>

                  <div className={styles.userList}>
                     {users.length === 0 ? (
                        <div className={styles.emptyList}>No users found</div>
                     ) : (
                        users.map((u) => (
                           <button
                              key={u.id}
                              className={styles.userRow}
                              onClick={() => {
                                 setSelected(u);
                                 setStep("amount");
                              }}
                           >
                              <div className={styles.userAvatar}>
                                 {u.avatar}
                              </div>
                              <div>
                                 <div className={styles.userName}>{u.name}</div>
                                 <div className={styles.userHandle}>
                                    @{u.username}
                                 </div>
                              </div>
                           </button>
                        ))
                     )}
                  </div>
               </>
            )}

            {step === "amount" && selected && (
               <>
                  <h2 className={styles.title}>Send to {selected.name}</h2>

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

                  <div className={styles.balanceHint}>
                     Available: ${balance.toFixed(2)}
                  </div>

                  <button
                     className={styles.primaryBtn}
                     onClick={handleSend}
                     disabled={submitting}
                  >
                     {submitting ? "Sending..." : "Send money"}
                  </button>
               </>
            )}
         </div>
      </div>
   );
};

export default SendModal;
