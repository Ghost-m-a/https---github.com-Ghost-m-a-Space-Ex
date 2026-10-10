"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
   Check,
   ChevronLeft,
   Layout,
   Play,
   Search,
   MessageSquare,
   Users,
   Globe,
   DollarSign,
   Sparkles,
   Info,
   Plus,
   X,
   Upload,
   Trash2,
   Loader2,
   Link as LinkIcon,
   GripVertical,
   Star,
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
type CTAType =
   | "learn-more"
   | "shop-now"
   | "sign-up"
   | "subscribe"
   | "download"
   | "contact-us"
   | "get-offer"
   | "book-now"
   | "watch-more";

interface MediaAsset {
   url: string;
   type: "image" | "video";
   name?: string;
   size?: number;
   thumbnail?: string;
}

interface SocialPage {
   _id: string;
   platform: string;
   name: string;
   username: string;
   avatar: string;
   verified: boolean;
}

interface SavedAudience {
   _id: string;
   name: string;
}

interface FormState {
   adFormat: AdFormat;
   objective: Objective;
   title: string;
   subtitle: string;
   budget: number;
   budgetType: "daily" | "lifetime";
   budgetControl: BudgetControl;
   bidStrategy: BidStrategy;
   bidCapAmount: number;
   cpm: number;
   specialAdCategory: SpecialAdCategory;

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
   audienceId: string;
   startDate: string;
   endDate: string;
   minDailySpend: number;
   deliveryHours: string[];

