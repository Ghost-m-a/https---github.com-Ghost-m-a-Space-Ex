"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
   Check,
   ChevronLeft,
   ChevronRight,
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
   Ban,
   Landmark,
   Briefcase,
   Home as HomeIcon,
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
type Objective = "sales" | "leads" | "engagement" | "traffic" | "awareness";
type BudgetControl = "campaign" | "adgroup";
type BidStrategy = "highest-volume" | "cost-cap" | "bid-cap";
type SpecialAdCategory =
   | "none"
   | "financial-products"
   | "employment"
   | "housing";
type ConversionLocation = "website" | "messages";
type PerformanceGoal =
   | "maximize-conversions"
   | "maximize-conversations"
   | "maximize-clicks";

interface FormState {
   // Step 1
   adFormat: AdFormat;
   objective: Objective;
   title: string;
   subtitle: string;
   category: string;
   budget: number;
   budgetType: "daily" | "lifetime";
   budgetControl: BudgetControl;
   bidStrategy: BidStrategy;
   cpm: number;
   specialAdCategory: SpecialAdCategory;

   // Step 2
   conversionLocation: ConversionLocation;
   conversionEvent: string;
   performanceGoal: PerformanceGoal;
   messageDestinations: string[];
   pageId: string;
   socialProfileId: string;
   globalReach: boolean;
   targetCountries: string[];
   targetLanguages: string[];
   excludedCountries: string[];
   minAge: number;
   maxAge: number;
   autoAudience: boolean;
   autoPlacements: boolean;
   startDate: string;
   endDate: string;
   minDailySpend: number;
   deliveryHours: string[];

   // Step 3
   socials: string[];
   coverImage: string;
   summary: string;
   deliverable: string;
   minFollowers: number;
   minEngagement: number;
   creatorRequirements: string[];
   instructions: string[];
   requirements: string[];
}

// =========================================
// CONSTANTS
// =========================================
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
      key: "sales",
      label: "Sales",
      desc: "Find people likely to purchase your product or service",
      icon: <DollarSign size={18} />,
      color: "#10b981",
   },
   {
      key: "leads",
      label: "Leads",
      desc: "Collect leads for your business or brand",
      icon: <Plus size={18} />,
      color: "#06b6d4",
   },
   {
      key: "engagement",
      label: "Engagement",
      desc: "Get more messages, purchases through messaging, video views",
      icon: <Users size={18} />,
      color: "#8b5cf6",
   },
   {
      key: "traffic",
      label: "Traffic",
      desc: "Send people to a destination, such as your website, app or profile",
      icon: <Globe size={18} />,
      color: "#3b82f6",
   },
   {
      key: "awareness",
      label: "Awareness",
      desc: "Show your ads to people who are most likely to remember them",
      icon: <Sparkles size={18} />,
      color: "#f59e0b",
   },
];

const CONVERSION_EVENTS = [
   "Add payment info",
   "Add to cart",
   "Complete registration",
   "Initiate checkout",
   "Purchase",
   "Start trial",
   "Subscribe",
   "View content",
];

const CONTINENTS: { name: string; countries: string[] }[] = [
   {
      name: "Africa",
      countries: ["Egypt", "Nigeria", "South Africa", "Kenya", "Morocco"],
   },
   {
      name: "Asia",
      countries: ["China", "India", "Japan", "South Korea", "Thailand"],
   },
   {
      name: "Eastern Europe",
      countries: ["Poland", "Romania", "Ukraine", "Czech Republic"],
   },
   {
      name: "Latin America and the Caribbean",
      countries: ["Brazil", "Mexico", "Argentina", "Chile", "Colombia"],
   },
   {
      name: "North America",
      countries: ["United States", "Canada", "Mexico"],
   },
   {
      name: "Oceania (AU, NZ, Pacific Islands)",
      countries: ["Australia", "New Zealand", "Fiji"],
   },
   {
      name: "Western Europe",
      countries: [
         "United Kingdom",
         "Germany",
         "France",
         "Spain",
         "Italy",
         "Netherlands",
      ],
   },
];

