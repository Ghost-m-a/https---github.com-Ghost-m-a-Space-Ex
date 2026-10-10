"use client";

import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import styles from "@/styles/components/ConnectAccountsModal.module.css";

type Platform = "tiktok" | "instagram" | "youtube" | "x" | "facebook";

const PLATFORMS: { key: Platform; label: string }[] = [
   { key: "tiktok", label: "TikTok" },
   { key: "instagram", label: "Instagram" },
   { key: "youtube", label: "YouTube" },
   { key: "x", label: "X" },
   { key: "facebook", label: "Facebook" },
];

export default function ConnectAccountsModal({
   isOpen,
   onClose,
}: {
   isOpen: boolean;
   onClose: () => void;
}) {
   const [step, setStep] = useState<"list" | "username">("list");
   const [platform, setPlatform] = useState<Platform | null>(null);
   const [username, setUsername] = useState("");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   if (!isOpen) return null;

   const reset = () => {
      setStep("list");
      setPlatform(null);
      setUsername("");
      setError(null);
   };

   const handleClose = () => {
      reset();
      onClose();
   };

   const save = async () => {
      if (!platform || !username.trim()) return;
      setSaving(true);
      setError(null);
      try {
         const res = await fetch("/api/social/manual-connect", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform, username }),
         });
         const data = await res.json();
         if (!res.ok) {
            setError(data?.error ?? "Failed to save");
            return;
         }
         handleClose();
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.overlay} onClick={handleClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* ---------- STEP 1: PLATFORM LIST ---------- */}
            {step === "list" && (
               <>
                  <div className={styles.header}>
                     <button className={styles.closeBtn} onClick={handleClose}>
                        <X size={14} />
                     </button>
                     <div className={styles.headerTitle}>Choose platform</div>
                  </div>
                  <div className={styles.body}>
                     {PLATFORMS.map((p) => (
                        <button
                           key={p.key}
                           className={styles.row}
                           onClick={() => {
                              setPlatform(p.key);
                              setStep("username");
                           }}
                        >
                           <span className={styles.rowLabel}>{p.label}</span>
                           <span className={styles.rowChevron}>›</span>
                        </button>
                     ))}
                  </div>
               </>
            )}

            {/* ---------- STEP 2: USERNAME ---------- */}
            {step === "username" && platform && (
               <>
                  <div className={styles.header}>
                     <button
                        className={styles.closeBtn}
                        onClick={() => {
                           setStep("list");
                           setPlatform(null);
                           setUsername("");
                           setError(null);
                        }}
                     >
                        <ChevronLeft size={14} />
                     </button>
                     <div className={styles.headerTitle}>Connect accounts</div>
                  </div>
                  <div className={styles.body}>
                     <div className={styles.usernameTitle}>
                        Your {PLATFORMS.find((p) => p.key === platform)?.label}{" "}
                        account
                     </div>
                     <div className={styles.inputWrap}>
                        <span className={styles.inputAt}>@</span>
                        <input
                           className={styles.input}
                           placeholder="Username"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === "Enter") save();
                           }}
                           autoFocus
                        />
                     </div>
                     <div className={styles.helpText}>
                        Type your username or paste a link to your{" "}
                        {PLATFORMS.find((p) => p.key === platform)?.label}{" "}
                        account.
                     </div>
                     {error && <div className={styles.errorBox}>{error}</div>}
                     <button
                        className={styles.submitBtn}
                        onClick={save}
                        disabled={saving || !username.trim()}
                     >
                        {saving ? "Saving…" : "Add"}
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