   headline: string;
   primaryText: string;
   ctaType: CTAType;
   ctaUrl: string;
   mediaAssets: MediaAsset[];

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

// ---- Constants (same as before) ----
const AD_FORMATS = [
   {
      key: "feed" as AdFormat,
      label: "Feed ads",
      desc: "Images and videos in feeds, stories and short clips",
      icon: <Layout size={18} />,
   },
   {
      key: "short-video" as AdFormat,
      label: "Short video ads",
      desc: "Full-screen videos and swipeable images",
      icon: <Play size={18} />,
   },
   {
      key: "search-display" as AdFormat,
      label: "Search & display ads",
      desc: "Search results, discovery feeds and video placements",
      icon: <Search size={18} />,
   },
   {
      key: "text-feed" as AdFormat,
      label: "Text feed ads",
      desc: "Posts in conversation feeds",
      icon: <MessageSquare size={18} />,
   },
   {
      key: "community" as AdFormat,
      label: "Community ads",
      desc: "Posts in community feeds",
      icon: <Users size={18} />,
   },
];

const OBJECTIVES = [
   {
      key: "sales" as Objective,
      label: "Sales",
      desc: "Find people likely to purchase your product or service",
      icon: <DollarSign size={18} />,
      color: "#10b981",
   },
   {
      key: "leads" as Objective,
      label: "Leads",
      desc: "Collect leads for your business or brand",
      icon: <Plus size={18} />,
      color: "#06b6d4",
   },
   {
      key: "engagement" as Objective,
      label: "Engagement",
      desc: "Get more messages, purchases through messaging, video views",
      icon: <Users size={18} />,
      color: "#8b5cf6",
   },
   {
      key: "traffic" as Objective,
      label: "Traffic",
      desc: "Send people to a destination like your website or profile",
      icon: <Globe size={18} />,
      color: "#3b82f6",
   },
   {
      key: "awareness" as Objective,
      label: "Awareness",
      desc: "Show your ads to people most likely to remember them",
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

const CTA_OPTIONS: { key: CTAType; label: string }[] = [
   { key: "learn-more", label: "Learn more" },
   { key: "shop-now", label: "Shop now" },
   { key: "sign-up", label: "Sign up" },
   { key: "subscribe", label: "Subscribe" },
   { key: "download", label: "Download" },
   { key: "contact-us", label: "Contact us" },
   { key: "get-offer", label: "Get offer" },
   { key: "book-now", label: "Book now" },
   { key: "watch-more", label: "Watch more" },
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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm: FormState = {
   adFormat: "feed",
   objective: "sales",
   title: "",
   subtitle: "",
   budget: 200,
   budgetType: "daily",
   budgetControl: "campaign",
   bidStrategy: "highest-volume",
   bidCapAmount: 0,
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
   audienceId: "",
   startDate: new Date().toISOString().slice(0, 10),
   endDate: "",
   minDailySpend: 0,
   deliveryHours: [],

   headline: "",
   primaryText: "",
   ctaType: "learn-more",
   ctaUrl: "",
   mediaAssets: [],

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
   const searchParams = useSearchParams();
   const [step, setStep] = useState(1);
   const [form, setForm] = useState<FormState>(emptyForm);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const [socialPages, setSocialPages] = useState<SocialPage[]>([]);
   const [audiences, setAudiences] = useState<SavedAudience[]>([]);
   const [newAudienceModal, setNewAudienceModal] = useState(false);
   const [oauthToast, setOauthToast] = useState<string | null>(null);

   const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

   const reloadPages = () => {
      fetch("/api/social/pages", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setSocialPages(d.pages ?? []))
         .catch(() => {});
   };

   useEffect(() => {
      reloadPages();
      fetch("/api/business/audiences", { credentials: "include" })
         .then((r) => r.json())
         .then((d) => setAudiences(d.audiences ?? []))
         .catch(() => {});
   }, []);

   // Handle OAuth return
   useEffect(() => {
      const connected = searchParams.get("connected");
      const err = searchParams.get("error");
      if (connected) {
         setOauthToast(`Connected ${connected} successfully`);
         reloadPages();
         setTimeout(() => setOauthToast(null), 3000);
      }
      if (err) {
         setOauthToast(`OAuth failed: ${err}`);
         setTimeout(() => setOauthToast(null), 4000);
      }
   }, [searchParams]);

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
         if (form.bidStrategy !== "highest-volume" && form.bidCapAmount <= 0) {
            setError("Enter a cap amount for the selected bid strategy");
            return;
         }
      }
      if (step === 2) {
         if (form.conversionLocation === "website" && !form.conversionEvent) {
            setError("Please choose a conversion event");
            return;
         }
      }
      if (step === 3) {
         if (!form.headline.trim()) {
            setError("Ad headline is required");
            return;
         }
      }
      setError(null);
      setStep((s) => Math.min(4, s + 1));
   };

   const back = () => {
      setError(null);
      setStep((s) => Math.max(1, s - 1));
   };

   const submit = async () => {
      setSubmitting(true);
      setError(null);
      try {
         const payload = {
            ...form,
            coverImage:
               form.mediaAssets.find((a) => a.type === "image")?.url ??
               form.mediaAssets[0]?.url ??
               form.coverImage,
         };
         const res = await fetch("/api/business/campaigns", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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

         <div className={styles.steps}>
            {[1, 2, 3, 4].map((n) => (
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
               <span className={step >= 4 ? styles.labelActive : ""}>
                  Brief
               </span>
            </div>
         </div>

         <div className={styles.body}>
            {step === 1 && <StepOne form={form} set={set} />}
            {step === 2 && (
               <StepTwo
                  form={form}
                  set={set}
                  socialPages={socialPages}
                  audiences={audiences}
                  onCreateAudience={() => setNewAudienceModal(true)}
                  onPagesRefresh={reloadPages}
               />
            )}
            {step === 3 && <StepThree form={form} set={set} />}
            {step === 4 && <StepFour form={form} set={set} />}
         </div>

         {error && <div className={styles.errorBox}>{error}</div>}
         {oauthToast && <div className={styles.toastBox}>{oauthToast}</div>}

         <div className={styles.footer}>
            {step > 1 && (
               <button className={styles.btnGhost} onClick={back}>
                  Back
               </button>
            )}
            <div className={styles.footerSpacer} />
            {step < 4 ? (
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

         {newAudienceModal && (
            <NewAudienceModal
               onClose={() => setNewAudienceModal(false)}
               onCreated={(a) => {
                  setAudiences((prev) => [a, ...prev]);
                  set("audienceId", a._id);
                  setNewAudienceModal(false);
               }}
            />
         )}
      </div>
   );
}

// =========================================
// STEP 1 — with bid-cap input
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
         </section>

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

               {/* ---- Conditional bid cap amount ---- */}
               {form.bidStrategy !== "highest-volume" && (
                  <div className={styles.advancedRow}>
                     <div>
                        <div className={styles.advancedTitle}>
                           {form.bidStrategy === "cost-cap"
                              ? "Cost per result cap"
                              : "Maximum bid"}
                        </div>
                        <div className={styles.advancedHint}>
                           {form.bidStrategy === "cost-cap"
                              ? "Average cost you're willing to pay per result."
                              : "Highest amount you'll bid in each auction."}
                        </div>
                     </div>
                     <div className={styles.amountWrap}>
                        <DollarSign size={14} />
                        <input
                           className={styles.amountInput}
                           type="number"
                           min={0.01}
                           step="0.1"
                           value={form.bidCapAmount}
                           onChange={(e) =>
                              set("bidCapAmount", Number(e.target.value) || 0)
                           }
                        />
                        <span className={styles.amountSuffix}>
                           {form.bidStrategy === "cost-cap"
                              ? "per result"
                              : "max bid"}
                        </span>
                     </div>
                  </div>
               )}

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
// STEP 2 — with OAuth connect buttons
// =========================================
function StepTwo({
   form,
   set,
   socialPages,
   audiences,
   onCreateAudience,
   onPagesRefresh,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
   socialPages: SocialPage[];
   audiences: SavedAudience[];
   onCreateAudience: () => void;
   onPagesRefresh: () => void;
}) {
   const [showCountryPicker, setShowCountryPicker] = useState(false);
   const [countryMode, setCountryMode] = useState<"target" | "exclude">(
      "target",
   );

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
      set(key, Array.from(new Set([...form[key], ...countries])));
   };

   const toggleHour = (dayIdx: number, hour: number) => {
      const key = `${DAYS[dayIdx].toLowerCase()}-${hour
         .toString()
         .padStart(2, "0")}`;
      const has = form.deliveryHours.includes(key);
      set(
         "deliveryHours",
         has
            ? form.deliveryHours.filter((h) => h !== key)
            : [...form.deliveryHours, key],
      );
   };

   const toggleRow = (dayIdx: number) => {
      const day = DAYS[dayIdx].toLowerCase();
      const all = Array.from(
         { length: 24 },
         (_, h) => `${day}-${h.toString().padStart(2, "0")}`,
      );
      const allSelected = all.every((h) => form.deliveryHours.includes(h));
      set(
         "deliveryHours",
         allSelected
            ? form.deliveryHours.filter((h) => !h.startsWith(`${day}-`))
            : Array.from(new Set([...form.deliveryHours, ...all])),
      );
   };

   const filteredPages = socialPages.filter((p) =>
      form.socials.length === 0 ? true : form.socials.includes(p.platform),
   );

   const connectProvider = (provider: "meta" | "google" | "tiktok") => {
      // Full-page redirect — simpler than popup for cross-origin OAuth
      window.location.href = `/api/social/connect/${provider}`;
   };

   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Default settings</h2>
         <p className={styles.hint}>These can be changed at any time.</p>

         {/* ---- Conversion location ---- */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Conversion location</div>
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
                  <option value="maximize-conversations">
                     Maximize number of conversations
                  </option>
                  <option value="maximize-conversions">
                     Maximize number of conversions
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

         {/* ---- Pages + Connect buttons ---- */}
         <section className={styles.section}>
            <div className={styles.twoCol}>
               <label className={styles.field}>
                  <span className={styles.sectionTitle}>
                     Page <span className={styles.req}>*</span>
                  </span>
                  <select
                     className={styles.select}
                     value={form.pageId}
                     onChange={(e) => set("pageId", e.target.value)}
                  >
                     <option value="">Select a page…</option>
                     {filteredPages.map((p) => (
                        <option key={p._id} value={p._id}>
                           {p.name}
                           {p.verified ? " ✓" : ""} · {p.platform}
                        </option>
                     ))}
                  </select>
               </label>
               <label className={styles.field}>
                  <span className={styles.sectionTitle}>
                     Social profile{" "}
                     <span className={styles.optTag}>optional</span>
                  </span>
                  <select
                     className={styles.select}
                     value={form.socialProfileId}
                     onChange={(e) => set("socialProfileId", e.target.value)}
                  >
                     <option value="">No connected social profile</option>
                     {filteredPages.map((p) => (
                        <option key={p._id} value={p._id}>
                           @{p.username || p.name} · {p.platform}
                        </option>
                     ))}
                  </select>
               </label>
            </div>

            <div className={styles.connectRow}>
               <span className={styles.connectLabel}>
                  Connect your pages and profiles:
               </span>
               <button
                  type="button"
                  className={styles.connectBtn}
                  onClick={() => connectProvider("meta")}
               >
                  <span
                     className={styles.providerDot}
                     style={{ background: "#1877F2" }}
                  />
                  Meta
               </button>
               <button
                  type="button"
                  className={styles.connectBtn}
                  onClick={() => connectProvider("google")}
               >
                  <span
                     className={styles.providerDot}
                     style={{ background: "#ff0000" }}
                  />
                  Google / YouTube
               </button>
               <button
                  type="button"
                  className={styles.connectBtn}
                  onClick={() => connectProvider("tiktok")}
               >
                  <span
                     className={styles.providerDot}
                     style={{ background: "#fff" }}
                  />
                  TikTok
               </button>
               <button
                  type="button"
                  className={styles.refreshBtn}
                  onClick={onPagesRefresh}
               >
                  Refresh
               </button>
            </div>
         </section>

         {/* ---- Targeting ---- */}
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

         {/* ---- Placements ---- */}
         <section className={styles.section}>
            <div className={styles.sectionTitle}>Placements</div>
            <div className={styles.autoRow}>
               <div>
                  <div className={styles.autoTitle}>
                     Automatic placements{" "}
                     <span className={styles.recPill}>Recommended</span>
                  </div>
                  <div className={styles.advancedHint}>
                     Space-Ex will show your ads across the placements most
                     likely to drive the best results.
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

         {/* ---- Advanced ---- */}
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

               <div className={styles.advancedTitle}>Delivery hours</div>
               <p className={styles.advancedHint}>
                  Click any cell to toggle. Click day name to select whole row.
                  Empty = 24/7.
               </p>
               <div className={styles.gridWrap}>
                  <div className={styles.gridHeader}>
                     <div />
                     {Array.from({ length: 24 }, (_, h) => (
                        <div key={h} className={styles.gridHour}>
                           {h.toString().padStart(2, "0")}
                        </div>
                     ))}
                  </div>
                  {DAYS.map((day, di) => (
                     <div key={day} className={styles.gridRow}>
                        <button
                           type="button"
                           className={styles.gridDayBtn}
                           onClick={() => toggleRow(di)}
                        >
                           {day}
                        </button>
                        {Array.from({ length: 24 }, (_, h) => {
                           const key = `${day.toLowerCase()}-${h
                              .toString()
                              .padStart(2, "0")}`;
                           const on = form.deliveryHours.includes(key);
                           return (
                              <button
                                 key={h}
                                 type="button"
                                 className={`${styles.gridCell} ${
                                    on ? styles.gridCellOn : ""
                                 }`}
                                 onClick={() => toggleHour(di, h)}
                                 title={`${day} ${h}:00`}
                              />
                           );
                        })}
                     </div>
                  ))}
                  {form.deliveryHours.length > 0 && (
                     <button
                        type="button"
                        className={styles.clearGrid}
                        onClick={() => set("deliveryHours", [])}
                     >
                        Clear selection
                     </button>
                  )}
               </div>

               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>Audiences</div>
                     <div className={styles.advancedHint}>
                        Pick a saved audience or create a new one.
                     </div>
                  </div>
                  <div className={styles.audienceControls}>
                     <select
                        className={styles.select}
                        value={form.audienceId}
                        onChange={(e) => set("audienceId", e.target.value)}
                     >
                        <option value="">None</option>
                        {audiences.map((a) => (
                           <option key={a._id} value={a._id}>
                              {a.name}
                           </option>
                        ))}
                     </select>
                     <button
                        type="button"
                        className={styles.btnPrimary}
                        style={{ padding: "8px 12px", fontSize: 12 }}
                        onClick={onCreateAudience}
                     >
                        Create audience
                     </button>
                  </div>
               </div>

               <div className={styles.advancedRow}>
                  <div>
                     <div className={styles.advancedTitle}>
                        Minimum daily spend
                     </div>
                     <div className={styles.advancedHint}>
                        Optional spend target, not a guarantee.
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
// STEP 3 — with drag-and-drop + video thumbnails
// =========================================
function StepThree({
   form,
   set,
}: {
   form: FormState;
   set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
   const [uploading, setUploading] = useState(false);
   const [uploadError, setUploadError] = useState<string | null>(null);
   const dragIndex = useRef<number | null>(null);
   const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

   // ---- Extract a poster frame from a video file ----
   const extractVideoPoster = (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
         try {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            const url = URL.createObjectURL(file);
            video.src = url;

            const cleanup = () => URL.revokeObjectURL(url);

            video.onloadedmetadata = () => {
               // Seek to 1 second (or 10% of duration if shorter)
               video.currentTime = Math.min(1, video.duration * 0.1 || 0.5);
            };

            video.onseeked = () => {
               try {
                  const canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) {
                     cleanup();
                     resolve(null);
                     return;
                  }
                  ctx.drawImage(video, 0, 0);
                  canvas.toBlob(
                     (blob) => {
                        if (!blob) {
                           cleanup();
                           resolve(null);
                           return;
                        }
                        // Upload the poster as a file
                        const posterFile = new File(
                           [blob],
                           `poster-${Date.now()}.jpg`,
                           { type: "image/jpeg" },
                        );
                        uploadSingle(posterFile)
                           .then((res) => {
                              cleanup();
                              resolve(res?.url ?? null);
                           })
                           .catch(() => {
                              cleanup();
                              resolve(null);
                           });
                     },
                     "image/jpeg",
                     0.85,
                  );
               } catch {
                  cleanup();
                  resolve(null);
               }
            };

            video.onerror = () => {
               cleanup();
               resolve(null);
            };
         } catch {
            resolve(null);
         }
      });
   };

   const uploadSingle = async (
      file: File,
   ): Promise<{ url: string; type: "image" | "video" } | null> => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
         method: "POST",
         body: fd,
         credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
   };

   const handleFiles = async (files: FileList) => {
      setUploadError(null);
      setUploading(true);
      try {
         const uploaded: MediaAsset[] = [];
         for (const file of Array.from(files)) {
            // 1. Upload the media
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", {
               method: "POST",
               body: fd,
               credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
               setUploadError(data?.error ?? "Upload failed");
               continue;
            }

            // 2. For videos, extract a poster and upload it too
            let thumbnail = "";
            if (file.type.startsWith("video/")) {
               const poster = await extractVideoPoster(file);
               if (poster) thumbnail = poster;
            }

            uploaded.push({
               url: data.url,
               type: data.type,
               name: data.name,
               size: data.size,
               thumbnail,
            });
         }
         set("mediaAssets", [...form.mediaAssets, ...uploaded]);
      } catch {
         setUploadError("Upload failed");
      } finally {
         setUploading(false);
      }
   };

   const removeAsset = (url: string) => {
      set(
         "mediaAssets",
         form.mediaAssets.filter((a) => a.url !== url),
      );
   };

   // ---- Drag & drop reorder ----
   const onDragStart = (i: number) => {
      dragIndex.current = i;
   };

   const onDragOver = (e: React.DragEvent, i: number) => {
      e.preventDefault();
      setDragOverIndex(i);
   };

   const onDragLeave = () => {
      setDragOverIndex(null);
   };

   const onDrop = (e: React.DragEvent, i: number) => {
      e.preventDefault();
      const from = dragIndex.current;
      dragIndex.current = null;
      setDragOverIndex(null);
      if (from === null || from === i) return;

      const next = [...form.mediaAssets];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      set("mediaAssets", next);
   };

   const onDragEnd = () => {
      dragIndex.current = null;
      setDragOverIndex(null);
   };

   const makeCover = (i: number) => {
      if (i === 0) return;
      const next = [...form.mediaAssets];
      const [moved] = next.splice(i, 1);
      next.unshift(moved);
      set("mediaAssets", next);
   };

   return (
      <div className={styles.formColumn}>
         <h2 className={styles.h2}>Ad creative</h2>
         <p className={styles.hint}>
            This is what people see in the feed. Be specific — creators follow
            your brief.
         </p>

         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>
                  Headline <span className={styles.req}>*</span>
               </span>
               <input
                  className={styles.input}
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Short, punchy hook (max 40 chars)"
                  maxLength={40}
               />
            </label>
         </section>

         <section className={styles.section}>
            <label className={styles.field}>
               <span className={styles.sectionTitle}>Primary text</span>
               <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.primaryText}
                  onChange={(e) => set("primaryText", e.target.value)}
                  placeholder="Body copy that appears above the media."
                  maxLength={500}
               />
               <span className={styles.charCount}>
                  {form.primaryText.length} / 500
               </span>
            </label>
         </section>

         <section className={styles.section}>
            <div className={styles.twoCol}>
               <label className={styles.field}>
                  <span className={styles.sectionTitle}>Call to action</span>
                  <select
                     className={styles.select}
                     value={form.ctaType}
                     onChange={(e) => set("ctaType", e.target.value as CTAType)}
                  >
                     {CTA_OPTIONS.map((c) => (
                        <option key={c.key} value={c.key}>
                           {c.label}
                        </option>
                     ))}
                  </select>
               </label>
               <label className={styles.field}>
                  <span className={styles.sectionTitle}>Destination URL</span>
                  <div className={styles.urlWrap}>
                     <LinkIcon size={14} />
                     <input
                        className={styles.urlInput}
                        value={form.ctaUrl}
                        onChange={(e) => set("ctaUrl", e.target.value)}
                        placeholder="https://example.com/landing"
                        type="url"
                     />
                  </div>
               </label>
            </div>
         </section>

         <section className={styles.section}>
            <div className={styles.sectionTitle}>Media assets</div>
            <p className={styles.hint}>
               Drag to reorder. The first image becomes the campaign cover.
            </p>

            <div className={styles.assetGrid}>
               {form.mediaAssets.map((a, i) => {
                  const isCover = i === 0;
                  const isDraggingOver = dragOverIndex === i;
                  return (
                     <div
                        key={a.url}
                        className={`${styles.assetCard} ${
                           isDraggingOver ? styles.assetCardHover : ""
                        }`}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragOver={(e) => onDragOver(e, i)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, i)}
                        onDragEnd={onDragEnd}
                     >
                        {a.type === "image" ? (
                           <img src={a.url} alt="" />
                        ) : a.thumbnail ? (
                           <img src={a.thumbnail} alt="" />
                        ) : (
                           <video src={a.url} muted />
                        )}

                        {/* Drag handle */}
                        <div className={styles.assetHandle}>
                           <GripVertical size={12} />
                        </div>

                        {/* Cover badge */}
                        {isCover && (
                           <div className={styles.coverBadge}>
                              <Star size={10} /> Cover
                           </div>
                        )}

                        {/* Set cover button (only if not first) */}
                        {!isCover && (
                           <button
                              type="button"
                              className={styles.setCoverBtn}
                              onClick={() => makeCover(i)}
                              title="Set as cover"
                           >
                              <Star size={12} />
                           </button>
                        )}

                        {/* Remove */}
                        <button
                           type="button"
                           className={styles.assetRemove}
                           onClick={() => removeAsset(a.url)}
                        >
                           <Trash2 size={12} />
                        </button>

                        <div className={styles.assetBadge}>{a.type}</div>
                     </div>
                  );
               })}

               <label
                  className={`${styles.assetUpload} ${
                     uploading ? styles.assetUploading : ""
                  }`}
               >
                  {uploading ? (
                     <Loader2 size={20} className={styles.spin} />
                  ) : (
                     <>
                        <Upload size={20} />
                        <span>Upload</span>
                     </>
                  )}
                  <input
                     type="file"
                     multiple
                     accept="image/*,video/mp4,video/webm"
                     hidden
                     disabled={uploading}
                     onChange={(e) => {
                        if (e.target.files?.length) {
                           handleFiles(e.target.files);
                           e.target.value = "";
                        }
                     }}
                  />
               </label>
            </div>

            {uploadError && (
               <div className={styles.errorInline}>{uploadError}</div>
            )}
         </section>

         {form.headline && (
            <section className={styles.section}>
               <div className={styles.sectionTitle}>Preview</div>
               <div className={styles.previewCard}>
                  {form.mediaAssets[0] && (
                     <div className={styles.previewMedia}>
                        {form.mediaAssets[0].type === "image" ? (
                           <img src={form.mediaAssets[0].url} alt="" />
                        ) : (
                           <video
                              src={form.mediaAssets[0].url}
                              muted
                              autoPlay
                              loop
                           />
                        )}
                     </div>
                  )}
                  <div className={styles.previewBody}>
                     <div className={styles.previewHeadline}>
                        {form.headline}
                     </div>
                     {form.primaryText && (
                        <div className={styles.previewText}>
                           {form.primaryText}
                        </div>
                     )}
                     {form.ctaUrl && (
                        <a
                           href={form.ctaUrl}
                           className={styles.previewCta}
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           {CTA_OPTIONS.find((c) => c.key === form.ctaType)
                              ?.label ?? "Learn more"}
                        </a>
                     )}
                  </div>
               </div>
            </section>
         )}
      </div>
   );
}

// =========================================
// STEP 4 — Creator brief
// =========================================
function StepFour({
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
         <h2 className={styles.h2}>Creator brief</h2>
         <p className={styles.hint}>
            Tell creators exactly what you want them to produce.
         </p>

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
               goes live on Discover immediately.
            </div>
         </div>
      </div>
   );
}

// =========================================
// NEW AUDIENCE MODAL
// =========================================
function NewAudienceModal({
   onClose,
   onCreated,
}: {
   onClose: () => void;
   onCreated: (a: SavedAudience) => void;
}) {
   const [name, setName] = useState("");
   const [desc, setDesc] = useState("");
   const [saving, setSaving] = useState(false);

   const save = async () => {
      if (!name.trim()) return;
      setSaving(true);
      try {
         const res = await fetch("/api/business/audiences", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description: desc }),
         });
         const data = await res.json();
         if (res.ok && data.audience) onCreated(data.audience);
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className={styles.modalOverlay} onClick={onClose}>
         <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
               <span>New audience</span>
               <button onClick={onClose}>
                  <X size={16} />
               </button>
            </div>
            <label className={styles.field}>
               <span className={styles.label}>Name</span>
               <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. US Gamers 18-24"
               />
            </label>
            <label className={styles.field}>
               <span className={styles.label}>Description</span>
               <textarea
                  className={styles.textarea}
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
               />
            </label>
            <div className={styles.modalFooter}>
               <button className={styles.btnGhost} onClick={onClose}>
                  Cancel
               </button>
               <button
                  className={styles.btnPrimary}
                  onClick={save}
                  disabled={saving || !name.trim()}
               >
                  {saving ? "Saving…" : "Create"}
               </button>
            </div>
         </div>
      </div>
   );
}
