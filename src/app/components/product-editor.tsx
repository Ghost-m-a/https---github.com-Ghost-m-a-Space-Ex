"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft,
   Sparkles,
   Upload,
   Image as ImageIcon,
   Plus,
   X,
   Globe,
   DollarSign,
   ExternalLink,
   ChevronDown,
   Palette,
   Wrench,
   Settings2,
} from "lucide-react";
import { useWorkspace } from "../context/workspace-context";
import styles from "../styles/productEditor.module.css";

interface ProductEditorProps {
   mode: "create" | "edit";
   productId?: string;
}

type ViewMode = "desktop" | "mobile" | "member";

const APP_OPTIONS = [
   { key: "forums", label: "Forums", color: "#3b82f6" },
   { key: "chat", label: "Chat", color: "#f59e0b" },
   { key: "courses", label: "Courses", color: "#8b5cf6" },
   { key: "content", label: "Content", color: "#ec4899" },
   { key: "livestreaming", label: "Livestreaming", color: "#ef4444" },
   { key: "events", label: "Events", color: "#10b981" },
];

const COLOR_PALETTE = [
   "#3b82f6",
   "#8b5cf6",
   "#ec4899",
   "#ef4444",
   "#f59e0b",
   "#10b981",
   "#14b8a6",
   "#06b6d4",
   "#a855f7",
   "#f97316",
   "#84cc16",
   "#eab308",
];

const BUTTON_TEXT_OPTIONS = [
   "Join",
   "Buy now",
   "Subscribe",
   "Get access",
   "Learn more",
];

interface FAQ {
   question: string;
   answer: string;
}

interface ProductState {
   name: string;
   headline: string;
   description: string;
   bannerImage: string;
   labels: string[];
   collectShippingAddress: boolean;
   accessType: "free" | "paid";
   pricingType: "one-time" | "recurring";
   price: number;
   currency: string;
   recurringInterval: "monthly" | "yearly";
   launchAsWaitlist: boolean;
   askQuestionsBeforeCheckout: boolean;
   includedApps: string[];
   faqs: FAQ[];
   appearanceColor: string;
   growthTools: { showMemberCount: boolean };
   productSettings: {
      purchaseButtonText: string;
      productTaxCode: string;
      productUrl: string;
      addAffiliateRate: boolean;
      affiliateRate: number;
      checkoutRedirect: boolean;
      checkoutRedirectUrl: string;
      visibleOnStorePage: boolean;
   };
   visibility: "visible" | "hidden" | "archived";
   discoverStatus: "listed" | "unlisted";
}

const DEFAULT_STATE: ProductState = {
   name: "",
   headline: "",
   description: "",
   bannerImage: "",
   labels: [],
   collectShippingAddress: false,
   accessType: "free",
   pricingType: "one-time",
   price: 0,
   currency: "USD",
   recurringInterval: "monthly",
   launchAsWaitlist: false,
   askQuestionsBeforeCheckout: false,
   includedApps: [],
   faqs: [],
   appearanceColor: "#3b82f6",
   growthTools: { showMemberCount: true },
   productSettings: {
      purchaseButtonText: "Join",
      productTaxCode: "",
      productUrl: "",
      addAffiliateRate: true,
      affiliateRate: 30,
      checkoutRedirect: false,
      checkoutRedirectUrl: "",
      visibleOnStorePage: true,
   },
   visibility: "visible",
   discoverStatus: "unlisted",
};

