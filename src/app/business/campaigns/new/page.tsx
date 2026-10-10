"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
   Check,
   ChevronLeft,
   Image as ImageIcon,
   Layout,
   Play,
   Search,
   MessageSquare,
   Users,
   Globe,
   DollarSign,
   Target,
   TrendingUp,
   Sparkles,
   Info,
   Plus,
   X,
} from "lucide-react";
import styles from "@/styles/pages/campaign-new.module.css";

// =========================================
// TYPES
// =========================================
type AdFormat =
   | "feed"
   | "short-video"
   | "search-display"
   | "text-feed"
   | "community";
type Objective =
   | "views"
   | "comments"
   | "shares"
   | "subscribes"
   | "follows"
   | "engagement"
   | "sales"
   | "leads"
   | "traffic"
   | "awareness";
type Platform = "youtube" | "tiktok" | "instagram" | "x" | "facebook";

interface FormState {
   // Step 1
   adFormat: AdFormat;
   objective: Objective;
   title: string;
   subtitle: string;
   category: string;
   budget: number;
   budgetType: "daily" | "lifetime";
   bidStrategy: "highest-volume" | "cost-cap" | "manual";
   cpm: number;

   // Step 2
   socials: Platform[];
   platform: Platform | "multi";
   globalReach: boolean;
   targetCountries: string[];
   targetLanguages: string[];
   minAge: number;
   maxAge: number;
   startDate: string;
   endDate: string;

   // Step 3
   coverImage: string;
   summary: string;
   deliverable: string;
   minFollowers: number;
   minEngagement: number;
   creatorRequirements: string[];
   instructions: string[];
   requirements: string[];
}

const AD_FORMATS: {
   key: AdFormat;
   label: string;
   desc: string;
   icon: React.ReactNode;
}[] = [
   {
      key: "feed",
      label: "Feed ads",
      desc: "Images and videos in feeds, stories and short clips",
      icon: <Layout size={18} />,
   },
   {
      key: "short-video",
      label: "Short video ads",
      desc: "Full-screen videos and swipeable images",
      icon: <Play size={18} />,
   },
   {
      key: "search-display",
      label: "Search & display ads",
      desc: "Search results, discovery feeds and video placements",
      icon: <Search size={18} />,
   },
   {
      key: "text-feed",
      label: "Text feed ads",
      desc: "Posts in conversation feeds",
      icon: <MessageSquare size={18} />,
   },
   {
      key: "community",
      label: "Community ads",
      desc: "Posts in community feeds",
      icon: <Users size={18} />,
   },
];

const OBJECTIVES: {
   key: Objective;
   label: string;
   desc: string;
   icon: React.ReactNode;
   color: string;
}[] = [
   {
      key: "views",
      label: "Views",
      desc: "Maximize impressions on creator content",
      icon: <TrendingUp size={18} />,
      color: "#10b981",
   },
   {
      key: "engagement",
      label: "Engagement",
      desc: "Likes, saves, comments, shares",
      icon: <Sparkles size={18} />,
      color: "#8b5cf6",
   },
   {
      key: "subscribes",
      label: "Subscribes",
      desc: "Grow your channel subscribers",
      icon: <Users size={18} />,
      color: "#3b82f6",
   },
   {
      key: "follows",
      label: "Follows",
      desc: "Grow your social following",
      icon: <Users size={18} />,
      color: "#06b6d4",
   },
   {
      key: "traffic",
      label: "Traffic",
      desc: "Send people to a destination",
      icon: <Globe size={18} />,
      color: "#f59e0b",
   },
   {
      key: "awareness",
      label: "Awareness",
      desc: "Reach people most likely to remember you",
      icon: <Target size={18} />,
      color: "#ef4444",
   },
];

const PLATFORMS: { key: Platform; label: string; color: string }[] = [
   { key: "youtube", label: "YouTube", color: "#ff0000" },
   { key: "tiktok", label: "TikTok", color: "#ffffff" },
   { key: "instagram", label: "Instagram", color: "#E1306C" },
   { key: "x", label: "X", color: "#ffffff" },
   { key: "facebook", label: "Facebook", color: "#1877F2" },
];

const emptyForm: FormState = {
   adFormat: "feed",
   objective: "views",
   title: "",
   subtitle: "",
   category: "Entertainment",
   budget: 200,
   budgetType: "daily",
   bidStrategy: "highest-volume",
   cpm: 1,

   socials: ["youtube", "tiktok"],
   platform: "multi",
   globalReach: true,
   targetCountries: ["United States"],
   targetLanguages: ["English"],
   minAge: 18,
   maxAge: 65,
   startDate: new Date().toISOString().slice(0, 10),
   endDate: "",

   coverImage: "",
   summary: "",
   deliverable: "1 short-form video, 30–60 seconds",
   minFollowers: 1000,
   minEngagement: 0,
   creatorRequirements: [],
   instructions: [],
   requirements: [],
};

