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
   ChevronDown,
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

const ProductEditor: React.FC<ProductEditorProps> = ({ mode, productId }) => {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [viewMode, setViewMode] = useState<ViewMode>("desktop");
   const [name, setName] = useState("");
   const [headline, setHeadline] = useState("");
   const [description, setDescription] = useState("");
   const [bannerImage, setBannerImage] = useState("");
   const [labels, setLabels] = useState<string[]>([]);
   const [newLabel, setNewLabel] = useState("");
   const [collectShippingAddress, setCollectShippingAddress] = useState(false);
   const [accessType, setAccessType] = useState<"free" | "paid">("free");
   const [pricingType, setPricingType] = useState<"one-time" | "recurring">(
      "one-time",
   );
   const [price, setPrice] = useState(0);
   const [currency, setCurrency] = useState("USD");
   const [recurringInterval, setRecurringInterval] = useState<
      "monthly" | "yearly"
   >("monthly");
   const [launchAsWaitlist, setLaunchAsWaitlist] = useState(false);
   const [askQuestionsBeforeCheckout, setAskQuestionsBeforeCheckout] =
      useState(false);
   const [includedApps, setIncludedApps] = useState<string[]>([]);
   const [faqs, setFaqs] = useState<FAQ[]>([]);
   const [appearanceColor, setAppearanceColor] = useState("#3b82f6");
   const [showMemberCount, setShowMemberCount] = useState(true);
   const [purchaseButtonText, setPurchaseButtonText] = useState("Join");
   const [productTaxCode, setProductTaxCode] = useState("");
   const [productUrl, setProductUrl] = useState("");
   const [addAffiliateRate, setAddAffiliateRate] = useState(true);
   const [affiliateRate, setAffiliateRate] = useState(30);
   const [checkoutRedirect, setCheckoutRedirect] = useState(false);
   const [visibleOnStorePage, setVisibleOnStorePage] = useState(true);
   const [aiPrompt, setAiPrompt] = useState("");
   const [saving, setSaving] = useState(false);
   const [loading, setLoading] = useState(mode === "edit");
   const [error, setError] = useState("");

   const businessName = activeBusiness?.name || "Space/Ex";
   const businessInitial = businessName.charAt(0).toUpperCase();

   useEffect(() => {
      if (mode === "edit" && productId) {
         setLoading(true);
         fetch(`/api/business/products/${productId}`)
            .then((r) => r.json())
            .then((d) => {
               const p = d.product;
               if (!p) return;
               setName(p.name || "");
               setHeadline(p.headline || "");
               setDescription(p.description || "");
               setBannerImage(p.bannerImage || "");
               setLabels(p.labels || []);
               setCollectShippingAddress(!!p.collectShippingAddress);
               setAccessType(p.accessType || "free");
               setPricingType(p.pricingType || "one-time");
               setPrice(p.price || 0);
               setCurrency(p.currency || "USD");
               setRecurringInterval(p.recurringInterval || "monthly");
               setLaunchAsWaitlist(!!p.launchAsWaitlist);
               setAskQuestionsBeforeCheckout(!!p.askQuestionsBeforeCheckout);
               setIncludedApps(p.includedApps || []);
               setFaqs(p.faqs || []);
               setAppearanceColor(p.appearanceColor || "#3b82f6");
               setShowMemberCount(p.growthTools?.showMemberCount !== false);
               setPurchaseButtonText(
                  p.productSettings?.purchaseButtonText || "Join",
               );
               setProductTaxCode(p.productSettings?.productTaxCode || "");
               setProductUrl(p.productSettings?.productUrl || "");
               setAddAffiliateRate(
                  p.productSettings?.addAffiliateRate !== false,
               );
               setAffiliateRate(p.productSettings?.affiliateRate || 30);
               setCheckoutRedirect(!!p.productSettings?.checkoutRedirect);
               setVisibleOnStorePage(
                  p.productSettings?.visibleOnStorePage !== false,
               );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
      }
   }, [mode, productId]);

   const addLabel = () => {
      if (newLabel.trim() && !labels.includes(newLabel.trim())) {
         setLabels([...labels, newLabel.trim()]);
         setNewLabel("");
      }
   };

   const toggleApp = (key: string) => {
      setIncludedApps((prev) =>
         prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
      );
   };

   const generateAI = () => {
      const baseName =
         aiPrompt.split(/[.,]/)[0].trim().slice(0, 60) || "New Product";
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      setHeadline(aiPrompt.slice(0, 100) || "Get access to exclusive content");
      setDescription(`This product includes: ${aiPrompt.slice(0, 400)}`);
   };

   const handleSave = async () => {
      if (!name.trim()) {
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
               name,
               headline,
               description,
               bannerImage,
               labels,
               collectShippingAddress,
               accessType,
               pricingType,
               price,
               currency,
               recurringInterval,
               launchAsWaitlist,
               askQuestionsBeforeCheckout,
               includedApps,
               faqs,
               appearanceColor,
               growthTools: { showMemberCount },
               productSettings: {
                  purchaseButtonText,
                  productTaxCode,
                  productUrl,
                  addAffiliateRate,
                  affiliateRate,
                  checkoutRedirect,
                  checkoutRedirectUrl: "",
                  visibleOnStorePage,
               },
            }),
         });

         const data = await res.json();
         if (!res.ok) {
            setError(data.error || "Failed to save product");
            return;
         }
         router.push("/business/products");
         router.refresh();
      } catch {
         setError("Network error. Please try again.");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className={styles.loading}>Loading product...</div>;

   return (
      <div className={styles.editor}>
         <header className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/products")}
            >
               <ArrowLeft size={16} /> <span>Add product</span>
            </button>

            <div className={styles.viewTabs}>
               {(["desktop", "mobile", "member"] as ViewMode[]).map((v) => (
                  <button
                     key={v}
                     className={`${styles.viewTab} ${
                        viewMode === v ? styles.viewTabActive : ""
                     }`}
                     onClick={() => setViewMode(v)}
                  >
                     {v === "desktop" && "💻 Desktop"}
                     {v === "mobile" && "📱 Mobile"}
                     {v === "member" && "👤 Member view"}
                  </button>
               ))}
            </div>
         </header>

         <div className={styles.body}>
            <aside className={styles.leftPanel}>
               {/* AI Section */}
               <div className={styles.aiSection}>
                  <div className={styles.aiHeader}>
                     <Sparkles size={14} className={styles.aiIcon} />
                     <span>Describe what you want to sell</span>
                  </div>
                  <p className={styles.aiSub}>
                     AI drafts the name, page copy, pricing and apps.
                  </p>
                  <textarea
                     className={styles.aiInput}
                     placeholder="e.g. A monthly community for indie game devs with weekly critique calls"
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
                  <h3 className={styles.sectionHeader}>Details</h3>
                  <p className={styles.sectionSub}>
                     The name buyers see on your product page.
                  </p>

                  <label className={styles.fieldLabel}>Name *</label>
                  <input
                     className={styles.input}
                     value={name}
                     onChange={(e) => setName(e.target.value.slice(0, 80))}
                     placeholder="Basic access"
                  />
                  <div className={styles.charCount}>{name.length} / 80</div>

                  <label className={styles.fieldLabel}>Labels</label>
                  <div className={styles.labelsInput}>
                     {labels.map((label) => (
                        <span key={label} className={styles.labelChip}>
                           {label}
                           <button
                              onClick={() =>
                                 setLabels(labels.filter((l) => l !== label))
                              }
                           >
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

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Collect shipping address
                     </div>
                     <button
                        className={`${styles.switch} ${
                           collectShippingAddress ? styles.switchOn : ""
                        }`}
                        onClick={() =>
                           setCollectShippingAddress(!collectShippingAddress)
                        }
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {/* Pricing */}
               <section className={styles.section}>
                  <h3 className={styles.sectionHeader}>Pricing</h3>

                  <div className={styles.accessGrid}>
                     <button
                        className={`${styles.accessCard} ${
                           accessType === "free" ? styles.accessCardActive : ""
                        }`}
                        onClick={() => setAccessType("free")}
                     >
                        <Globe size={16} />
                        <span>Free access</span>
                     </button>
                     <button
                        className={`${styles.accessCard} ${
                           accessType === "paid" ? styles.accessCardActive : ""
                        }`}
                        onClick={() => setAccessType("paid")}
                     >
                        <DollarSign size={16} />
                        <span>Paid access</span>
                     </button>
                  </div>

                  {accessType === "paid" && (
                     <div className={styles.paidSection}>
                        <div className={styles.pricingTypes}>
                           <button
                              className={`${styles.pricingTypeBtn} ${
                                 pricingType === "one-time" ? styles.active : ""
                              }`}
                              onClick={() => setPricingType("one-time")}
                           >
                              One-time
                           </button>
                           <button
                              className={`${styles.pricingTypeBtn} ${
                                 pricingType === "recurring"
                                    ? styles.active
                                    : ""
                              }`}
                              onClick={() => setPricingType("recurring")}
                           >
                              Recurring
                           </button>
                        </div>

                        <div className={styles.priceInput}>
                           <span>$</span>
                           <input
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(Number(e.target.value))}
                              min={0}
                           />
                           <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                           >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                           </select>
                        </div>

                        {pricingType === "recurring" && (
                           <select
                              className={styles.input}
                              value={recurringInterval}
                              onChange={(e) =>
                                 setRecurringInterval(
                                    e.target.value as "monthly" | "yearly",
                                 )
                              }
                           >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                           </select>
                        )}
                     </div>
                  )}

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Launch as a waitlist
                     </div>
                     <button
                        className={`${styles.switch} ${
                           launchAsWaitlist ? styles.switchOn : ""
                        }`}
                        onClick={() => setLaunchAsWaitlist(!launchAsWaitlist)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Ask questions before checkout
                     </div>
                     <button
                        className={`${styles.switch} ${
                           askQuestionsBeforeCheckout ? styles.switchOn : ""
                        }`}
                        onClick={() =>
                           setAskQuestionsBeforeCheckout(
                              !askQuestionsBeforeCheckout,
                           )
                        }
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  <button className={styles.linkBtn}>
                     <Settings2 size={14} /> Plan settings
                  </button>
               </section>

               {/* Apps */}
               <section className={styles.section}>
                  <h3 className={styles.sectionHeader}>Apps</h3>
                  <p className={styles.sectionSub}>
                     The content included with this product.
                  </p>

                  <div className={styles.appsGroupLabel}>ADD NEW</div>
                  <div className={styles.appsGrid}>
                     {APP_OPTIONS.map((app) => (
                        <button
                           key={app.key}
                           className={`${styles.appChip} ${
                              includedApps.includes(app.key)
                                 ? styles.appChipActive
                                 : ""
                           }`}
                           onClick={() => toggleApp(app.key)}
                        >
                           <span
                              className={styles.appDot}
                              style={{ background: app.color }}
                           />
                           {app.label}
                        </button>
                     ))}
                  </div>
               </section>

               {/* Appearance */}
               <section className={styles.section}>
                  <h3 className={styles.sectionHeader}>Appearance</h3>

                  <div className={styles.colorSectionLabel}>Default</div>
                  <button
                     className={styles.colorSwatchLarge}
                     style={{ background: "#3b82f6" }}
                     onClick={() => setAppearanceColor("#3b82f6")}
                  />

                  <div className={styles.colorSectionLabel}>Custom</div>
                  <div className={styles.colorGrid}>
                     {COLOR_PALETTE.map((color) => (
                        <button
                           key={color}
                           className={styles.colorSwatch}
                           style={{ background: color }}
                           onClick={() => setAppearanceColor(color)}
                        />
                     ))}
                  </div>
               </section>

               {/* Growth tools */}
               <section className={styles.section}>
                  <h3 className={styles.sectionHeader}>Growth tools</h3>

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
                        className={`${styles.switch} ${
                           showMemberCount ? styles.switchOn : ""
                        }`}
                        onClick={() => setShowMemberCount(!showMemberCount)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {/* Product settings */}
               <section className={styles.section}>
                  <h3 className={styles.sectionHeader}>Product settings</h3>
                  <p className={styles.sectionSub}>
                     URL, taxes, affiliates, and more.
                  </p>

                  <label className={styles.fieldLabel}>
                     Purchase button text
                  </label>
                  <select
                     className={styles.input}
                     value={purchaseButtonText}
                     onChange={(e) => setPurchaseButtonText(e.target.value)}
                  >
                     {BUTTON_TEXT_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                     ))}
                  </select>

                  <label className={styles.fieldLabel}>Product tax code</label>
                  <select
                     className={styles.input}
                     value={productTaxCode}
                     onChange={(e) => setProductTaxCode(e.target.value)}
                  >
                     <option value="">Use preset</option>
                     <option value="digital">Digital goods</option>
                     <option value="physical">Physical goods</option>
                     <option value="services">Services</option>
                  </select>

                  <label className={styles.fieldLabel}>Product URL</label>
                  <input
                     className={styles.input}
                     value={productUrl}
                     onChange={(e) => setProductUrl(e.target.value)}
                     placeholder="yourbusiness.com/product"
                  />

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Add affiliate rate
                     </div>
                     <button
                        className={`${styles.switch} ${
                           addAffiliateRate ? styles.switchOn : ""
                        }`}
                        onClick={() => setAddAffiliateRate(!addAffiliateRate)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  {addAffiliateRate && (
                     <div className={styles.affiliateInput}>
                        <input
                           type="number"
                           value={affiliateRate}
                           onChange={(e) =>
                              setAffiliateRate(Number(e.target.value))
                           }
                           min={0}
                           max={100}
                        />
                        <span>%</span>
                     </div>
                  )}

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>Checkout redirect</div>
                     <button
                        className={`${styles.switch} ${
                           checkoutRedirect ? styles.switchOn : ""
                        }`}
                        onClick={() => setCheckoutRedirect(!checkoutRedirect)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Visible on your store page
                     </div>
                     <button
                        className={`${styles.switch} ${
                           visibleOnStorePage ? styles.switchOn : ""
                        }`}
                        onClick={() =>
                           setVisibleOnStorePage(!visibleOnStorePage)
                        }
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {error && <div className={styles.error}>{error}</div>}

               <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
               >
                  {saving
                     ? "Saving..."
                     : mode === "edit"
                       ? "Save changes"
                       : "Create product"}
               </button>
            </aside>

            {/* Preview */}
            <main
               className={`${styles.preview} ${styles[`preview-${viewMode}`]}`}
            >
               <div className={styles.previewInner}>
                  <div className={styles.previewBrand}>
                     <div
                        className={styles.previewBrandIcon}
                        style={{ background: appearanceColor }}
                     >
                        {businessInitial}
                     </div>
                     <span className={styles.previewBrandName}>
                        {businessName}
                     </span>
                  </div>

                  <div className={styles.productPreview}>
                     <div className={styles.previewMain}>
                        <div className={styles.previewMedia}>
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
                        </div>

                        <div className={styles.previewHeadline}>
                           {headline || (
                              <span className={styles.previewPlaceholder}>
                                 Write a headline...
                              </span>
                           )}
                        </div>

                        <div className={styles.previewDescription}>
                           {description || (
                              <span className={styles.previewPlaceholderSmall}>
                                 Write a description...
                              </span>
                           )}
                        </div>

                        <button className={styles.previewAiBtn}>
                           <Sparkles size={12} /> Generate with AI
                        </button>

                        <div className={styles.previewFaq}>
                           <div className={styles.previewFaqTitle}>
                              Frequently asked questions
                           </div>
                           <button
                              className={styles.previewAddFaq}
                              onClick={() =>
                                 setFaqs([
                                    ...faqs,
                                    { question: "", answer: "" },
                                 ])
                              }
                           >
                              Add FAQ <Plus size={14} />
                           </button>
                        </div>
                     </div>

                     <div className={styles.previewSide}>
                        <div className={styles.previewTitleBlock}>
                           <div className={styles.previewTitleLabel}>Title</div>
                           <div className={styles.previewTitleRow}>
                              <span className={styles.previewPriceLabel}>
                                 {accessType === "free"
                                    ? "$0 once"
                                    : `$${price} ${currency}`}
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
                           style={{ background: appearanceColor }}
                        >
                           {accessType === "free"
                              ? "Join for Free"
                              : purchaseButtonText}
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
