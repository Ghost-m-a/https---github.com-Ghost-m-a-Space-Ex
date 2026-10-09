"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/pages/campaign-new.module.css";

type Platform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

const PLATFORMS: { key: Platform; label: string; color: string }[] = [
   { key: "youtube", label: "YouTube", color: "#ff0000" },
   { key: "tiktok", label: "TikTok", color: "#000" },
   { key: "instagram", label: "Instagram", color: "#E1306C" },
   { key: "x", label: "X", color: "#000" },
   { key: "facebook", label: "Facebook", color: "#1877F2" },
];

export default function NewCampaignPage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();

   const [title, setTitle] = useState("");
   const [subtitle, setSubtitle] = useState("");
   const [category, setCategory] = useState("Entertainment");
   const [coverImage, setCoverImage] = useState("");
   const [budget, setBudget] = useState(1000);
   const [cpm, setCpm] = useState(1);
   const [duration, setDuration] = useState("1mo");
   const [summary, setSummary] = useState("");
   const [requirements, setRequirements] = useState<string[]>([
      "Share the provided content on your social accounts",
      "Keep the content clean and on-brand",
   ]);
   const [newReq, setNewReq] = useState("");
   const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
      "youtube",
      "tiktok",
   ]);
   const [platformRates, setPlatformRates] = useState<
      Record<Platform, { minViews: number; maxViews: number; cpm: number }>
   >({
      youtube: { minViews: 1000, maxViews: 1000000, cpm: 1 },
      tiktok: { minViews: 1000, maxViews: 1000000, cpm: 1 },
      instagram: { minViews: 1000, maxViews: 1000000, cpm: 1 },
      x: { minViews: 1000, maxViews: 1000000, cpm: 1 },
      facebook: { minViews: 1000, maxViews: 1000000, cpm: 1 },
   });
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   const togglePlatform = (p: Platform) => {
      setSelectedPlatforms((prev) =>
         prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
      );
   };

   const addRequirement = () => {
      if (newReq.trim()) {
         setRequirements([...requirements, newReq.trim()]);
         setNewReq("");
      }
   };

   const removeRequirement = (i: number) => {
      setRequirements(requirements.filter((_, idx) => idx !== i));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeBusiness?.id) {
         setError("No active business");
         return;
      }
      if (!title.trim()) {
         setError("Title required");
         return;
      }
      if (budget <= 0) {
         setError("Budget must be positive");
         return;
      }

      setSaving(true);
      setError("");

      try {
         const res = await fetch("/api/business/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               title,
               subtitle,
               category,
               coverImage,
               budget,
               cpm,
               duration,
               summary,
               socials: selectedPlatforms,
               requirements,
               instructions: [],
               platformRates: selectedPlatforms.map((p) => ({
                  platform: p,
                  minViews: platformRates[p].minViews,
                  maxViews: platformRates[p].maxViews,
                  cpm: platformRates[p].cpm,
               })),
            }),
         });

         const d = await res.json();
         if (!res.ok) {
            setError(d.error || "Failed to create");
            return;
         }

         router.push(`/business/campaigns`);
      } catch {
         setError("Network error");
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h1 className={styles.title}>New Campaign</h1>
            <button className={styles.cancelBtn} onClick={() => router.back()}>
               <X size={14} /> Cancel
            </button>
         </div>

         <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid2}>
               {/* LEFT */}
               <div className={styles.col}>
                  <div className={styles.card}>
                     <div className={styles.cardTitle}>Campaign Details</div>

                     <div className={styles.field}>
                        <label className={styles.label}>Title *</label>
                        <input
                           className={styles.input}
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           required
                        />
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Subtitle</label>
                        <input
                           className={styles.input}
                           value={subtitle}
                           onChange={(e) => setSubtitle(e.target.value)}
                        />
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Category</label>
                        <select
                           className={styles.input}
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                        >
                           <option>Entertainment</option>
                           <option>Gaming</option>
                           <option>Music</option>
                           <option>Business</option>
                           <option>Sports</option>
                           <option>Comedy</option>
                           <option>Education</option>
                        </select>
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Cover image URL</label>
                        <input
                           className={styles.input}
                           value={coverImage}
                           onChange={(e) => setCoverImage(e.target.value)}
                           placeholder="https://images.unsplash.com/..."
                        />
                        <div className={styles.hint}>
                           Paste an image URL or leave blank to use a
                           placeholder
                        </div>
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Summary</label>
                        <textarea
                           className={styles.textarea}
                           value={summary}
                           onChange={(e) => setSummary(e.target.value)}
                           placeholder="Describe what creators should do..."
                           rows={4}
                        />
                     </div>
                  </div>

                  <div className={styles.card}>
                     <div className={styles.cardTitle}>Budget & Rates</div>

                     <div className={styles.grid2Inner}>
                        <div className={styles.field}>
                           <label className={styles.label}>
                              Total budget (USD) *
                           </label>
                           <input
                              className={styles.input}
                              type="number"
                              value={budget}
                              onChange={(e) =>
                                 setBudget(Number(e.target.value))
                              }
                              min="1"
                              required
                           />
                        </div>

                        <div className={styles.field}>
                           <label className={styles.label}>
                              Default CPM (per 1000 views)
                           </label>
                           <input
                              className={styles.input}
                              type="number"
                              value={cpm}
                              onChange={(e) => setCpm(Number(e.target.value))}
                              step="0.1"
                              min="0.1"
                           />
                        </div>
                     </div>

                     <div className={styles.field}>
                        <label className={styles.label}>Duration</label>
                        <select
                           className={styles.input}
                           value={duration}
                           onChange={(e) => setDuration(e.target.value)}
                        >
                           <option>3d</option>
                           <option>1w</option>
                           <option>2w</option>
                           <option>1mo</option>
                           <option>3mo</option>
                           <option>6mo</option>
                        </select>
                     </div>
                  </div>
               </div>

               {/* RIGHT */}
               <div className={styles.col}>
                  <div className={styles.card}>
                     <div className={styles.cardTitle}>Platforms</div>
                     <div className={styles.platformsGrid}>
                        {PLATFORMS.map((p) => {
                           const active = selectedPlatforms.includes(p.key);
                           return (
                              <button
                                 key={p.key}
                                 type="button"
                                 className={`${styles.platformBtn} ${active ? styles.platformBtnActive : ""}`}
                                 onClick={() => togglePlatform(p.key)}
                                 style={active ? { borderColor: p.color } : {}}
                              >
                                 <span
                                    className={styles.platformDot}
                                    style={{ background: p.color }}
                                 />
                                 {p.label}
                                 {active && <Check size={12} />}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* Per-platform rates */}
                  {selectedPlatforms.length > 0 && (
                     <div className={styles.card}>
                        <div className={styles.cardTitle}>Per-platform CPM</div>
                        {selectedPlatforms.map((p) => (
                           <div key={p} className={styles.rateRow}>
                              <div className={styles.rateName}>
                                 <span
                                    style={{
                                       color: PLATFORMS.find((x) => x.key === p)
                                          ?.color,
                                    }}
                                 >
                                    ●
                                 </span>{" "}
                                 {PLATFORMS.find((x) => x.key === p)?.label}
                              </div>
                              <div className={styles.rateInputs}>
                                 <div className={styles.rateInput}>
                                    <label>Min</label>
                                    <input
                                       type="number"
                                       value={platformRates[p].minViews}
                                       onChange={(e) =>
                                          setPlatformRates({
                                             ...platformRates,
                                             [p]: {
                                                ...platformRates[p],
                                                minViews: Number(
                                                   e.target.value,
                                                ),
                                             },
                                          })
                                       }
                                    />
                                 </div>
                                 <div className={styles.rateInput}>
                                    <label>Max</label>
                                    <input
                                       type="number"
                                       value={platformRates[p].maxViews}
                                       onChange={(e) =>
                                          setPlatformRates({
                                             ...platformRates,
                                             [p]: {
                                                ...platformRates[p],
                                                maxViews: Number(
                                                   e.target.value,
                                                ),
                                             },
                                          })
                                       }
                                    />
                                 </div>
                                 <div className={styles.rateInput}>
                                    <label>CPM ($)</label>
                                    <input
                                       type="number"
                                       step="0.1"
                                       value={platformRates[p].cpm}
                                       onChange={(e) =>
                                          setPlatformRates({
                                             ...platformRates,
                                             [p]: {
                                                ...platformRates[p],
                                                cpm: Number(e.target.value),
                                             },
                                          })
                                       }
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  <div className={styles.card}>
                     <div className={styles.cardTitle}>
                        Content Requirements
                     </div>
                     <div className={styles.reqList}>
                        {requirements.map((r, i) => (
                           <div key={i} className={styles.reqItem}>
                              <span>{r}</span>
                              <button
                                 type="button"
                                 onClick={() => removeRequirement(i)}
                              >
                                 <X size={12} />
                              </button>
                           </div>
                        ))}
                     </div>
                     <div className={styles.addReqRow}>
                        <input
                           className={styles.input}
                           value={newReq}
                           onChange={(e) => setNewReq(e.target.value)}
                           placeholder="Add a requirement"
                           onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                 e.preventDefault();
                                 addRequirement();
                              }
                           }}
                        />
                        <button
                           type="button"
                           className={styles.addReqBtn}
                           onClick={addRequirement}
                        >
                           <Plus size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.footer}>
               <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={saving}
               >
                  {saving ? "Creating..." : "Create Campaign"}
               </button>
            </div>
         </form>
      </div>
   );
}