// =========================================
// PAGE
// =========================================
export default function NewCampaignPage() {
   const router = useRouter();
   const [step, setStep] = useState(1);
   const [form, setForm] = useState<FormState>(emptyForm);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

   const toggleSocial = (p: Platform) => {
      setForm((f) => {
         const has = f.socials.includes(p);
         const socials = has
            ? f.socials.filter((s) => s !== p)
            : [...f.socials, p];
         return {
            ...f,
            socials,
            platform: socials.length === 1 ? socials[0] : "multi",
         };
      });
   };

   const next = () => {
      if (step === 1) {
         if (!form.title.trim()) {
            setError("Campaign title is required");
            return;
         }
         if (form.budget <= 0) {
            setError("Budget must be greater than 0");
            return;
         }
      }
      if (step === 2) {
         if (form.socials.length === 0) {
            setError("Select at least one platform");
            return;
         }
      }
      setError(null);
      setStep((s) => Math.min(3, s + 1));
   };

   const back = () => {
      setError(null);
      setStep((s) => Math.max(1, s - 1));
   };

   const submit = async () => {
      setSubmitting(true);
      setError(null);
      try {
         const res = await fetch("/api/business/campaigns", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
         });
         const data = await res.json().catch(() => ({}));
         if (!res.ok) {
            setError(data?.error ?? "Failed to create campaign");
            setSubmitting(false);
            return;
         }
         router.push("/business/campaigns");
      } catch {
         setError("Network error");
         setSubmitting(false);
      }
   };

   return (
      <div className={styles.page}>
         {/* Header / breadcrumb */}
         <div className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/campaigns")}
            >
               <ChevronLeft size={16} />
            </button>
            <div className={styles.crumbs}>
               <span className={styles.crumb}>Campaign</span>
               <span className={styles.crumbSep}>›</span>
               <span className={styles.crumbActive}>Build</span>
            </div>
         </div>

         {/* Step indicators */}
         <div className={styles.steps}>
            {[1, 2, 3].map((n) => (
               <div
                  key={n}
                  className={`${styles.stepDot} ${
                     step >= n ? styles.stepDotActive : ""
                  }`}
               >
                  {step > n ? <Check size={12} /> : n}
               </div>
            ))}
            <div className={styles.stepLabels}>
               <span className={step >= 1 ? styles.labelActive : ""}>
                  Ad setup
               </span>
               <span className={step >= 2 ? styles.labelActive : ""}>
                  Audience
               </span>
               <span className={step >= 3 ? styles.labelActive : ""}>
                  Creative brief
               </span>
            </div>
         </div>

         <div className={styles.body}>
            {step === 1 && <StepOne form={form} set={set} />}
            {step === 2 && (
               <StepTwo form={form} set={set} toggleSocial={toggleSocial} />
            )}
            {step === 3 && <StepThree form={form} set={set} />}
         </div>

         {error && <div className={styles.errorBox}>{error}</div>}

         <div className={styles.footer}>
            {step > 1 && (
               <button className={styles.btnGhost} onClick={back}>
                  Back
               </button>
            )}
            <div className={styles.footerSpacer} />
            {step < 3 ? (
               <button className={styles.btnPrimary} onClick={next}>
                  Next
               </button>
            ) : (
               <button
                  className={styles.btnPrimary}
                  onClick={submit}
                  disabled={submitting}
               >
                  {submitting ? "Launching…" : "Launch campaign"}
               </button>
            )}
         </div>
      </div>
   );
}