const ProductEditor: React.FC<ProductEditorProps> = ({ mode, productId }) => {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [viewMode, setViewMode] = useState<ViewMode>("desktop");
   const [state, setState] = useState<ProductState>(DEFAULT_STATE);
   const [aiPrompt, setAiPrompt] = useState("");
   const [saving, setSaving] = useState(false);
   const [loading, setLoading] = useState(mode === "edit");
   const [error, setError] = useState("");
   const [newLabel, setNewLabel] = useState("");
   const [showFaqForm, setShowFaqForm] = useState(false);
   const [expandedSections, setExpandedSections] = useState({
      details: true,
      pricing: true,
      apps: false,
      appearance: false,
      growth: false,
      settings: false,
   });

   const businessName = activeBusiness?.name || "Space/Ex";
   const businessInitial = businessName.charAt(0).toUpperCase();

   // Load existing product for edit mode
   useEffect(() => {
      if (mode === "edit" && productId) {
         setLoading(true);
         fetch(`/api/business/products/${productId}`)
            .then((r) => r.json())
            .then((d) => {
               if (d.product) {
                  setState({
                     name: d.product.name || "",
                     headline: d.product.headline || "",
                     description: d.product.description || "",
                     bannerImage: d.product.bannerImage || "",
                     labels: d.product.labels || [],
                     collectShippingAddress:
                        d.product.collectShippingAddress || false,
                     accessType: d.product.accessType || "free",
                     pricingType: d.product.pricingType || "one-time",
                     price: d.product.price || 0,
                     currency: d.product.currency || "USD",
                     recurringInterval:
                        d.product.recurringInterval || "monthly",
                     launchAsWaitlist: d.product.launchAsWaitlist || false,
                     askQuestionsBeforeCheckout:
                        d.product.askQuestionsBeforeCheckout || false,
                     includedApps: d.product.includedApps || [],
                     faqs: d.product.faqs || [],
                     appearanceColor: d.product.appearanceColor || "#3b82f6",
                     growthTools: {
                        showMemberCount:
                           d.product.growthTools?.showMemberCount !== false,
                     },
                     productSettings: {
                        purchaseButtonText:
                           d.product.productSettings?.purchaseButtonText ||
                           "Join",
                        productTaxCode:
                           d.product.productSettings?.productTaxCode || "",
                        productUrl: d.product.productSettings?.productUrl || "",
                        addAffiliateRate:
                           d.product.productSettings?.addAffiliateRate !==
                           false,
                        affiliateRate:
                           d.product.productSettings?.affiliateRate || 30,
                        checkoutRedirect:
                           d.product.productSettings?.checkoutRedirect || false,
                        checkoutRedirectUrl:
                           d.product.productSettings?.checkoutRedirectUrl || "",
                        visibleOnStorePage:
                           d.product.productSettings?.visibleOnStorePage !==
                           false,
                     },
                     visibility: d.product.visibility || "visible",
                     discoverStatus: d.product.discoverStatus || "unlisted",
                  });
               }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
      }
   }, [mode, productId]);

   const update = <K extends keyof ProductState>(
      key: K,
      value: ProductState[K],
   ) => {
      setState((prev) => ({ ...prev, [key]: value }));
   };

   const updateSettings = <K extends keyof ProductState["productSettings"]>(
      key: K,
      value: ProductState["productSettings"][K],
   ) => {
      setState((prev) => ({
         ...prev,
         productSettings: { ...prev.productSettings, [key]: value },
      }));
   };

   const toggleApp = (key: string) => {
      setState((prev) => ({
         ...prev,
         includedApps: prev.includedApps.includes(key)
            ? prev.includedApps.filter((a) => a !== key)
            : [...prev.includedApps, key],
      }));
   };

   const addLabel = () => {
      if (newLabel.trim() && !state.labels.includes(newLabel.trim())) {
         update("labels", [...state.labels, newLabel.trim()]);
         setNewLabel("");
      }
   };

   const removeLabel = (label: string) => {
      update(
         "labels",
         state.labels.filter((l) => l !== label),
      );
   };

   const addFaq = () => {
      update("faqs", [...state.faqs, { question: "", answer: "" }]);
      setShowFaqForm(true);
   };

   const updateFaq = (idx: number, patch: Partial<FAQ>) => {
      const next = [...state.faqs];
      next[idx] = { ...next[idx], ...patch };
      update("faqs", next);
   };

   const removeFaq = (idx: number) => {
      update(
         "faqs",
         state.faqs.filter((_, i) => i !== idx),
      );
   };

   const generateAI = () => {
      // Local AI-style generation using the prompt
      const baseName =
         aiPrompt.split(/[.,]/)[0].trim().slice(0, 60) || "New Product";
      const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      update("name", capitalized || "Premium Membership");
      update(
         "headline",
         aiPrompt.slice(0, 100) || "Get access to exclusive content",
      );
      update("description", `This product includes: ${aiPrompt.slice(0, 400)}`);
   };

   const handleSave = async () => {
      if (!state.name.trim()) {
         setError("Product name is required");
         return;
      }
      setSaving(true);
      setError("");

      try {
         const url =
            mode === "edit" && productId
               ? `/api/business/products/${productId}`
               : "/api/business/products";
         const method = mode === "edit" ? "PATCH" : "POST";

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness?.id,
               ...state,
            }),
         });

         const data = await res.json();

         if (!res.ok) {
            setError(data.error || "Failed to save product");
            return;
         }

         router.push("/business/products");
         router.refresh();
      } catch (err) {
         console.error(err);
         setError("Network error. Please try again.");
      } finally {
         setSaving(false);
      }
   };

   const toggleSection = (key: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
   };

   if (loading) {
      return <div className={styles.loading}>Loading product...</div>;
   }

   return (
      <div className={styles.editor}>
         {/* Top Bar */}
         <header className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/products")}
            >
               <ArrowLeft size={16} />
               <span>Add product</span>
            </button>

            <div className={styles.viewTabs}>
               {(["desktop", "mobile", "member"] as ViewMode[]).map((v) => (
                  <button
                     key={v}
                     className={`${styles.viewTab} ${viewMode === v ? styles.viewTabActive : ""}`}
                     onClick={() => setViewMode(v)}
                  >
                     {v === "desktop" && "💻 Desktop"}
                     {v === "mobile" && "📱 Mobile"}
                     {v === "member" && "👤 Member view"}
                  </button>
               ))}
            </div>
         </header>

         {/* Two-column Layout */}
         <div className={styles.body}>
            {/* LEFT PANEL — Editor */}
            <aside className={styles.leftPanel}>
               {/* AI Section */}
               <div className={styles.aiSection}>
                  <div className={styles.aiHeader}>
                     <Sparkles size={14} className={styles.aiIcon} />
                     <span>Describe what you want to sell</span>
                  </div>
                  <p className={styles.aiSub}>
                     AI drafts the name, page copy, pricing and apps. You review
                     everything before it goes live.
                  </p>
                  <textarea
                     className={styles.aiInput}
                     placeholder="e.g. A monthly community for indie game devs with weekly critique calls and a course library"
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value.slice(0, 600))}
                     rows={4}
                  />
                  <div className={styles.aiBottom}>
                     <span className={styles.charCount}>
                        {aiPrompt.length} / 600
                     </span>
                     <button
                        className={styles.aiGenerateBtn}
                        onClick={generateAI}
                        disabled={!aiPrompt.trim()}
                     >
                        <Sparkles size={12} /> Generate product
                     </button>
                  </div>
               </div>

               <div className={styles.divider}>
                  <span>OR FILL IT IN YOURSELF</span>
               </div>

               {/* Details */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("details")}
                  >
                     <span>Details</span>
                     <ChevronDown
                        size={16}
                        className={
                           expandedSections.details ? styles.chevronOpen : ""
                        }
                     />
                  </button>
                  <p className={styles.sectionSub}>
                     The name buyers see on your product page.
                  </p>

                  {expandedSections.details && (
                     <div className={styles.sectionBody}>
                        <label className={styles.fieldLabel}>Name *</label>
                        <input
                           className={styles.input}
                           value={state.name}
                           onChange={(e) =>
                              update("name", e.target.value.slice(0, 80))
                           }
                           placeholder="Basic access"
                        />
                        <div className={styles.charCount}>
                           {state.name.length} / 80
                        </div>

                        <label className={styles.fieldLabel}>
                           Labels <span className={styles.helpIcon}>?</span>
                        </label>
                        <div className={styles.labelsInput}>
                           {state.labels.map((label) => (
                              <span key={label} className={styles.labelChip}>
                                 {label}
                                 <button onClick={() => removeLabel(label)}>
                                    <X size={12} />
                                 </button>
                              </span>
                           ))}
                           <input
                              className={styles.labelInput}
                              placeholder="Type a label and press enter"
                              value={newLabel}
                              onChange={(e) =>
                                 setNewLabel(e.target.value.slice(0, 20))
                              }
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") {
                                    e.preventDefault();
                                    addLabel();
                                 }
                              }}
                           />
                        </div>
                        <div className={styles.charCount}>
                           {newLabel.length} / 20
                        </div>

                        <div className={styles.toggleRow}>
                           <div>
                              <div className={styles.toggleLabel}>
                                 Collect shipping address{" "}
                                 <span className={styles.helpIcon}>?</span>
                              </div>
                           </div>
                           <button
                              className={`${styles.switch} ${state.collectShippingAddress ? styles.switchOn : ""}`}
                              onClick={() =>
                                 update(
                                    "collectShippingAddress",
                                    !state.collectShippingAddress,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>
                     </div>
                  )}
               </section>

               {/* Pricing */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("pricing")}
                  >
                     <span>Pricing</span>
                     <ChevronDown
                        size={16}
                        className={
                           expandedSections.pricing ? styles.chevronOpen : ""
                        }
                     />
                  </button>
                  <p className={styles.sectionSub}>
                     Choose how people get access to this product.
                  </p>

                  {expandedSections.pricing && (
                     <div className={styles.sectionBody}>
                        <div className={styles.accessGrid}>
                           <button
                              className={`${styles.accessCard} ${state.accessType === "free" ? styles.accessCardActive : ""}`}
                              onClick={() => update("accessType", "free")}
                           >
                              <Globe size={16} />
                              <span>Free access</span>
                              {state.accessType === "free" && (
                                 <span className={styles.radio}>●</span>
                              )}
                           </button>
                           <button
                              className={`${styles.accessCard} ${state.accessType === "paid" ? styles.accessCardActive : ""}`}
                              onClick={() => update("accessType", "paid")}
                           >
                              <DollarSign size={16} />
                              <span>Paid access</span>
                              {state.accessType === "paid" && (
                                 <span className={styles.radio}>●</span>
                              )}
                           </button>
                        </div>

                        {state.accessType === "paid" && (
                           <div className={styles.paidSection}>
                              <label className={styles.fieldLabel}>
                                 Pricing type
                              </label>
                              <div className={styles.pricingTypes}>
                                 <button
                                    className={`${styles.pricingTypeBtn} ${state.pricingType === "one-time" ? styles.active : ""}`}
                                    onClick={() =>
                                       update("pricingType", "one-time")
                                    }
                                 >
                                    One-time
                                 </button>
                                 <button
                                    className={`${styles.pricingTypeBtn} ${state.pricingType === "recurring" ? styles.active : ""}`}
                                    onClick={() =>
                                       update("pricingType", "recurring")
                                    }
                                 >
                                    Recurring
                                 </button>
                              </div>

                              <label className={styles.fieldLabel}>Price</label>
                              <div className={styles.priceInput}>
                                 <span>$</span>
                                 <input
                                    type="number"
                                    value={state.price}
                                    onChange={(e) =>
                                       update("price", Number(e.target.value))
                                    }
                                    min={0}
                                 />
                                 <select
                                    value={state.currency}
                                    onChange={(e) =>
                                       update("currency", e.target.value)
                                    }
                                 >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                 </select>
                              </div>

                              {state.pricingType === "recurring" && (
                                 <>
                                    <label className={styles.fieldLabel}>
                                       Billing interval
                                    </label>
                                    <select
                                       className={styles.input}
                                       value={state.recurringInterval}
                                       onChange={(e) =>
                                          update(
                                             "recurringInterval",
                                             e.target.value as
                                                | "monthly"
                                                | "yearly",
                                          )
                                       }
                                    >
                                       <option value="monthly">Monthly</option>
                                       <option value="yearly">Yearly</option>
                                    </select>
                                 </>
                              )}
                           </div>
                        )}

                        <div className={styles.toggleRow}>
                           <div className={styles.toggleLabel}>
                              Launch as a waitlist
                           </div>
                           <button
                              className={`${styles.switch} ${state.launchAsWaitlist ? styles.switchOn : ""}`}
                              onClick={() =>
                                 update(
                                    "launchAsWaitlist",
                                    !state.launchAsWaitlist,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>

                        <div className={styles.toggleRow}>
                           <div className={styles.toggleLabel}>
                              Ask questions before checkout
                           </div>
                           <button
                              className={`${styles.switch} ${state.askQuestionsBeforeCheckout ? styles.switchOn : ""}`}
                              onClick={() =>
                                 update(
                                    "askQuestionsBeforeCheckout",
                                    !state.askQuestionsBeforeCheckout,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>

                        <button className={styles.linkBtn}>
                           <Settings2 size={14} /> Plan settings
                        </button>
                     </div>
                  )}
               </section>

               {/* Apps */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("apps")}
                  >
                     <span>Apps</span>
                     <ChevronDown
                        size={16}
                        className={
                           expandedSections.apps ? styles.chevronOpen : ""
                        }
                     />
                  </button>
                  <p className={styles.sectionSub}>
                     The content included with this product.
                  </p>

                  {expandedSections.apps && (
                     <div className={styles.sectionBody}>
                        <div className={styles.appsGroupLabel}>ADD NEW</div>
                        <div className={styles.appsGrid}>
                           {APP_OPTIONS.map((app) => (
                              <button
                                 key={app.key}
                                 className={`${styles.appChip} ${state.includedApps.includes(app.key) ? styles.appChipActive : ""}`}
                                 onClick={() => toggleApp(app.key)}
                                 style={
                                    state.includedApps.includes(app.key)
                                       ? {
                                            borderColor: app.color,
                                            background: `${app.color}15`,
                                         }
                                       : {}
                                 }
                              >
                                 <span
                                    className={styles.appDot}
                                    style={{ background: app.color }}
                                 />
                                 {app.label}
                              </button>
                           ))}
                        </div>

                        <div className={styles.appsGroupLabel}>
                           ALREADY IN THIS COMPANY
                        </div>
                        <div className={styles.companyLabel}>HOME</div>
                        <div className={styles.appChipDisabled}>
                           <span
                              className={styles.appDot}
                              style={{ background: "#3b82f6" }}
                           />
                           Public forum
                        </div>
                     </div>
                  )}
               </section>

               {/* Appearance */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("appearance")}
                  >
                     <span>Appearance</span>
                     <ChevronDown
                        size={16}
                        className={
                           expandedSections.appearance ? styles.chevronOpen : ""
                        }
                     />
                  </button>
                  <p className={styles.sectionSub}>Theme and accent color.</p>

                  {expandedSections.appearance && (
                     <div className={styles.sectionBody}>
                        <div className={styles.colorSectionLabel}>Default</div>
                        <button
                           className={`${styles.colorSwatchLarge} ${state.appearanceColor === "#3b82f6" ? styles.colorSwatchActive : ""}`}
                           style={{ background: "#3b82f6" }}
                           onClick={() => update("appearanceColor", "#3b82f6")}
                        />

                        <div className={styles.colorSectionLabel}>Custom</div>
                        <div className={styles.colorGrid}>
                           {COLOR_PALETTE.map((color) => (
                              <button
                                 key={color}
                                 className={`${styles.colorSwatch} ${state.appearanceColor === color ? styles.colorSwatchActive : ""}`}
                                 style={{ background: color }}
                                 onClick={() =>
                                    update("appearanceColor", color)
                                 }
                              />
                           ))}
                        </div>
                     </div>
                  )}
               </section>

               {/* Growth Tools */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("growth")}
                  >
                     <span>Growth tools</span>
                     <ChevronDown size={16} className={styles.chevronOpen} />
                  </button>
                  <p className={styles.sectionSub}>
                     Discount rate, sale banner, and member visibility.
                  </p>

                  <div className={styles.sectionBody}>
                     <div className={styles.toggleRow}>
                        <div>
                           <div className={styles.toggleLabel}>
                              Show member count on store page
                           </div>
                           <div className={styles.toggleSub}>
                              Display the number of people who have joined this
                              product on its public store page.
                           </div>
                        </div>
                        <button
                           className={`${styles.switch} ${state.growthTools.showMemberCount ? styles.switchOn : ""}`}
                           onClick={() =>
                              update("growthTools", {
                                 ...state.growthTools,
                                 showMemberCount:
                                    !state.growthTools.showMemberCount,
                              })
                           }
                        >
                           <span className={styles.switchThumb} />
                        </button>
                     </div>
                  </div>
               </section>

               {/* Product Settings */}
               <section className={styles.section}>
                  <button
                     className={styles.sectionHeader}
                     onClick={() => toggleSection("settings")}
                  >
                     <span>Product settings</span>
                     <ChevronDown
                        size={16}
                        className={
                           expandedSections.settings ? styles.chevronOpen : ""
                        }
                     />
                  </button>
                  <p className={styles.sectionSub}>
                     URL, taxes, affiliates, and more.
                  </p>

                  {expandedSections.settings && (
                     <div className={styles.sectionBody}>
                        <label className={styles.fieldLabel}>
                           Purchase button text{" "}
                           <span className={styles.helpIcon}>?</span>
                        </label>
                        <select
                           className={styles.input}
                           value={state.productSettings.purchaseButtonText}
                           onChange={(e) =>
                              updateSettings(
                                 "purchaseButtonText",
                                 e.target.value,
                              )
                           }
                        >
                           {BUTTON_TEXT_OPTIONS.map((opt) => (
                              <option key={opt}>{opt}</option>
                           ))}
                        </select>

                        <label className={styles.fieldLabel}>
                           Product tax code
                        </label>
                        <select
                           className={styles.input}
                           value={state.productSettings.productTaxCode}
                           onChange={(e) =>
                              updateSettings("productTaxCode", e.target.value)
                           }
                        >
                           <option value="">Use preset</option>
                           <option value="digital">Digital goods</option>
                           <option value="physical">Physical goods</option>
                           <option value="services">Services</option>
                        </select>
                        <div className={styles.fieldHint}>
                           This will be used for calculating automatic tax.
                           Defaults to the preset product tax code from your tax
                           settings.
                        </div>

                        <label className={styles.fieldLabel}>Product URL</label>
                        <input
                           className={styles.input}
                           value={
                              state.productSettings.productUrl ||
                              `space-ex.com/${activeBusiness?.id?.slice(-6) || "space-ex"}/${state.name.toLowerCase().replace(/\s+/g, "-").slice(0, 30) || "product"}`
                           }
                           onChange={(e) =>
                              updateSettings("productUrl", e.target.value)
                           }
                           placeholder="yourbusiness.com/product"
                        />

                        <div className={styles.toggleRow}>
                           <div className={styles.toggleLabel}>
                              Add affiliate rate{" "}
                              <span className={styles.helpIcon}>?</span>
                           </div>
                           <button
                              className={`${styles.switch} ${state.productSettings.addAffiliateRate ? styles.switchOn : ""}`}
                              onClick={() =>
                                 updateSettings(
                                    "addAffiliateRate",
                                    !state.productSettings.addAffiliateRate,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>

                        {state.productSettings.addAffiliateRate && (
                           <div className={styles.affiliateInput}>
                              <input
                                 type="number"
                                 value={state.productSettings.affiliateRate}
                                 onChange={(e) =>
                                    updateSettings(
                                       "affiliateRate",
                                       Number(e.target.value),
                                    )
                                 }
                                 min={0}
                                 max={100}
                              />
                              <span>%</span>
                           </div>
                        )}

                        <div className={styles.toggleRow}>
                           <div className={styles.toggleLabel}>
                              Checkout redirect{" "}
                              <span className={styles.helpIcon}>?</span>
                           </div>
                           <button
                              className={`${styles.switch} ${state.productSettings.checkoutRedirect ? styles.switchOn : ""}`}
                              onClick={() =>
                                 updateSettings(
                                    "checkoutRedirect",
                                    !state.productSettings.checkoutRedirect,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>

                        <div className={styles.toggleRow}>
                           <div className={styles.toggleLabel}>
                              Visible on your store page{" "}
                              <span className={styles.helpIcon}>?</span>
                           </div>
                           <button
                              className={`${styles.switch} ${state.productSettings.visibleOnStorePage ? styles.switchOn : ""}`}
                              onClick={() =>
                                 updateSettings(
                                    "visibleOnStorePage",
                                    !state.productSettings.visibleOnStorePage,
                                 )
                              }
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>
                     </div>
                  )}
               </section>

               {error && <div className={styles.error}>{error}</div>}

               <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving || !state.name.trim()}
               >
                  {saving
                     ? "Saving..."
                     : mode === "edit"
                       ? "Save changes"
                       : "Create product"}
               </button>
            </aside>

            {/* RIGHT PANEL — Live Preview */}
            <main
               className={`${styles.preview} ${styles[`preview-${viewMode}`]}`}
            >
               <div className={styles.previewInner}>
                  {/* Brand header */}
                  <div className={styles.previewBrand}>
                     <div
                        className={styles.previewBrandIcon}
                        style={{ background: state.appearanceColor }}
                     >
                        {businessInitial}
                     </div>
                     <span className={styles.previewBrandName}>
                        {businessName}
                     </span>
                  </div>

                  {/* Product page mockup */}
                  <div className={styles.productPreview}>
                     <div className={styles.previewMain}>
                        {/* Media area */}
                        <div className={styles.previewMedia}>
                           {state.bannerImage ? (
                              <img
                                 src={state.bannerImage}
                                 alt="Product"
                                 className={styles.previewImage}
                              />
                           ) : (
                              <div className={styles.previewMediaEmpty}>
                                 <ImageIcon
                                    size={24}
                                    className={styles.previewMediaIcon}
                                 />
                                 <div className={styles.previewMediaTitle}>
                                    Add your first product video or photo
                                 </div>
                                 <div className={styles.previewMediaSub}>
                                    This should illustrate something about the
                                    product.
                                 </div>
                                 <div className={styles.previewMediaActions}>
                                    <button className={styles.previewSmallBtn}>
                                       <Upload size={14} /> Upload
                                    </button>
                                    <button className={styles.previewSmallBtn}>
                                       <ImageIcon size={14} /> Free stock photos
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Headline */}
                        <div className={styles.previewHeadline}>
                           {state.headline || (
                              <span className={styles.previewPlaceholder}>
                                 Write a headline...
                              </span>
                           )}
                        </div>

                        {/* Description */}
                        <div className={styles.previewDescription}>
                           {state.description || (
                              <span className={styles.previewPlaceholderSmall}>
                                 Write a description...
                              </span>
                           )}
                        </div>

                        <button className={styles.previewAiBtn}>
                           <Sparkles size={12} /> Generate with AI
                        </button>

                        {/* FAQs */}
                        <div className={styles.previewFaq}>
                           <div className={styles.previewFaqTitle}>
                              Frequently asked questions
                           </div>
                           {state.faqs.length === 0 ? (
                              <button
                                 className={styles.previewAddFaq}
                                 onClick={addFaq}
                              >
                                 Add FAQ <Plus size={14} />
                              </button>
                           ) : (
                              <div className={styles.faqList}>
                                 {state.faqs.map((faq, i) => (
                                    <div key={i} className={styles.faqItem}>
                                       <input
                                          className={styles.faqInput}
                                          placeholder="Question"
                                          value={faq.question}
                                          onChange={(e) =>
                                             updateFaq(i, {
                                                question: e.target.value,
                                             })
                                          }
                                       />
                                       <textarea
                                          className={styles.faqTextarea}
                                          placeholder="Answer"
                                          value={faq.answer}
                                          onChange={(e) =>
                                             updateFaq(i, {
                                                answer: e.target.value,
                                             })
                                          }
                                          rows={2}
                                       />
                                       <button
                                          className={styles.faqRemove}
                                          onClick={() => removeFaq(i)}
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 ))}
                                 <button
                                    className={styles.previewAddFaq}
                                    onClick={addFaq}
                                 >
                                    Add FAQ <Plus size={14} />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Sidebar */}
                     <div className={styles.previewSide}>
                        {/* Banner upload */}
                        {!state.bannerImage && (
                           <div className={styles.previewBannerUpload}>
                              <div className={styles.previewBannerIcon}>
                                 <ImageIcon size={16} />
                              </div>
                              <div className={styles.previewBannerTitle}>
                                 Add banner image
                              </div>
                              <div className={styles.previewBannerSub}>
                                 Shown across the top of your product page.
                              </div>
                           </div>
                        )}

                        {/* Title + price */}
                        <div className={styles.previewTitleBlock}>
                           <div className={styles.previewTitleLabel}>Title</div>
                           <div className={styles.previewTitleRow}>
                              <span className={styles.previewPriceLabel}>
                                 {state.accessType === "free"
                                    ? "$0 once"
                                    : `$${state.price} ${state.currency}`}
                              </span>
                              <ChevronDown
                                 size={14}
                                 className={styles.previewPriceChevron}
                              />
                           </div>
                        </div>

                        <button className={styles.previewNewPricing}>
                           <Plus size={14} /> New pricing option
                        </button>

                        <button
                           className={styles.previewCTA}
                           style={{ background: state.appearanceColor }}
                        >
                           {state.accessType === "free"
                              ? "Join for Free"
                              : state.productSettings.purchaseButtonText}
                        </button>

                        <div className={styles.previewFooter}>
                           🚀 Powered by Space-Ex
                        </div>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
};

export default ProductEditor;
