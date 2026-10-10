"use client";

import { useState } from "react";
import { X, Loader2, Link as LinkIcon } from "lucide-react";
import styles from "@/styles/components/SubmitContentModal.module.css";

interface Props {
   isOpen: boolean;
   onClose: () => void;
   campaignId: string;
   campaignTitle: string;
   defaultPlatform?: string;
   onSubmitted?: () => void;
}

const PLATFORMS = [
   { key: "tiktok", label: "TikTok" },
   { key: "instagram", label: "Instagram" },
   { key: "youtube", label: "YouTube" },
   { key: "x", label: "X" },
   { key: "facebook", label: "Facebook" },
];

export default function SubmitContentModal({
   isOpen,
   onClose,
   campaignId,
   campaignTitle,
   defaultPlatform = "tiktok",
   onSubmitted,
}: Props) {
   const [platform, setPlatform] = useState(defaultPlatform);
   const [videoUrl, setVideoUrl] = useState("");
   const [views, setViews] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   if (!isOpen) return null;

   const submit = async () => {
      setError(null);
      const viewsNum = Number(views);
      if (!videoUrl.trim()) {
         setError("Video URL is required");
         return;
      }
      if (!viewsNum || viewsNum <= 0) {
         setError("Views must be a positive number");
         return;
      }

      setSubmitting(true);
      try {
         const res = await fetch("/api/user/submissions", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               campaignId,
               platform,
               videoUrl: videoUrl.trim(),
               views: viewsNum,
            }),
         });
         const data = await res.json();
         if (!res.ok) {
            setError(data?.error ?? "Failed to submit");
            return;
         }
         setVideoUrl("");
         setViews("");
         onSubmitted?.();
         onClose();
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
               <div>
                  <div className={styles.title}>Submit content</div>
                  <div className={styles.subtitle}>{campaignTitle}</div>
               </div>
               <button className={styles.closeBtn} onClick={onClose}>
                  <X size={16} />
               </button>
            </div>

            <div className={styles.body}>
               <label className={styles.field}>
                  <span className={styles.label}>Platform</span>
                  <div className={styles.platformRow}>
                     {PLATFORMS.map((p) => (
                        <button
                           key={p.key}
                           type="button"
                           className={`${styles.platformChip} ${
                              platform === p.key ? styles.platformActive : ""
                           }`}
                           onClick={() => setPlatform(p.key)}
                        >
                           {p.label}
                        </button>
                     ))}
                  </div>
               </label>

               <label className={styles.field}>
                  <span className={styles.label}>Video URL</span>
                  <div className={styles.urlWrap}>
                     <LinkIcon size={14} />
                     <input
                        className={styles.input}
                        placeholder="https://www.tiktok.com/@you/video/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        type="url"
                     />
                  </div>
               </label>

               <label className={styles.field}>
                  <span className={styles.label}>
                     Current views on this post
                  </span>
                  <input
                     className={styles.input}
                     placeholder="e.g. 45000"
                     value={views}
                     onChange={(e) => setViews(e.target.value)}
                     type="number"
                     min={1}
                  />
                  <span className={styles.hint}>
                     Business will verify and approve before you get paid.
                  </span>
               </label>

               {error && <div className={styles.errorBox}>{error}</div>}
            </div>

            <div className={styles.footer}>
               <button
                  className={styles.btnGhost}
                  onClick={onClose}
                  disabled={submitting}
               >
                  Cancel
               </button>
               <button
                  className={styles.btnPrimary}
                  onClick={submit}
                  disabled={submitting}
               >
                  {submitting ? (
                     <>
                        <Loader2 size={14} className={styles.spin} />{" "}
                        Submitting…
                     </>
                  ) : (
                     "Submit"
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