// =========================================
// STEP 1 — Ad format, objective, title, budget
// =========================================
function StepOne({
   form,
   set,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Ad setup</h2>

         {/* Ad format */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>
               Ad format <span className={styles.req}>*</span>
            </div>
            <p className={styles.hint}>
               Choose how people discover your business.
            </p>
            <div className={styles.formatGrid}>
               {AD_FORMATS.map((f) => (
                  <button
                     key={f.key}
                     type="button"
                     className={`${styles.formatCard} ${
                        form.adFormat === f.key ? styles.cardActive : ""
                     }`}
                     onClick={() => set("adFormat", f.key)}
                  >
                     <div className={styles.formatIcon}>{f.icon}</div>
                     <div className={styles.formatLabel}>{f.label}</div>
                     <div className={styles.formatDesc}>{f.desc}</div>
                  </button>
               ))}
            </div>
         </section>

         {/* Objective */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>
               Campaign objective <span className={styles.req}>*</span>
            </div>
            <p className={styles.hint}>
               What do you want creators to help you achieve?
            </p>
            <div className={styles.objectiveGrid}>
               {OBJECTIVES.map((o) => (
                  <button
                     key={o.key}
                     type="button"
                     className={`${styles.objCard} ${
                        form.objective === o.key ? styles.cardActive : ""
                     }`}
                     onClick={() => set("objective", o.key)}
                     style={
                        form.objective === o.key
                           ? { borderColor: o.color }
                           : undefined
                     }
                  >
                     <div className={styles.objIcon} style={{ color: o.color }}>
                        {o.icon}
                     </div>
                     <div className={styles.formatLabel}>{o.label}</div>
                     <div className={styles.formatDesc}>{o.desc}</div>
                  </button>
               ))}
            </div>
         </section>

         {/* Title + subtitle */}
         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>
                  Campaign title <span className={styles.req}>*</span>
               </span>
               <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Review our new headphones"
                  maxLength={120}
               />
            </label>
            <label className={styles.field}>
               <span className={styles.label}>Subtitle</span>
               <input
                  className={styles.input}
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder="Short one-liner for the card"
                  maxLength={140}
               />
            </label>
            <label className={styles.field}>
               <span className={styles.label}>Category</span>
               <input
                  className={styles.input}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Tech, Fitness, Beauty, Gaming…"
               />
            </label>
         </section>

         {/* Budget */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>
               Budget <span className={styles.req}>*</span>
            </div>
            <div className={styles.budgetRow}>
               <select
                  className={styles.select}
                  value={form.budgetType}
                  onChange={(e) =>
                     set("budgetType", e.target.value as "daily" | "lifetime")
                  }
               >
                  <option value="daily">Daily</option>
                  <option value="lifetime">Lifetime</option>
               </select>
               <div className={styles.amountWrap}>
                  <DollarSign size={14} />
                  <input
                     className={styles.amountInput}
                     type="number"
                     min={1}
                     value={form.budget}
                     onChange={(e) =>
                        set("budget", Number(e.target.value) || 0)
                     }
                  />
                  <span className={styles.amountSuffix}>
                     /{form.budgetType === "daily" ? "day" : "total"}
                  </span>
               </div>
            </div>
            <div className={styles.presets}>
               {[200, 1000, 5000].map((n) => (
                  <button
                     key={n}
                     type="button"
                     className={styles.preset}
                     onClick={() => set("budget", n)}
                  >
                     ${n.toLocaleString()}/
                     {form.budgetType === "daily" ? "day" : "total"}
                  </button>
               ))}
            </div>

            <div className={styles.field}>
               <span className={styles.label}>Reward rate (per 1k)</span>
               <div className={styles.amountWrap}>
                  <DollarSign size={14} />
                  <input
                     className={styles.amountInput}
                     type="number"
                     step="0.1"
                     min={0.01}
                     value={form.cpm}
                     onChange={(e) => set("cpm", Number(e.target.value) || 0)}
                  />
                  <span className={styles.amountSuffix}>
                     /1k {form.objective}
                  </span>
               </div>
            </div>
         </section>

         {/* Advanced */}
         <details className={styles.advanced}>
            <summary className={styles.advancedSummary}>
               Advanced options
            </summary>
            <div className={styles.advancedBody}>
               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>Budget control</div>
                     <div className={styles.advancedHint}>
                        Split one campaign budget automatically, or set one per
                        ad group.
                     </div>
                  </div>
                  <select className={styles.select}>
                     <option>Campaign budget</option>
                     <option>Ad group budget</option>
                  </select>
               </div>
               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>Bid strategy</div>
                     <div className={styles.advancedHint}>
                        How Space-Ex spends your budget
                     </div>
                  </div>
                  <select
                     className={styles.select}
                     value={form.bidStrategy}
                     onChange={(e) =>
                        set(
                           "bidStrategy",
                           e.target.value as
                              | "highest-volume"
                              | "cost-cap"
                              | "manual",
                        )
                     }
                  >
                     <option value="highest-volume">Highest volume</option>
                     <option value="cost-cap">Cost per result cap</option>
                     <option value="manual">Manual</option>
                  </select>
               </div>
            </div>
         </details>
      </div>
   );
}

// =========================================
// STEP 2 — Platforms, audience, schedule
// =========================================
function StepTwo({
   form,
   set,
   toggleSocial,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
   toggleSocial: (p: Platform) => void;
}) {
   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Audience & platforms</h2>

         {/* Platforms */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>
               Platforms <span className={styles.req}>*</span>
            </div>
            <p className={styles.hint}>
               Where should creators post their content?
            </p>
            <div className={styles.platformRow}>
               {PLATFORMS.map((p) => {
                  const active = form.socials.includes(p.key);
                  return (
                     <button
                        key={p.key}
                        type="button"
                        className={`${styles.platformChip} ${
                           active ? styles.platformActive : ""
                        }`}
                        onClick={() => toggleSocial(p.key)}
                     >
                        <span
                           className={styles.platformDot}
                           style={{ background: p.color }}
                        />
                        {p.label}
                     </button>
                  );
               })}
            </div>
         </section>

         {/* Targeting */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>
               Targeting <span className={styles.req}>*</span>
            </div>

            <div className={styles.toggleRow}>
               <div className={styles.toggleLeft}>
                  <Globe size={16} />
                  <span>Global reach</span>
               </div>
               <button
                  type="button"
                  className={`${styles.switch} ${
                     form.globalReach ? styles.switchOn : ""
                  }`}
                  onClick={() => set("globalReach", !form.globalReach)}
               >
                  <span className={styles.switchKnob} />
               </button>
            </div>

            {!form.globalReach && (
               <div className={styles.chipInput}>
                  <span className={styles.chipLabel}>Countries</span>
                  <div className={styles.chipList}>
                     {form.targetCountries.map((c) => (
                        <span key={c} className={styles.chip}>
                           {c}
                           <button
                              type="button"
                              onClick={() =>
                                 set(
                                    "targetCountries",
                                    form.targetCountries.filter((x) => x !== c),
                                 )
                              }
                           >
                              <X size={10} />
                           </button>
                        </span>
                     ))}
                     <input
                        className={styles.chipAdd}
                        placeholder="Add country + Enter"
                        onKeyDown={(e) => {
                           if (e.key === "Enter") {
                              const v = (
                                 e.currentTarget as HTMLInputElement
                              ).value.trim();
                              if (v && !form.targetCountries.includes(v)) {
                                 set("targetCountries", [
                                    ...form.targetCountries,
                                    v,
                                 ]);
                                 (e.currentTarget as HTMLInputElement).value =
                                    "";
                              }
                           }
                        }}
                     />
                  </div>
               </div>
            )}

            <div className={styles.ageRow}>
               <span className={styles.label}>Age range</span>
               <div className={styles.ageInputs}>
                  <input
                     className={styles.ageInput}
                     type="number"
                     min={13}
                     value={form.minAge}
                     onChange={(e) =>
                        set("minAge", Number(e.target.value) || 13)
                     }
                  />
                  <span>–</span>
                  <input
                     className={styles.ageInput}
                     type="number"
                     min={13}
                     max={99}
                     value={form.maxAge}
                     onChange={(e) =>
                        set("maxAge", Number(e.target.value) || 99)
                     }
                  />
               </div>
            </div>
         </section>

         {/* Schedule */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Schedule</div>
            <div className={styles.scheduleRow}>
               <label className={styles.field}>
                  <span className={styles.label}>Start date</span>
                  <input
                     className={styles.input}
                     type="date"
                     value={form.startDate}
                     onChange={(e) => set("startDate", e.target.value)}
                  />
               </label>
               <label className={styles.field}>
                  <span className={styles.label}>End date (optional)</span>
                  <input
                     className={styles.input}
                     type="date"
                     value={form.endDate}
                     onChange={(e) => set("endDate", e.target.value)}
                  />
               </label>
            </div>
         </section>
      </div>
   );
}

// =========================================
// STEP 3 — Creative brief for creators
// =========================================
function StepThree({
   form,
   set,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
   const addRequirement = () => {
      const el = document.getElementById(
         "creatorReq",
      ) as HTMLInputElement | null;
      if (el && el.value.trim()) {
         set("creatorRequirements", [
            ...form.creatorRequirements,
            el.value.trim(),
         ]);
         el.value = "";
      }
   };
   const addInstruction = () => {
      const el = document.getElementById(
         "creatorIns",
      ) as HTMLInputElement | null;
      if (el && el.value.trim()) {
         set("instructions", [...form.instructions, el.value.trim()]);
         el.value = "";
      }
   };
   const addDeliverableReq = () => {
      const el = document.getElementById(
         "deliverableReq",
      ) as HTMLInputElement | null;
      if (el && el.value.trim()) {
         set("requirements", [...form.requirements, el.value.trim()]);
         el.value = "";
      }
   };

   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Creative brief</h2>
         <p className={styles.hint}>
            Tell creators exactly what you want them to produce.
         </p>

         {/* Cover image */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Cover image</div>
            <div className={styles.coverRow}>
               {form.coverImage ? (
                  <img
                     src={form.coverImage}
                     alt="cover"
                     className={styles.coverPreview}
                  />
               ) : (
                  <div className={styles.coverPlaceholder}>
                     <ImageIcon size={24} />
                  </div>
               )}
               <input
                  className={styles.input}
                  placeholder="https://… paste image URL"
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
               />
            </div>
         </section>

         {/* Summary */}
         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>Summary</span>
               <textarea
                  className={styles.textarea}
                  rows={3}
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="Explain the campaign in 2–3 sentences. What's the product? What's the vibe you want creators to capture?"
               />
            </label>
         </section>

         {/* Deliverable */}
         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>
                  Deliverable <span className={styles.req}>*</span>
               </span>
               <input
                  className={styles.input}
                  value={form.deliverable}
                  onChange={(e) => set("deliverable", e.target.value)}
                  placeholder='e.g. "1 short-form video, 30–60s, vertical"'
               />
            </label>
         </section>

         {/* Creator requirements */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Creator requirements</div>
            <p className={styles.hint}>
               Minimum thresholds a creator must meet before joining.
            </p>
            <div className={styles.minRow}>
               <label className={styles.field}>
                  <span className={styles.label}>Min followers</span>
                  <input
                     className={styles.input}
                     type="number"
                     min={0}
                     value={form.minFollowers}
                     onChange={(e) =>
                        set("minFollowers", Number(e.target.value) || 0)
                     }
                  />
               </label>
               <label className={styles.field}>
                  <span className={styles.label}>Min engagement (%)</span>
                  <input
                     className={styles.input}
                     type="number"
                     step="0.1"
                     min={0}
                     value={form.minEngagement}
                     onChange={(e) =>
                        set("minEngagement", Number(e.target.value) || 0)
                     }
                  />
               </label>
            </div>

            <div className={styles.chipInput}>
               <span className={styles.chipLabel}>Additional requirements</span>
               <div className={styles.chipList}>
                  {form.creatorRequirements.map((r, i) => (
                     <span key={i} className={styles.chip}>
                        {r}
                        <button
                           type="button"
                           onClick={() =>
                              set(
                                 "creatorRequirements",
                                 form.creatorRequirements.filter(
                                    (_, idx) => idx !== i,
                                 ),
                              )
                           }
                        >
                           <X size={10} />
                        </button>
                     </span>
                  ))}
                  <input
                     id="creatorReq"
                     className={styles.chipAdd}
                     placeholder="e.g. Tier 1 audience + Enter"
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           e.preventDefault();
                           addRequirement();
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={addRequirement}
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         {/* Instructions */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Instructions</div>
            <p className={styles.hint}>
               Step-by-step for how the creator should approach the content.
            </p>
            <div className={styles.chipInput}>
               <div className={styles.chipList}>
                  {form.instructions.map((r, i) => (
                     <span key={i} className={styles.chip}>
                        {r}
                        <button
                           type="button"
                           onClick={() =>
                              set(
                                 "instructions",
                                 form.instructions.filter(
                                    (_, idx) => idx !== i,
                                 ),
                              )
                           }
                        >
                           <X size={10} />
                        </button>
                     </span>
                  ))}
                  <input
                     id="creatorIns"
                     className={styles.chipAdd}
                     placeholder="e.g. Use the provided footage + Enter"
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           e.preventDefault();
                           addInstruction();
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={addInstruction}
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         {/* Content requirements (also shown to creators) */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Content requirements</div>
            <div className={styles.chipInput}>
               <div className={styles.chipList}>
                  {form.requirements.map((r, i) => (
                     <span key={i} className={styles.chip}>
                        {r}
                        <button
                           type="button"
                           onClick={() =>
                              set(
                                 "requirements",
                                 form.requirements.filter(
                                    (_, idx) => idx !== i,
                                 ),
                              )
                           }
                        >
                           <X size={10} />
                        </button>
                     </span>
                  ))}
                  <input
                     id="deliverableReq"
                     className={styles.chipAdd}
                     placeholder="e.g. Original voiceover + Enter"
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           e.preventDefault();
                           addDeliverableReq();
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={addDeliverableReq}
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         {/* Review box */}
         <div className={styles.reviewBox}>
            <Info size={14} />
            <div>
               <strong>Review before launch:</strong> Once created, the campaign
               will go live on the Discover page immediately.
            </div>
         </div>
      </div>
   );
}