// =========================================
// INITIAL STATE
// =========================================
const emptyForm: FormState = {
   adFormat: "feed",
   objective: "sales",
   title: "",
   subtitle: "",
   category: "Entertainment",
   budget: 200,
   budgetType: "daily",
   budgetControl: "campaign",
   bidStrategy: "highest-volume",
   cpm: 1,
   specialAdCategory: "none",

   conversionLocation: "website",
   conversionEvent: "",
   performanceGoal: "maximize-conversions",
   messageDestinations: [],
   pageId: "",
   socialProfileId: "",
   globalReach: true,
   targetCountries: [],
   targetLanguages: [],
   excludedCountries: [],
   minAge: 18,
   maxAge: 65,
   autoAudience: true,
   autoPlacements: true,
   startDate: new Date().toISOString().slice(0, 10),
   endDate: "",
   minDailySpend: 0,
   deliveryHours: [],

   socials: ["youtube", "tiktok"],
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
   const [showCountryPicker, setShowCountryPicker] = useState(false);
   const [countryMode, setCountryMode] = useState<"target" | "exclude">(
      "target",
   );

   const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

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
         if (form.conversionLocation === "website" && !form.conversionEvent) {
            setError("Please choose a conversion event");
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

   const toggleCountry = (country: string) => {
      const key =
         countryMode === "target" ? "targetCountries" : "excludedCountries";
      const list = form[key];
      set(
         key,
         list.includes(country)
            ? list.filter((c) => c !== country)
            : [...list, country],
      );
   };

   const addAllInContinent = (countries: string[]) => {
      const key =
         countryMode === "target" ? "targetCountries" : "excludedCountries";
      const merged = Array.from(new Set([...form[key], ...countries]));
      set(key, merged);
   };

   return (
      <div className={styles.page}>
         {/* Breadcrumb */}
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

         {/* Steps */}
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
                  Creative
               </span>
            </div>
         </div>

         <div className={styles.body}>
            {step === 1 && <StepOne form={form} set={set} />}
            {step === 2 && (
               <StepTwo
                  form={form}
                  set={set}
                  showCountryPicker={showCountryPicker}
                  setShowCountryPicker={setShowCountryPicker}
                  countryMode={countryMode}
                  setCountryMode={setCountryMode}
                  toggleCountry={toggleCountry}
                  addAllInContinent={addAllInContinent}
               />
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
// STEP 1 — Ad setup
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
               What do you want people to do after seeing your ad?
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

         {/* Title */}
         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>
                  Campaign title <span className={styles.req}>*</span>
               </span>
               <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Enter campaign title"
                  maxLength={120}
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

         {/* Advanced options */}
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
                        ad group
                     </div>
                  </div>
                  <select
                     className={styles.select}
                     value={form.budgetControl}
                     onChange={(e) =>
                        set("budgetControl", e.target.value as BudgetControl)
                     }
                  >
                     <option value="campaign">Campaign budget</option>
                     <option value="adgroup">Ad group budgets</option>
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
                        set("bidStrategy", e.target.value as BidStrategy)
                     }
                  >
                     <option value="highest-volume">Highest volume</option>
                     <option value="cost-cap">Cost cap</option>
                     <option value="bid-cap">Bid cap</option>
                  </select>
               </div>
               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>
                        Special ad category
                     </div>
                     <div className={styles.advancedHint}>
                        Required for credit, employment, or housing ads
                     </div>
                  </div>
                  <select
                     className={styles.select}
                     value={form.specialAdCategory}
                     onChange={(e) =>
                        set(
                           "specialAdCategory",
                           e.target.value as SpecialAdCategory,
                        )
                     }
                  >
                     <option value="none">None</option>
                     <option value="financial-products">
                        Financial products and services
                     </option>
                     <option value="employment">Employment</option>
                     <option value="housing">Housing</option>
                  </select>
               </div>
            </div>
         </details>
      </div>
   );
}

// =========================================
// STEP 2 — Default settings
// =========================================
function StepTwo({
   form,
   set,
   showCountryPicker,
   setShowCountryPicker,
   countryMode,
   setCountryMode,
   toggleCountry,
   addAllInContinent,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
   showCountryPicker: boolean;
   setShowCountryPicker: (v: boolean) => void;
   countryMode: "target" | "exclude";
   setCountryMode: (v: "target" | "exclude") => void;
   toggleCountry: (c: string) => void;
   addAllInContinent: (countries: string[]) => void;
}) {
   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Default settings</h2>
         <p className={styles.hint}>These can be changed at any time.</p>

         {/* Conversion location */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Conversion location</div>
            <p className={styles.hint}>
               Choose where you want to drive results.
            </p>
            <div className={styles.locRow}>
               <button
                  type="button"
                  className={`${styles.locCard} ${
                     form.conversionLocation === "website"
                        ? styles.cardActive
                        : ""
                  }`}
                  onClick={() => set("conversionLocation", "website")}
               >
                  <Globe size={16} />
                  <span>Website</span>
               </button>
               <button
                  type="button"
                  className={`${styles.locCard} ${
                     form.conversionLocation === "messages"
                        ? styles.cardActive
                        : ""
                  }`}
                  onClick={() => set("conversionLocation", "messages")}
               >
                  <MessageSquare size={16} />
                  <span>Message destinations</span>
               </button>
            </div>
         </section>

         {form.conversionLocation === "website" && (
            <section className={styles.section}>
               <div className={styles.sectionTitle}>
                  Conversion event <span className={styles.req}>*</span>
               </div>
               <p className={styles.hint}>
                  The action you want people to take when they see your ads.
               </p>
               <select
                  className={styles.select}
                  value={form.conversionEvent}
                  onChange={(e) => set("conversionEvent", e.target.value)}
               >
                  <option value="">Select a conversion event</option>
                  {CONVERSION_EVENTS.map((ev) => (
                     <option key={ev} value={ev}>
                        {ev}
                     </option>
                  ))}
               </select>
            </section>
         )}

         {form.conversionLocation === "messages" && (
            <section className={styles.section}>
               <div className={styles.sectionTitle}>Performance goal</div>
               <select
                  className={styles.select}
                  value={form.performanceGoal}
                  onChange={(e) =>
                     set("performanceGoal", e.target.value as PerformanceGoal)
                  }
               >
                  <option value="maximize-conversions">
                     Maximize number of conversions
                  </option>
                  <option value="maximize-conversations">
                     Maximize number of conversations
                  </option>
               </select>

               <div className={styles.sectionTitle}>
                  Message destinations <span className={styles.req}>*</span>
               </div>
               <div className={styles.checkList}>
                  {[
                     { key: "page_messages", label: "Page messages" },
                     { key: "profile_messages", label: "Profile messages" },
                  ].map((d) => {
                     const checked = form.messageDestinations.includes(d.key);
                     return (
                        <label key={d.key} className={styles.checkRow}>
                           <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                 set(
                                    "messageDestinations",
                                    checked
                                       ? form.messageDestinations.filter(
                                            (x) => x !== d.key,
                                         )
                                       : [...form.messageDestinations, d.key],
                                 )
                              }
                           />
                           <span>{d.label}</span>
                        </label>
                     );
                  })}
               </div>
            </section>
         )}

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
               <div className={styles.countryBlock}>
                  <div className={styles.countryTabs}>
                     <button
                        type="button"
                        className={`${styles.countryTab} ${
                           countryMode === "target"
                              ? styles.countryTabActive
                              : ""
                        }`}
                        onClick={() => setCountryMode("target")}
                     >
                        Target
                     </button>
                     <button
                        type="button"
                        className={`${styles.countryTab} ${
                           countryMode === "exclude"
                              ? styles.countryTabActive
                              : ""
                        }`}
                        onClick={() => setCountryMode("exclude")}
                     >
                        Exclude
                     </button>
                  </div>

                  <div className={styles.searchBlock}>
                     <Search size={14} />
                     <input
                        className={styles.searchInput}
                        placeholder="Search countries, regions, cities, or ZIP codes"
                        onFocus={() => setShowCountryPicker(true)}
                     />
                  </div>

                  {showCountryPicker && (
                     <div className={styles.countryDropdown}>
                        <div className={styles.countryHeader}>Continents</div>
                        {CONTINENTS.map((c) => (
                           <div key={c.name} className={styles.continentRow}>
                              <div className={styles.continentLeft}>
                                 <Globe size={14} />
                                 <span>{c.name}</span>
                              </div>
                              <button
                                 type="button"
                                 className={styles.addAllBtn}
                                 onClick={() => addAllInContinent(c.countries)}
                              >
                                 Add all
                              </button>
                           </div>
                        ))}
                        <div className={styles.countryHeader}>Countries</div>
                        <div className={styles.countryGrid}>
                           {CONTINENTS.flatMap((c) => c.countries).map(
                              (country) => {
                                 const list =
                                    countryMode === "target"
                                       ? form.targetCountries
                                       : form.excludedCountries;
                                 const active = list.includes(country);
                                 return (
                                    <button
                                       key={country}
                                       type="button"
                                       className={`${styles.countryItem} ${
                                          active ? styles.countryItemActive : ""
                                       }`}
                                       onClick={() => toggleCountry(country)}
                                    >
                                       {active && <Check size={12} />}
                                       {country}
                                    </button>
                                 );
                              },
                           )}
                        </div>
                     </div>
                  )}

                  {form[
                     countryMode === "target"
                        ? "targetCountries"
                        : "excludedCountries"
                  ].length > 0 && (
                     <div className={styles.chipList}>
                        {form[
                           countryMode === "target"
                              ? "targetCountries"
                              : "excludedCountries"
                        ].map((c) => (
                           <span key={c} className={styles.chip}>
                              {c}
                              <button
                                 type="button"
                                 onClick={() => toggleCountry(c)}
                              >
                                 <X size={10} />
                              </button>
                           </span>
                        ))}
                     </div>
                  )}
               </div>
            )}

            <div className={styles.autoRow}>
               <div>
                  <div className={styles.autoTitle}>
                     Automatic audience{" "}
                     <span className={styles.recPill}>Recommended</span>
                  </div>
                  <div className={styles.advancedHint}>
                     Let Space-Ex find the best audience for your ads.
                  </div>
               </div>
               <div className={styles.autoRight}>
                  <label className={styles.minAgeLabel}>
                     Minimum age
                     <select
                        className={styles.ageSelect}
                        value={form.minAge}
                        onChange={(e) =>
                           set("minAge", Number(e.target.value) || 18)
                        }
                     >
                        {[13, 16, 18, 21, 25].map((a) => (
                           <option key={a} value={a}>
                              {a}+
                           </option>
                        ))}
                     </select>
                  </label>
                  <button
                     type="button"
                     className={`${styles.switch} ${
                        form.autoAudience ? styles.switchOn : ""
                     }`}
                     onClick={() => set("autoAudience", !form.autoAudience)}
                  >
                     <span className={styles.switchKnob} />
                  </button>
               </div>
            </div>
         </section>

         {/* Placements */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Placements</div>
            <div className={styles.autoRow}>
               <div>
                  <div className={styles.autoTitle}>
                     Automatic placements{" "}
                     <span className={styles.recPill}>Recommended</span>
                  </div>
                  <div className={styles.advancedHint}>
                     Space-Ex will automatically show your ads across the
                     placements most likely to drive the best results.
                  </div>
               </div>
               <button
                  type="button"
                  className={`${styles.switch} ${
                     form.autoPlacements ? styles.switchOn : ""
                  }`}
                  onClick={() => set("autoPlacements", !form.autoPlacements)}
               >
                  <span className={styles.switchKnob} />
               </button>
            </div>
         </section>

         {/* Advanced options */}
         <details className={styles.advanced}>
            <summary className={styles.advancedSummary}>
               Advanced options
            </summary>
            <div className={styles.advancedBody}>
               <div className={styles.advancedTitle}>Schedule</div>
               <div className={styles.scheduleRow}>
                  <label className={styles.field}>
                     <span className={styles.label}>Start</span>
                     <input
                        className={styles.input}
                        type="date"
                        value={form.startDate}
                        onChange={(e) => set("startDate", e.target.value)}
                     />
                  </label>
                  <label className={styles.field}>
                     <span className={styles.label}>
                        <input
                           type="checkbox"
                           checked={!!form.endDate}
                           onChange={(e) =>
                              set(
                                 "endDate",
                                 e.target.checked ? form.startDate : "",
                              )
                           }
                        />{" "}
                        Set an end date
                     </span>
                     <input
                        className={styles.input}
                        type="date"
                        value={form.endDate}
                        disabled={!form.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                     />
                  </label>
               </div>

               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>
                        Minimum daily spend
                     </div>
                     <div className={styles.advancedHint}>
                        Optional spend target for this ad group, not a
                        guarantee.
                     </div>
                  </div>
                  <div className={styles.amountWrap}>
                     <DollarSign size={14} />
                     <input
                        className={styles.amountInput}
                        type="number"
                        min={0}
                        value={form.minDailySpend}
                        onChange={(e) =>
                           set("minDailySpend", Number(e.target.value) || 0)
                        }
                     />
                     <span className={styles.amountSuffix}>/day</span>
                  </div>
               </div>

               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>Audiences</div>
                     <div className={styles.advancedHint}>
                        Target or exclude your audiences.
                     </div>
                  </div>
                  <button
                     type="button"
                     className={styles.btnPrimary}
                     style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                     Create audience
                  </button>
               </div>

               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>Languages</div>
                     <div className={styles.advancedHint}>
                        Leave empty to target all languages
                     </div>
                  </div>
                  <input
                     className={styles.input}
                     placeholder="e.g. English, Spanish"
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           const v = (
                              e.target as HTMLInputElement
                           ).value.trim();
                           if (v && !form.targetLanguages.includes(v)) {
                              set("targetLanguages", [
                                 ...form.targetLanguages,
                                 v,
                              ]);
                              (e.target as HTMLInputElement).value = "";
                           }
                        }
                     }}
                  />
               </div>
            </div>
         </details>
      </div>
   );
}

