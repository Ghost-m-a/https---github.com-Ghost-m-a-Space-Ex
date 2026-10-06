"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, ChevronDown, Check } from "lucide-react";
import { useWorkspace } from "../../../context/workspace-context";
import styles from "./create.module.css";

type Step = "campaign" | "build";

const PLATFORMS = [
   { key: "facebook", label: "Facebook", color: "#1877F2", icon: "📘" },
   { key: "tiktok", label: "TikTok", color: "#000", icon: "🎵" },
   { key: "google", label: "Google", color: "#4285F4", icon: "🔍" },
   { key: "x", label: "X", color: "#000", icon: "𝕏" },
   { key: "reddit", label: "Reddit", color: "#FF4500", icon: "👽" },
];

const OBJECTIVES = [
   { key: "sales", label: "Sales", icon: "💰", color: "#10b981" },
   { key: "leads", label: "Leads", icon: "🎯", color: "#3b82f6" },
   { key: "engagement", label: "Engagement", icon: "💬", color: "#8b5cf6" },
   { key: "traffic", label: "Traffic", icon: "🚀", color: "#06b6d4" },
   { key: "awareness", label: "Awareness", icon: "📣", color: "#f59e0b" },
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

export default function CreateCampaignPage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [step, setStep] = useState<Step>("campaign");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   // Campaign settings
   const [platform, setPlatform] = useState("facebook");
   const [objective, setObjective] = useState("sales");
   const [title, setTitle] = useState("");
   const [budgetAmount, setBudgetAmount] = useState(0);
   const [budgetType, setBudgetType] = useState<"daily" | "lifetime">("daily");
   const [budgetControl, setBudgetControl] = useState<"campaign" | "ad_group">(
      "campaign",
   );
   const [bidStrategy, setBidStrategy] = useState<
      "highest_volume" | "cost_cap" | "bid_cap"
   >("highest_volume");
   const [specialAdCategory, setSpecialAdCategory] = useState<
      "none" | "financial" | "employment" | "housing"
   >("none");
   const [advancedOpen, setAdvancedOpen] = useState(false);
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);

   // Build step
   const [conversionLocation, setConversionLocation] = useState<
      "website" | "message_destinations"
   >("website");
   const [conversionEvent, setConversionEvent] = useState("");
   const [advantagePlacements, setAdvantagePlacements] = useState(true);
   const [advantageAudience, setAdvantageAudience] = useState(true);
   const [minAge, setMinAge] = useState(18);
   const [countries, setCountries] = useState<string[]>(["United States"]);
   const [countryInput, setCountryInput] = useState("");
   const [facebookPage, setFacebookPage] = useState("");
   const [instagramAccount, setInstagramAccount] = useState("");
   const [performanceGoal, setPerformanceGoal] = useState(
      "maximize_conversions",
   );

   const nextStep = () => {
      if (!title.trim()) {
         setError("Please enter a campaign title");
         return;
      }
      if (!budgetAmount || budgetAmount <= 0) {
         setError("Please enter a valid budget");
         return;
      }
      setError("");
      setStep("build");
   };

   const handleCreate = async () => {
      if (!activeBusiness?.id) {
         setError("No active business");
         return;
      }
      setSaving(true);
      setError("");

      try {
         const res = await fetch("/api/business/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               platform,
               objective,
               title,
               budgetType,
               budgetAmount,
               budgetControl,
               bidStrategy,
               specialAdCategory,
               conversionLocation,
               conversionEvent,
               advantagePlacements,
               advantageAudience,
               minAge,
               countries,
               facebookPage,
               instagramAccount,
               performanceGoal,
            }),
         });

         const data = await res.json();
         if (!res.ok) {
            setError(data.error || "Failed to create campaign");
            return;
         }
         router.push("/business/ads");
         router.refresh();
      } catch {
         setError("Network error");
      } finally {
         setSaving(false);
      }
   };

   const addCountry = () => {
      const v = countryInput.trim();
      if (v && !countries.includes(v)) {
         setCountries([...countries, v]);
         setCountryInput("");
      }
   };

   const removeCountry = (c: string) => {
      setCountries(countries.filter((x) => x !== c));
   };

   return (
      <div className={styles.page}>
         {/* Header */}
         <header className={styles.header}>
            <button className={styles.closeBtn} onClick={() => router.back()}>
               <X size={16} />
            </button>
            <div className={styles.headerTitle}>Create campaign</div>
            <div className={styles.stepper}>
               <div
                  className={`${styles.step} ${step === "campaign" ? styles.stepActive : styles.stepDone}`}
               >
                  {step === "build" ? (
                     <Check size={12} />
                  ) : (
                     <span className={styles.stepDot} />
                  )}
                  Campaign
               </div>
               <ChevronRight size={14} className={styles.stepSep} />
               <div
                  className={`${styles.step} ${step === "build" ? styles.stepActive : ""}`}
               >
                  <span className={styles.stepDot} />
                  Build
               </div>
            </div>
            <div style={{ width: 32 }} />
         </header>

         {/* Body */}
         <div className={styles.body}>
            {error && <div className={styles.error}>{error}</div>}

            {step === "campaign" && (
               <div className={styles.content}>
                  {/* Platform */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Platform <span className={styles.req}>*</span>
                     </label>
                     <p className={styles.hint}>
                        Where do you want to run this campaign?
                     </p>
                     <div className={styles.platformGrid}>
                        {PLATFORMS.map((p) => (
                           <button
                              key={p.key}
                              className={`${styles.platformBtn} ${platform === p.key ? styles.platformBtnActive : ""}`}
                              onClick={() => setPlatform(p.key)}
                           >
                              <span className={styles.platformIcon}>
                                 {p.icon}
                              </span>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Objective */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Campaign objective <span className={styles.req}>*</span>
                     </label>
                     <p className={styles.hint}>
                        What do you want people to do after seeing your ad?
                     </p>
                     <div className={styles.objectiveGrid}>
                        {OBJECTIVES.map((o) => (
                           <button
                              key={o.key}
                              className={`${styles.objectiveBtn} ${objective === o.key ? styles.objectiveBtnActive : ""}`}
                              onClick={() => setObjective(o.key)}
                              style={
                                 objective === o.key
                                    ? { borderColor: o.color }
                                    : {}
                              }
                           >
                              <span
                                 className={styles.objectiveIcon}
                                 style={{
                                    background: `${o.color}20`,
                                    color: o.color,
                                 }}
                              >
                                 {o.icon}
                              </span>
                              <span>{o.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Title */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Campaign title <span className={styles.req}>*</span>
                     </label>
                     <input
                        className={styles.input}
                        placeholder="Enter campaign title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                     />
                  </div>

                  {/* Budget */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Budget <span className={styles.req}>*</span>
                     </label>
                     <div className={styles.budgetRow}>
                        <select
                           className={styles.budgetSelect}
                           value={budgetType}
                           onChange={(e) =>
                              setBudgetType(
                                 e.target.value as "daily" | "lifetime",
                              )
                           }
                        >
                           <option value="daily">Daily</option>
                           <option value="lifetime">Lifetime</option>
                        </select>
                        <span className={styles.currencySymbol}>$</span>
                        <input
                           type="number"
                           className={styles.budgetInput}
                           value={budgetAmount || ""}
                           onChange={(e) =>
                              setBudgetAmount(Number(e.target.value) || 0)
                           }
                           placeholder="0"
                           min={0}
                        />
                        <span className={styles.budgetSuffix}>
                           /{budgetType === "daily" ? "day" : "total"}
                        </span>
                     </div>
                     <div className={styles.presetsRow}>
                        {[200, 1000, 5000].map((p) => (
                           <button
                              key={p}
                              className={styles.presetBtn}
                              onClick={() => setBudgetAmount(p)}
                           >
                              ${p.toLocaleString()}/
                              {budgetType === "daily" ? "day" : "total"}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Advanced options */}
                  <div className={styles.advancedSection}>
                     <button
                        className={styles.advancedToggle}
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                     >
                        <ChevronDown
                           size={14}
                           style={{
                              transform: advancedOpen
                                 ? "rotate(180deg)"
                                 : "rotate(0)",
                              transition: "transform 0.2s",
                           }}
                        />
                        Advanced options
                     </button>

                     {advancedOpen && (
                        <div className={styles.advancedContent}>
                           {/* Budget control */}
                           <div className={styles.advRow}>
                              <div>
                                 <div className={styles.advTitle}>
                                    Budget control
                                 </div>
                                 <div className={styles.advSub}>
                                    Split one campaign budget automatically, or
                                    set one per ad group
                                 </div>
                              </div>
                              <div className={styles.dropdownWrap}>
                                 <button
                                    className={styles.dropdownBtn}
                                    onClick={() =>
                                       setOpenDropdown(
                                          openDropdown === "budget"
                                             ? null
                                             : "budget",
                                       )
                                    }
                                 >
                                    {budgetControl === "campaign"
                                       ? "Campaign budget"
                                       : "Ad group budgets"}
                                    <ChevronDown size={14} />
                                 </button>
                                 {openDropdown === "budget" && (
                                    <div className={styles.dropdownMenu}>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setBudgetControl("campaign");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {budgetControl === "campaign" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Campaign budget
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                One budget, split automatically
                                                across ad groups
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setBudgetControl("ad_group");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {budgetControl === "ad_group" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Ad group budgets
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Set a separate budget for each
                                                ad group
                                             </div>
                                          </div>
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Bid strategy */}
                           <div className={styles.advRow}>
                              <div>
                                 <div className={styles.advTitle}>
                                    Bid strategy
                                 </div>
                                 <div className={styles.advSub}>
                                    How Meta spends your budget
                                 </div>
                              </div>
                              <div className={styles.dropdownWrap}>
                                 <button
                                    className={styles.dropdownBtn}
                                    onClick={() =>
                                       setOpenDropdown(
                                          openDropdown === "bid" ? null : "bid",
                                       )
                                    }
                                 >
                                    {bidStrategy === "highest_volume" &&
                                       "Highest volume"}
                                    {bidStrategy === "cost_cap" && "Cost cap"}
                                    {bidStrategy === "bid_cap" && "Bid cap"}
                                    <ChevronDown size={14} />
                                 </button>
                                 {openDropdown === "bid" && (
                                    <div className={styles.dropdownMenu}>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setBidStrategy("highest_volume");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {bidStrategy ===
                                                "highest_volume" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Highest volume
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Get the most results for your
                                                budget. Meta automatically
                                                adjusts your bid.
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setBidStrategy("cost_cap");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {bidStrategy === "cost_cap" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Cost cap
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Set a target average cost per
                                                result. Individual costs may
                                                vary.
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setBidStrategy("bid_cap");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {bidStrategy === "bid_cap" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Bid cap
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Set the maximum amount to bid in
                                                each auction. May not spend full
                                                budget.
                                             </div>
                                          </div>
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Special ad category */}
                           <div className={styles.advRow}>
                              <div>
                                 <div className={styles.advTitle}>
                                    Special ad category
                                 </div>
                                 <div className={styles.advSub}>
                                    Required for credit, employment, or housing
                                    ads
                                 </div>
                              </div>
                              <div className={styles.dropdownWrap}>
                                 <button
                                    className={styles.dropdownBtn}
                                    onClick={() =>
                                       setOpenDropdown(
                                          openDropdown === "special"
                                             ? null
                                             : "special",
                                       )
                                    }
                                 >
                                    {specialAdCategory === "none" && "None"}
                                    {specialAdCategory === "financial" &&
                                       "Financial products"}
                                    {specialAdCategory === "employment" &&
                                       "Employment"}
                                    {specialAdCategory === "housing" &&
                                       "Housing"}
                                    <ChevronDown size={14} />
                                 </button>
                                 {openDropdown === "special" && (
                                    <div className={styles.dropdownMenu}>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setSpecialAdCategory("none");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {specialAdCategory === "none" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                None
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setSpecialAdCategory("financial");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {specialAdCategory ===
                                                "financial" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Financial products and services
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Ads for credit cards, long-term
                                                financing, checking and savings
                                                accounts, investment services,
                                                or insurance.
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setSpecialAdCategory("employment");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {specialAdCategory ===
                                                "employment" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Employment
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Ads for job offers, internships,
                                                professional certification
                                                programs or other related
                                                opportunities.
                                             </div>
                                          </div>
                                       </button>
                                       <button
                                          className={styles.dropdownItem}
                                          onClick={() => {
                                             setSpecialAdCategory("housing");
                                             setOpenDropdown(null);
                                          }}
                                       >
                                          <div
                                             className={
                                                styles.dropdownItemCheck
                                             }
                                          >
                                             {specialAdCategory ===
                                                "housing" && (
                                                <Check size={12} />
                                             )}
                                          </div>
                                          <div>
                                             <div
                                                className={
                                                   styles.dropdownItemTitle
                                                }
                                             >
                                                Housing
                                             </div>
                                             <div
                                                className={
                                                   styles.dropdownItemSub
                                                }
                                             >
                                                Ads for real estate listings,
                                                homeowners insurance, mortgage
                                                loans or other related
                                                opportunities.
                                             </div>
                                          </div>
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {step === "build" && (
               <div className={styles.content}>
                  {/* Conversion location */}
                  <div className={styles.field}>
                     <label className={styles.label}>Conversion location</label>
                     <p className={styles.hint}>
                        Choose where you want to drive sales.
                     </p>
                     <div className={styles.locationGrid}>
                        <button
                           className={`${styles.locationBtn} ${conversionLocation === "website" ? styles.locationBtnActive : ""}`}
                           onClick={() => setConversionLocation("website")}
                        >
                           <span className={styles.locationIcon}>🌐</span>
                           <span>Website</span>
                        </button>
                        <button
                           className={`${styles.locationBtn} ${conversionLocation === "message_destinations" ? styles.locationBtnActive : ""}`}
                           onClick={() =>
                              setConversionLocation("message_destinations")
                           }
                        >
                           <span className={styles.locationIcon}>💬</span>
                           <span>Message destinations</span>
                        </button>
                     </div>
                  </div>

                  {/* Conversion event */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Conversion event <span className={styles.req}>*</span>
                     </label>
                     <p className={styles.hint}>
                        The action you want people to take when they see your
                        ads.
                     </p>
                     <div className={styles.dropdownWrap}>
                        <button
                           className={styles.dropdownBtnFull}
                           onClick={() =>
                              setOpenDropdown(
                                 openDropdown === "event" ? null : "event",
                              )
                           }
                        >
                           {conversionEvent || "Select a conversion event"}
                           <ChevronDown size={14} />
                        </button>
                        {openDropdown === "event" && (
                           <div className={styles.dropdownMenuFull}>
                              <div className={styles.dropdownGroupLabel}>
                                 Standard events
                              </div>
                              {CONVERSION_EVENTS.map((ev) => (
                                 <button
                                    key={ev}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                       setConversionEvent(ev);
                                       setOpenDropdown(null);
                                    }}
                                 >
                                    <div className={styles.dropdownItemCheck}>
                                       {conversionEvent === ev && (
                                          <Check size={12} />
                                       )}
                                    </div>
                                    <div className={styles.dropdownItemTitle}>
                                       {ev}
                                    </div>
                                 </button>
                              ))}
                              <button className={styles.dropdownFooter}>
                                 Don&apos;t see your event? Check your pixel ↗
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Placements */}
                  <div className={styles.field}>
                     <label className={styles.label}>Placements</label>
                     <div className={styles.toggleRow}>
                        <div>
                           <div className={styles.advTitle}>
                              Advantage+ placements
                              <span className={styles.recBadge}>
                                 Recommended
                              </span>
                           </div>
                           <div className={styles.advSub}>
                              Meta will automatically show your ads across the
                              placements most likely to drive the best results.
                           </div>
                        </div>
                        <button
                           className={`${styles.switch} ${advantagePlacements ? styles.switchOn : ""}`}
                           onClick={() =>
                              setAdvantagePlacements(!advantagePlacements)
                           }
                        >
                           <span className={styles.switchThumb} />
                        </button>
                     </div>
                  </div>

                  {/* Targeting */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Targeting <span className={styles.req}>*</span>
                     </label>
                     <p className={styles.hint}>
                        {countries.length} location
                        {countries.length !== 1 ? "s" : ""} selected
                     </p>

                     <div className={styles.countriesRow}>
                        {countries.map((c) => (
                           <span key={c} className={styles.countryChip}>
                              {c}
                              <button onClick={() => removeCountry(c)}>
                                 <X size={10} />
                              </button>
                           </span>
                        ))}
                        <input
                           className={styles.countryInput}
                           placeholder="Search countries, regions, or ZIP code..."
                           value={countryInput}
                           onChange={(e) => setCountryInput(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                 e.preventDefault();
                                 addCountry();
                              }
                           }}
                        />
                     </div>

                     <div
                        className={styles.toggleRow}
                        style={{ marginTop: 12 }}
                     >
                        <div>
                           <div className={styles.advTitle}>
                              Advantage+ audience
                              <span className={styles.recBadge}>
                                 Recommended
                              </span>
                           </div>
                           <div className={styles.advSub}>
                              Let Meta find the best audience for your ads.
                           </div>
                        </div>
                        <div className={styles.minAgeWrap}>
                           <span>Minimum age</span>
                           <select
                              className={styles.minAgeSelect}
                              value={minAge}
                              onChange={(e) =>
                                 setMinAge(Number(e.target.value))
                              }
                           >
                              {[18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65].map(
                                 (a) => (
                                    <option key={a} value={a}>
                                       {a}+
                                    </option>
                                 ),
                              )}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Message destinations */}
                  {conversionLocation === "message_destinations" && (
                     <>
                        <div className={styles.field}>
                           <label className={styles.label}>
                              Performance goal
                           </label>
                           <div className={styles.dropdownWrap}>
                              <button
                                 className={styles.dropdownBtnFull}
                                 onClick={() =>
                                    setOpenDropdown(
                                       openDropdown === "goal" ? null : "goal",
                                    )
                                 }
                              >
                                 {performanceGoal === "maximize_conversions" &&
                                    "Maximize number of conversions"}
                                 {performanceGoal ===
                                    "maximize_conversations" &&
                                    "Maximize number of conversations"}
                                 <ChevronDown size={14} />
                              </button>
                              {openDropdown === "goal" && (
                                 <div className={styles.dropdownMenuFull}>
                                    <div className={styles.dropdownGroupLabel}>
                                       Conversion goals
                                    </div>
                                    <button
                                       className={styles.dropdownItem}
                                       onClick={() => {
                                          setPerformanceGoal(
                                             "maximize_conversions",
                                          );
                                          setOpenDropdown(null);
                                       }}
                                    >
                                       <div
                                          className={styles.dropdownItemCheck}
                                       >
                                          {performanceGoal ===
                                             "maximize_conversions" && (
                                             <Check size={12} />
                                          )}
                                       </div>
                                       <div>
                                          <div
                                             className={
                                                styles.dropdownItemTitle
                                             }
                                          >
                                             Maximize number of conversions
                                          </div>
                                          <div
                                             className={styles.dropdownItemSub}
                                          >
                                             We&apos;ll try to show your ads to
                                             the people most likely to take a
                                             specific action on your website.
                                          </div>
                                       </div>
                                    </button>
                                    <button
                                       className={styles.dropdownItem}
                                       onClick={() => {
                                          setPerformanceGoal(
                                             "maximize_conversations",
                                          );
                                          setOpenDropdown(null);
                                       }}
                                    >
                                       <div
                                          className={styles.dropdownItemCheck}
                                       >
                                          {performanceGoal ===
                                             "maximize_conversations" && (
                                             <Check size={12} />
                                          )}
                                       </div>
                                       <div>
                                          <div
                                             className={
                                                styles.dropdownItemTitle
                                             }
                                          >
                                             Maximize number of conversations
                                          </div>
                                          <div
                                             className={styles.dropdownItemSub}
                                          >
                                             We&apos;ll try to show your ads to
                                             people most likely to have a
                                             conversation with you through
                                             messaging.
                                          </div>
                                       </div>
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className={styles.field}>
                           <label className={styles.label}>
                              Facebook Page{" "}
                              <span className={styles.req}>*</span>
                           </label>
                           <select
                              className={styles.input}
                              value={facebookPage}
                              onChange={(e) => setFacebookPage(e.target.value)}
                           >
                              <option value="">
                                 Select a Facebook Page...
                              </option>
                              <option value="space-ex">Space/Ex</option>
                              <option value="new">
                                 + Create Facebook Page
                              </option>
                           </select>
                        </div>

                        <div className={styles.field}>
                           <label className={styles.label}>
                              Instagram account
                           </label>
                           <select
                              className={styles.input}
                              value={instagramAccount}
                              onChange={(e) =>
                                 setInstagramAccount(e.target.value)
                              }
                           >
                              <option value="">No connected Instagram</option>
                           </select>
                        </div>
                     </>
                  )}

                  {/* Advanced build options */}
                  <div className={styles.advancedSection}>
                     <button
                        className={styles.advancedToggle}
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                     >
                        <ChevronDown
                           size={14}
                           style={{
                              transform: advancedOpen
                                 ? "rotate(180deg)"
                                 : "rotate(0)",
                              transition: "transform 0.2s",
                           }}
                        />
                        Advanced options
                     </button>

                     {advancedOpen && (
                        <div className={styles.advancedContent}>
                           <div className={styles.advBlock}>
                              <div className={styles.advBlockTitle}>
                                 Schedule
                              </div>
                              <div className={styles.advBlockSub}>
                                 Dates and delivery hours
                              </div>
                              <div className={styles.scheduleRow}>
                                 <div className={styles.scheduleField}>
                                    <label>Start</label>
                                    <input
                                       type="date"
                                       className={styles.input}
                                       defaultValue={
                                          new Date().toISOString().split("T")[0]
                                       }
                                    />
                                 </div>
                                 <div className={styles.scheduleCheckbox}>
                                    <input type="checkbox" id="set-end" />
                                    <label htmlFor="set-end">
                                       Set an end date
                                    </label>
                                 </div>
                              </div>
                              <div
                                 className={styles.advBlockSub}
                                 style={{ marginTop: 12 }}
                              >
                                 Times use New York (company override).
                              </div>
                              <div
                                 className={styles.advBlockTitle}
                                 style={{ marginTop: 16 }}
                              >
                                 Delivery hours
                              </div>
                              <div className={styles.advBlockSub}>
                                 Specific hours need a lifetime budget. Set one
                                 to pick the hours ads deliver in.
                              </div>
                           </div>

                           <div className={styles.advBlock}>
                              <div className={styles.advBlockTitle}>
                                 Minimum daily spend
                              </div>
                              <div className={styles.advBlockSub}>
                                 Optional spend target for this ad group, not a
                                 guarantee.
                              </div>
                              <input
                                 type="number"
                                 className={styles.input}
                                 placeholder="0"
                                 style={{ marginTop: 8, maxWidth: 200 }}
                              />
                           </div>

                           <div className={styles.advBlock}>
                              <div className={styles.advBlockTitle}>
                                 Audiences
                              </div>
                              <div className={styles.advBlockSub}>
                                 Target or exclude your audiences. Create
                                 lookalikes from the ads settings page.
                              </div>
                           </div>

                           <div className={styles.advBlock}>
                              <div className={styles.advBlockTitle}>
                                 Languages
                              </div>
                              <div className={styles.advBlockSub}>
                                 Leave empty to target all languages
                              </div>
                              <input
                                 className={styles.input}
                                 placeholder="Search for a language (e.g. English, Spanish)"
                                 style={{ marginTop: 8 }}
                              />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Footer */}
         <footer className={styles.footer}>
            {step === "campaign" ? (
               <button className={styles.nextBtn} onClick={nextStep}>
                  Next <ChevronRight size={14} />
               </button>
            ) : (
               <button
                  className={styles.nextBtn}
                  onClick={handleCreate}
                  disabled={saving}
               >
                  {saving ? "Creating..." : "Create campaign"}{" "}
                  <ChevronRight size={14} />
               </button>
            )}
         </footer>
      </div>
   );
}
