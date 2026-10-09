"use client";

import React, { useEffect, useState, useRef } from "react";
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
   Trash2,
   HelpCircle,
   AlertTriangle,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/components/productEditor.module.css";

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
   const { activeBusiness, isLoading: workspaceLoading } = useWorkspace();
   const fileInputRef = useRef<HTMLInputElement>(null);

   // UI state
   const [viewMode, setViewMode] = useState<ViewMode>("desktop");
   const [aiPrompt, setAiPrompt] = useState("");
   const [newLabel, setNewLabel] = useState("");
   const [saving, setSaving] = useState(false);
   const [loading, setLoading] = useState(mode === "edit");
   const [uploading, setUploading] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deleting, setDeleting] = useState(false);

   // Form state
   const [name, setName] = useState("");
   const [headline, setHeadline] = useState("");
   const [description, setDescription] = useState("");
   const [bannerImage, setBannerImage] = useState("");
   const [productImage, setProductImage] = useState("");
   const [labels, setLabels] = useState<string[]>([]);
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
   const [checkoutRedirectUrl, setCheckoutRedirectUrl] = useState("");
   const [visibleOnStorePage, setVisibleOnStorePage] = useState(true);

   // Business info
   const businessName = activeBusiness?.name || "";
   const businessInitial = businessName
      ? businessName.charAt(0).toUpperCase()
      : "?";

   // =========================================
   // LOAD PRODUCT (edit mode)
   // =========================================
   useEffect(() => {
      if (mode !== "edit" || !productId) return;

      let cancelled = false;

      const loadProduct = async () => {
         setLoading(true);
         setError("");

         try {
            const res = await fetch(`/api/business/products/${productId}`, {
               headers: { Accept: "application/json" },
            });

            // ✅ Check response is JSON before parsing
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
               console.error(
                  `Non-JSON response (${res.status}):`,
                  (await res.text()).slice(0, 200),
               );
               if (!cancelled) {
                  setError(
                     res.status === 404
                        ? "Product not found"
                        : `Server error (${res.status})`,
                  );
               }
               return;
            }

            const data = await res.json();

            if (!res.ok) {
               if (!cancelled) setError(data.error || "Failed to load product");
               return;
            }

            const p = data.product;
            if (!p) {
               if (!cancelled) setError("Product not found");
               return;
            }

            if (cancelled) return;

            // Populate all fields
            setName(p.name || "");
            setHeadline(p.headline || "");
            setDescription(p.description || "");
            setBannerImage(p.bannerImage || "");
            setProductImage(p.productImage || "");
            setLabels(Array.isArray(p.labels) ? p.labels : []);
            setCollectShippingAddress(!!p.collectShippingAddress);
            setAccessType(p.accessType || "free");
            setPricingType(p.pricingType || "one-time");
            setPrice(p.price || 0);
            setCurrency(p.currency || "USD");
            setRecurringInterval(p.recurringInterval || "monthly");
            setLaunchAsWaitlist(!!p.launchAsWaitlist);
            setAskQuestionsBeforeCheckout(!!p.askQuestionsBeforeCheckout);
            setIncludedApps(
               Array.isArray(p.includedApps) ? p.includedApps : [],
            );
            setFaqs(Array.isArray(p.faqs) ? p.faqs : []);
            setAppearanceColor(p.appearanceColor || "#3b82f6");
            setShowMemberCount(p.growthTools?.showMemberCount !== false);
            setPurchaseButtonText(
               p.productSettings?.purchaseButtonText || "Join",
            );
            setProductTaxCode(p.productSettings?.productTaxCode || "");
            setProductUrl(p.productSettings?.productUrl || "");
            setAddAffiliateRate(p.productSettings?.addAffiliateRate !== false);
            setAffiliateRate(p.productSettings?.affiliateRate || 30);
            setCheckoutRedirect(!!p.productSettings?.checkoutRedirect);
            setCheckoutRedirectUrl(
               p.productSettings?.checkoutRedirectUrl || "",
            );
            setVisibleOnStorePage(
               p.productSettings?.visibleOnStorePage !== false,
            );
         } catch (err) {
            console.error("[ProductEditor] Load error:", err);
            if (!cancelled) setError("Failed to load product");
         } finally {
            if (!cancelled) setLoading(false);
         }
      };

      loadProduct();

      return () => {
         cancelled = true;
      };
   }, [mode, productId]);

   // =========================================
   // IMAGE UPLOAD
   // =========================================
   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
         setError("Image must be under 5MB");
         return;
      }
      if (!file.type.startsWith("image/")) {
         setError("Only image files are allowed");
         return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
         const result = event.target?.result as string;
         setBannerImage(result);
         setUploading(false);
      };
      reader.onerror = () => {
         setError("Failed to read image");
         setUploading(false);
      };
      reader.readAsDataURL(file);
   };

   // =========================================
   // AI GENERATION
   // =========================================
   const generateAI = () => {
      if (!aiPrompt.trim()) return;

      const text = aiPrompt.trim();
      const firstSentence = text.split(/[.!?\n]/)[0].trim();
      const words = firstSentence.split(/\s+/);

      let generatedName = "";
      if (words.length >= 3) {
         generatedName = words.slice(0, 3).join(" ");
      } else if (words.length >= 1) {
         generatedName = words.join(" ");
      } else {
         generatedName = "New Product";
      }
      generatedName = generatedName.slice(0, 60);
      generatedName =
         generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

      const headlineText =
         text.length > 120 ? text.slice(0, 117) + "..." : text;
      const descriptionText = `This product includes:\n\n${text}\n\nGet instant access after checkout. Lifetime updates and support included.`;

      const apps: string[] = [];
      const lower = text.toLowerCase();
      if (
         lower.includes("forum") ||
         lower.includes("community") ||
         lower.includes("discussion")
      ) {
         apps.push("forums");
      }
      if (lower.includes("chat") || lower.includes("message"))
         apps.push("chat");
      if (
         lower.includes("course") ||
         lower.includes("lesson") ||
         lower.includes("learn")
      ) {
         apps.push("courses");
      }
      if (lower.includes("content") || lower.includes("library"))
         apps.push("content");
      if (lower.includes("live") || lower.includes("stream"))
         apps.push("livestreaming");
      if (
         lower.includes("event") ||
         lower.includes("meetup") ||
         lower.includes("call")
      ) {
         apps.push("events");
      }
      if (apps.length === 0) apps.push("content", "chat");

      setName(generatedName);
      setHeadline(headlineText);
      setDescription(descriptionText);
      setIncludedApps(apps);

      const priceMatch = text.match(/\$(\d+)/);
      if (priceMatch) {
         setAccessType("paid");
         setPrice(Number(priceMatch[1]));
      }

      setSuccess("AI generated your product — review the fields and adjust.");
      setTimeout(() => setSuccess(""), 3000);
   };

   // =========================================
   // LABELS
   // =========================================
   const addLabel = () => {
      const trimmed = newLabel.trim();
      if (trimmed && !labels.includes(trimmed) && labels.length < 5) {
         setLabels([...labels, trimmed]);
         setNewLabel("");
      }
   };

   const removeLabel = (label: string) => {
      setLabels(labels.filter((l) => l !== label));
   };

   // =========================================
   // FAQS
   // =========================================
   const addFaq = () => {
      setFaqs([...faqs, { question: "", answer: "" }]);
   };

   const updateFaq = (idx: number, patch: Partial<FAQ>) => {
      const next = [...faqs];
      next[idx] = { ...next[idx], ...patch };
      setFaqs(next);
   };

   const removeFaq = (idx: number) => {
      setFaqs(faqs.filter((_, i) => i !== idx));
   };

   // =========================================
   // APPS
   // =========================================
   const toggleApp = (key: string) => {
      setIncludedApps((prev) =>
         prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
      );
   };

   // =========================================
   // SAVE
   // =========================================
   const handleSave = async () => {
      setError("");
      setSuccess("");

      if (!name.trim()) {
         setError("Product name is required");
         return;
      }
      if (!activeBusiness?.id) {
         setError("No active business. Create or select one first.");
         return;
      }

      setSaving(true);

      try {
         const url =
            mode === "edit" && productId
               ? `/api/business/products/${productId}`
               : "/api/business/products";
         const method = mode === "edit" ? "PATCH" : "POST";

         const body: Record<string, unknown> = {
            name: name.trim(),
            headline,
            description,
            bannerImage,
            productImage,
            labels,
            collectShippingAddress,
            accessType,
            pricingType,
            price,
            currency,
            recurringInterval:
               pricingType === "recurring" ? recurringInterval : "",
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
               checkoutRedirectUrl,
               visibleOnStorePage,
            },
         };

         if (mode === "create") {
            body.businessId = activeBusiness.id;
         }

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         });

         const data = await res.json();

         if (!res.ok) {
            setError(data.error || "Failed to save product");
            return;
         }

         setSuccess(mode === "edit" ? "Product updated!" : "Product created!");

         setTimeout(() => {
            router.push("/business/products");
            router.refresh();
         }, 600);
      } catch (err) {
         console.error(err);
         setError("Network error. Please try again.");
      } finally {
         setSaving(false);
      }
   };

   // =========================================
   // DELETE
   // =========================================
   const handleDelete = async () => {
      if (!productId) return;

      setDeleting(true);
      try {
         const res = await fetch(`/api/business/products/${productId}`, {
            method: "DELETE",
         });

         if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Failed to delete product");
            setDeleting(false);
            return;
         }

         router.push("/business/products");
         router.refresh();
      } catch (err) {
         console.error(err);
         setError("Network error. Please try again.");
         setDeleting(false);
      }
   };

   // =========================================
   // LOADING / NO BUSINESS
   // =========================================
   if (loading || workspaceLoading) {
      return (
         <div className={styles.loading}>
            <div className={styles.spinner} />
            Loading...
         </div>
      );
   }

   if (!activeBusiness) {
      return (
         <div className={styles.loading}>
            <div>No business selected. Create one from the sidebar first.</div>
            <button
               onClick={() => router.push("/business/products")}
               style={{
                  marginTop: 16,
                  padding: "10px 20px",
                  background: "var(--accent-blue)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
               }}
            >
               Back to products
            </button>
         </div>
      );
   }

   return (
      <div className={styles.editor}>
         {/* =========================================
          TOP BAR
          ========================================= */}
         <header className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/products")}
            >
               <ArrowLeft size={16} />
               <span>{mode === "edit" ? "Edit product" : "Add product"}</span>
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

            <div className={styles.topBarRight}>
               {mode === "edit" && (
                  <button
                     type="button"
                     className={styles.deleteBtn}
                     onClick={() => setShowDeleteConfirm(true)}
                  >
                     <Trash2 size={14} />
                     Delete product
                  </button>
               )}
            </div>
         </header>

         {/* =========================================
          TWO COLUMN LAYOUT
          ========================================= */}
         <div className={styles.body}>
            {/* =========================================
            LEFT PANEL
            ========================================= */}
            <aside className={styles.leftPanel}>
               {/* AI SECTION */}
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

               {/* DETAILS */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Details</h3>
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

                  <label className={styles.fieldLabel}>
                     Labels <HelpCircle size={12} style={{ opacity: 0.5 }} />
                  </label>
                  <div className={styles.labelsInput}>
                     {labels.map((label) => (
                        <span key={label} className={styles.labelChip}>
                           {label}
                           <button
                              type="button"
                              onClick={() => removeLabel(label)}
                              aria-label={`Remove ${label}`}
                           >
                              <X size={12} />
                           </button>
                        </span>
                     ))}
                     <input
                        className={styles.labelInput}
                        placeholder={
                           labels.length >= 5
                              ? "Max 5 labels"
                              : "Type a label and press enter"
                        }
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
                        disabled={labels.length >= 5}
                     />
                  </div>

                  <div className={styles.toggleRow}>
                     <div>
                        <div className={styles.toggleLabel}>
                           Collect shipping address
                        </div>
                        <div className={styles.toggleSub}>
                           Ask for a delivery address at checkout for physical
                           goods.
                        </div>
                     </div>
                     <button
                        type="button"
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

               {/* PRICING */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Pricing</h3>
                  <p className={styles.sectionSub}>
                     Choose how people get access to this product.
                  </p>

                  <div className={styles.accessGrid}>
                     <button
                        type="button"
                        className={`${styles.accessCard} ${
                           accessType === "free" ? styles.accessCardActive : ""
                        }`}
                        onClick={() => setAccessType("free")}
                     >
                        <Globe size={16} />
                        <span>Free access</span>
                        {accessType === "free" && (
                           <span className={styles.radio}>●</span>
                        )}
                     </button>
                     <button
                        type="button"
                        className={`${styles.accessCard} ${
                           accessType === "paid" ? styles.accessCardActive : ""
                        }`}
                        onClick={() => setAccessType("paid")}
                     >
                        <DollarSign size={16} />
                        <span>Paid access</span>
                        {accessType === "paid" && (
                           <span className={styles.radio}>●</span>
                        )}
                     </button>
                  </div>

                  {accessType === "paid" && (
                     <div className={styles.paidSection}>
                        <div className={styles.pricingTypes}>
                           <button
                              type="button"
                              className={`${styles.pricingTypeBtn} ${
                                 pricingType === "one-time" ? styles.active : ""
                              }`}
                              onClick={() => setPricingType("one-time")}
                           >
                              One-time
                           </button>
                           <button
                              type="button"
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

                        <label className={styles.fieldLabel}>Price</label>
                        <div className={styles.priceInput}>
                           <span>$</span>
                           <input
                              type="number"
                              value={price || ""}
                              onChange={(e) =>
                                 setPrice(Number(e.target.value) || 0)
                              }
                              placeholder="0"
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
                           <>
                              <label className={styles.fieldLabel}>
                                 Billing interval
                              </label>
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
                           </>
                        )}
                     </div>
                  )}

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Launch as a waitlist
                     </div>
                     <button
                        type="button"
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
                        type="button"
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
               </section>

               {/* APPS */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Apps</h3>
                  <p className={styles.sectionSub}>
                     The content included with this product.
                  </p>

                  <div className={styles.appsGroupLabel}>ADD NEW</div>
                  <div className={styles.appsGrid}>
                     {APP_OPTIONS.map((app) => {
                        const active = includedApps.includes(app.key);
                        return (
                           <button
                              type="button"
                              key={app.key}
                              className={`${styles.appChip} ${
                                 active ? styles.appChipActive : ""
                              }`}
                              onClick={() => toggleApp(app.key)}
                              style={
                                 active
                                    ? {
                                         borderColor: app.color,
                                         background: `${app.color}20`,
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
                        );
                     })}
                  </div>
               </section>

               {/* APPEARANCE */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Appearance</h3>
                  <p className={styles.sectionSub}>Theme and accent color.</p>

                  <div className={styles.colorSectionLabel}>Default</div>
                  <button
                     type="button"
                     className={`${styles.colorSwatchLarge} ${
                        appearanceColor === "#3b82f6"
                           ? styles.colorSwatchActive
                           : ""
                     }`}
                     style={{ background: "#3b82f6" }}
                     onClick={() => setAppearanceColor("#3b82f6")}
                  />

                  <div className={styles.colorSectionLabel}>Custom</div>
                  <div className={styles.colorGrid}>
                     {COLOR_PALETTE.map((color) => (
                        <button
                           type="button"
                           key={color}
                           className={`${styles.colorSwatch} ${
                              appearanceColor === color
                                 ? styles.colorSwatchActive
                                 : ""
                           }`}
                           style={{ background: color }}
                           onClick={() => setAppearanceColor(color)}
                           aria-label={`Color ${color}`}
                        />
                     ))}
                  </div>
               </section>

               {/* GROWTH TOOLS */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Growth tools</h3>

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
                        type="button"
                        className={`${styles.switch} ${
                           showMemberCount ? styles.switchOn : ""
                        }`}
                        onClick={() => setShowMemberCount(!showMemberCount)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {/* PRODUCT SETTINGS */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Product settings</h3>
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
                     placeholder={`space-ex.com/${activeBusiness.id.slice(
                        -6,
                     )}/product`}
                  />

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Add affiliate rate
                     </div>
                     <button
                        type="button"
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
                        type="button"
                        className={`${styles.switch} ${
                           checkoutRedirect ? styles.switchOn : ""
                        }`}
                        onClick={() => setCheckoutRedirect(!checkoutRedirect)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  {checkoutRedirect && (
                     <input
                        className={styles.input}
                        value={checkoutRedirectUrl}
                        onChange={(e) => setCheckoutRedirectUrl(e.target.value)}
                        placeholder="https://yourdomain.com/thank-you"
                     />
                  )}

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        Visible on your store page
                     </div>
                     <button
                        type="button"
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

               {/* ERROR / SUCCESS */}
               {error && <div className={styles.error}>{error}</div>}
               {success && <div className={styles.success}>{success}</div>}

               {/* SAVE BUTTON */}
               <button
                  type="button"
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

            {/* =========================================
            RIGHT PANEL — LIVE PREVIEW
            ========================================= */}
            <main
               className={`${styles.preview} ${styles[`preview-${viewMode}`]}`}
            >
               <div className={styles.previewInner}>
                  {/* Brand Header */}
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

                  {/* Product Preview */}
                  <div className={styles.productPreview}>
                     <div className={styles.previewMain}>
                        {/* Media Area */}
                        <div className={styles.previewMedia}>
                           {bannerImage ? (
                              <div className={styles.previewMediaWithImage}>
                                 <img
                                    src={bannerImage}
                                    alt="Product banner"
                                    className={styles.previewImage}
                                 />
                                 <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={() => setBannerImage("")}
                                    aria-label="Remove image"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
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
                                    <input
                                       ref={fileInputRef}
                                       type="file"
                                       accept="image/*"
                                       onChange={handleImageUpload}
                                       style={{ display: "none" }}
                                    />
                                    <button
                                       type="button"
                                       className={styles.previewSmallBtn}
                                       onClick={() =>
                                          fileInputRef.current?.click()
                                       }
                                       disabled={uploading}
                                    >
                                       <Upload size={14} />
                                       {uploading ? "Uploading..." : "Upload"}
                                    </button>
                                    <button
                                       type="button"
                                       className={styles.previewSmallBtn}
                                       onClick={() => {
                                          const seed = Math.floor(
                                             Math.random() * 1000,
                                          );
                                          setBannerImage(
                                             `https://picsum.photos/seed/${seed}/1200/675`,
                                          );
                                       }}
                                    >
                                       <ImageIcon size={14} /> Free stock photos
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Headline */}
                        <div className={styles.previewHeadline}>
                           {headline || (
                              <span className={styles.previewPlaceholder}>
                                 Write a headline...
                              </span>
                           )}
                        </div>

                        {/* Description */}
                        <div className={styles.previewDescription}>
                           {description || (
                              <span className={styles.previewPlaceholderSmall}>
                                 Write a description...
                              </span>
                           )}
                        </div>

                        {/* Generate with AI */}
                        <button type="button" className={styles.previewAiBtn}>
                           <Sparkles size={12} /> Generate with AI
                        </button>

                        {/* FAQs */}
                        <div className={styles.previewFaq}>
                           <div className={styles.previewFaqTitle}>
                              Frequently asked questions
                           </div>

                           {faqs.length === 0 ? (
                              <button
                                 type="button"
                                 className={styles.previewAddFaq}
                                 onClick={addFaq}
                              >
                                 Add FAQ <Plus size={14} />
                              </button>
                           ) : (
                              <div className={styles.faqList}>
                                 {faqs.map((faq, i) => (
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
                                          type="button"
                                          className={styles.faqRemove}
                                          onClick={() => removeFaq(i)}
                                          aria-label="Remove FAQ"
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 ))}
                                 <button
                                    type="button"
                                    className={styles.previewAddFaq}
                                    onClick={addFaq}
                                 >
                                    Add FAQ <Plus size={14} />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Preview Sidebar */}
                     <div className={styles.previewSide}>
                        {!bannerImage && (
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

                        <div className={styles.previewTitleBlock}>
                           <div className={styles.previewTitleLabel}>Title</div>
                           <div className={styles.previewTitleRow}>
                              <span className={styles.previewPriceLabel}>
                                 {accessType === "free"
                                    ? "$0 once"
                                    : `$${price} ${currency}${
                                         pricingType === "recurring"
                                            ? ` / ${
                                                 recurringInterval === "monthly"
                                                    ? "mo"
                                                    : "yr"
                                              }`
                                            : ""
                                      }`}
                              </span>
                              <ChevronDown
                                 size={14}
                                 className={styles.previewPriceChevron}
                              />
                           </div>
                        </div>

                        <button
                           type="button"
                           className={styles.previewNewPricing}
                        >
                           <Plus size={14} /> New pricing option
                        </button>

                        <button
                           type="button"
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

         {/* =========================================
          DELETE CONFIRMATION MODAL
          ========================================= */}
         {showDeleteConfirm && (
            <div
               className={styles.confirmOverlay}
               onClick={() => !deleting && setShowDeleteConfirm(false)}
            >
               <div
                  className={styles.confirmModal}
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className={styles.confirmIcon}>
                     <AlertTriangle size={24} />
                  </div>

                  <h3 className={styles.confirmTitle}>Delete product?</h3>

                  <p className={styles.confirmText}>
                     Are you sure you want to delete{" "}
                     <strong>{name || "this product"}</strong>? This action
                     cannot be undone. All associated data, sales history, and
                     content will be permanently removed.
                  </p>

                  <div className={styles.confirmActions}>
                     <button
                        type="button"
                        className={styles.confirmCancelBtn}
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleting}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        className={styles.confirmDeleteBtn}
                        onClick={handleDelete}
                        disabled={deleting}
                     >
                        {deleting ? "Deleting..." : "Delete product"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ProductEditor;