// =========================================
// STEP 3 — Creative
// =========================================
function StepThree({
   form,
   set,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
   const addChip = (
      key: "creatorRequirements" | "instructions" | "requirements",
      inputId: string,
   ) => {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      if (el && el.value.trim()) {
         set(key, [...form[key], el.value.trim()]);
         el.value = "";
      }
   };

   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Creative brief</h2>
         <p className={styles.hint}>
            Tell creators exactly what you want them to produce.
         </p>

         {/* Cover */}
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
                  placeholder="Explain the campaign in 2–3 sentences."
               />
            </label>
         </section>

         {/* Deliverable */}
         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>Deliverable</span>
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
                           addChip("creatorRequirements", "creatorReq");
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={() =>
                        addChip("creatorRequirements", "creatorReq")
                     }
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         {/* Instructions */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Instructions</div>
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
                           addChip("instructions", "creatorIns");
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={() => addChip("instructions", "creatorIns")}
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         {/* Content requirements */}
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
                           addChip("requirements", "deliverableReq");
                        }
                     }}
                  />
                  <button
                     type="button"
                     className={styles.addBtn}
                     onClick={() => addChip("requirements", "deliverableReq")}
                  >
                     <Plus size={12} /> Add
                  </button>
               </div>
            </div>
         </section>

         <div className={styles.reviewBox}>
            <Info size={14} />
            <div>
               <strong>Review before launch:</strong> Once created, the campaign
               goes live on the Discover page immediately.
            </div>
         </div>
      </div>
   );
}
