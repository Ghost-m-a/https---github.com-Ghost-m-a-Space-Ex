"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft,
   X,
   Monitor,
   Smartphone,
   ChevronDown,
   Info,
   Copy,
   Check,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import styles from "@/styles/components/checkoutLinkEditor.module.css";

interface Props {
   mode: "create" | "edit";
   linkId?: string;
   productId?: string;
}

const APP_OPTIONS = [{ key: "forums", label: "Public forum" }];

export default function CheckoutLinkEditor({ mode, linkId, productId }: Props) {
   const router = useRouter();
   const { activeBusiness, isLoading: workspaceLoading } = useWorkspace();

   const [viewMode, setViewMode] = useState<"desktop" | "mobile">("mobile");
   const [loading, setLoading] = useState(mode === "edit");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");
   const [copied, setCopied] = useState(false);

   const [productName, setProductName] = useState("");
   const [headline, setHeadline] = useState("");
   const [description, setDescription] = useState("");
   const [includedApps, setIncludedApps] = useState<string[]>(["forums"]);
   const [pricingType, setPricingType] = useState<
      "free" | "one-time" | "recurring"
   >("one-time");
   const [price, setPrice] = useState(10);
   const [currency, setCurrency] = useState("USD");
   const [recurringInterval, setRecurringInterval] = useState<
      "monthly" | "yearly"
   >("monthly");
   const [amountPresets, setAmountPresets] = useState<number[]>([50, 100, 250]);
   const [advancedOptions, setAdvancedOptions] = useState(false);
   const [acceptLocalCurrencies, setAcceptLocalCurrencies] = useState(true);
   const [customizePaymentMethods, setCustomizePaymentMethods] =
      useState(false);
   const [bgColor, setBgColor] = useState("#000000");
   const [buttonColor, setButtonColor] = useState("#ffffff");
   const [font, setFont] = useState("global");
   const [borderStyle, setBorderStyle] = useState("global");

   const businessName = activeBusiness?.name || "";
   const businessInitial = businessName.charAt(0).toUpperCase() || "?";

   // Load for edit mode
   useEffect(() => {
      if (mode !== "edit" || !linkId) return;
      setLoading(true);
      fetch(`/api/business/checkout-links/${linkId}`)
         .then((r) => r.json())
         .then((d) => {
            const l = d.link;
            if (!l) return;
            setProductName(l.productName || "");
            setHeadline(l.headline || "");
            setDescription(l.description || "");
            setIncludedApps(
               Array.isArray(l.includedApps) ? l.includedApps : [],
            );
            setPricingType(l.pricingType || "one-time");
            setPrice(l.price || 0);
            setCurrency(l.currency || "USD");
            setRecurringInterval(l.recurringInterval || "monthly");
            setAmountPresets(l.amountPresets || [50, 100, 250]);
            setAdvancedOptions(!!l.advancedOptions);
            setAcceptLocalCurrencies(l.acceptLocalCurrencies !== false);
            setCustomizePaymentMethods(!!l.customizePaymentMethods);
            setBgColor(l.checkoutBranding?.backgroundColor || "#000000");
            setButtonColor(l.checkoutBranding?.buttonColor || "#ffffff");
            setFont(l.checkoutBranding?.font || "global");
            setBorderStyle(l.checkoutBranding?.borderStyle || "global");
         })
         .catch(() => setError("Failed to load"))
         .finally(() => setLoading(false));
   }, [mode, linkId]);

   const toggleApp = (key: string) => {
      setIncludedApps((prev) =>
         prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
      );
   };

   const handleSave = async () => {
      setError("");
      if (!productName.trim()) {
         setError("Product name is required");
         return;
      }
      if (!activeBusiness?.id) {
         setError("No active business");
         return;
      }

      setSaving(true);

      try {
         const url =
            mode === "edit" && linkId
               ? `/api/business/checkout-links/${linkId}`
               : "/api/business/checkout-links";
         const method = mode === "edit" ? "PATCH" : "POST";

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               businessId: activeBusiness.id,
               productId,
               productName,
               headline,
               description,
               includedApps,
               pricingType,
               price,
               currency,
               recurringInterval:
                  pricingType === "recurring" ? recurringInterval : "",
               amountPresets,
               advancedOptions,
               acceptLocalCurrencies,
               customizePaymentMethods,
               checkoutBranding: {
                  backgroundColor: bgColor,
                  buttonColor,
                  font,
                  borderStyle,
               },
            }),
         });

         const data = await res.json();
         if (!res.ok) {
            setError(data.error || "Failed to save");
            return;
         }

         router.push("/business/payments");
         router.refresh();
      } catch {
         setError("Network error");
      } finally {
         setSaving(false);
      }
   };

   const copyLink = () => {
      const url = `https://space-ex.com/${(activeBusiness?.initial || "s").toLowerCase()}/${productName
         .toLowerCase()
         .replace(/[^\w\s-]/g, "")
         .replace(/[\s_-]+/g, "-")
         .slice(0, 40)}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const displayPrice =
      pricingType === "free" ? "$0.00" : `$${price.toFixed(2)}`;

   const displayPriceSuffix =
      pricingType === "recurring"
         ? ` / ${recurringInterval === "monthly" ? "mo" : "yr"}`
         : "";

   if (loading || workspaceLoading) {
      return <div className={styles.loading}>Loading...</div>;
   }

   return (
      <div className={styles.editor}>
         {/* Top Bar */}
         <header className={styles.topBar}>
            <button
               className={styles.backBtn}
               onClick={() => router.push("/business/payments")}
            >
               <ArrowLeft size={16} />
               <span>Checkout links</span>
            </button>

            <div className={styles.viewTabs}>
               <button
                  className={`${styles.viewTab} ${viewMode === "desktop" ? styles.viewTabActive : ""}`}
                  onClick={() => setViewMode("desktop")}
               >
                  <Monitor size={14} /> Desktop
               </button>
               <button
                  className={`${styles.viewTab} ${viewMode === "mobile" ? styles.viewTabActive : ""}`}
                  onClick={() => setViewMode("mobile")}
               >
                  <Smartphone size={14} /> Mobile
               </button>
            </div>

            <div className={styles.topRight}>
               <button className={styles.copyBtn} onClick={copyLink}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy link"}
               </button>
            </div>
         </header>

         {/* Body */}
         <div className={styles.body}>
            {/* LEFT PANEL */}
            <aside className={styles.leftPanel}>
               {/* Product */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Product</h3>
                  <p className={styles.sectionSub}>
                     What this link sells, and what buyers read before they pay.
                  </p>

                  <label className={styles.fieldLabel}>Product</label>
                  <div className={styles.selectWrap}>
                     <select
                        className={styles.input}
                        value={productName ? "custom" : "new"}
                        onChange={() => {}}
                     >
                        <option value="new">Adding new product</option>
                     </select>
                     <ChevronDown size={14} className={styles.selectChevron} />
                  </div>
               </section>

               <section className={styles.section}>
                  <label className={styles.fieldLabel}>Product name</label>
                  <input
                     className={styles.input}
                     value={productName}
                     onChange={(e) =>
                        setProductName(e.target.value.slice(0, 80))
                     }
                     placeholder="Premium Membership"
                  />

                  <label className={styles.fieldLabel}>Headline</label>
                  <input
                     className={styles.input}
                     value={headline}
                     onChange={(e) => setHeadline(e.target.value.slice(0, 80))}
                     placeholder="How to Build a Viral App: $0 to $100k/mo"
                  />

                  <label className={styles.fieldLabel}>
                     Description{" "}
                     <span className={styles.charCount}>
                        {description.length} / 80
                     </span>
                  </label>
                  <textarea
                     className={styles.textarea}
                     value={description}
                     onChange={(e) =>
                        setDescription(e.target.value.slice(0, 400))
                     }
                     placeholder="Describe what your customers will get with this plan"
                     rows={3}
                  />
               </section>

               {/* Included apps */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Included apps</h3>

                  {APP_OPTIONS.map((app) => {
                     const active = includedApps.includes(app.key);
                     return (
                        <div key={app.key} className={styles.appRow}>
                           <div className={styles.appLeft}>
                              <div className={styles.appIcon}>💬</div>
                              <span>{app.label}</span>
                           </div>
                           <button
                              type="button"
                              className={`${styles.switch} ${active ? styles.switchOn : ""}`}
                              onClick={() => toggleApp(app.key)}
                           >
                              <span className={styles.switchThumb} />
                           </button>
                        </div>
                     );
                  })}
               </section>

               {/* Pricing */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Pricing</h3>
                  <p className={styles.sectionSub}>
                     What buyers pay, and how they can pay it.
                  </p>

                  <div className={styles.pricingTabs}>
                     {(["free", "one-time", "recurring"] as const).map((t) => (
                        <button
                           key={t}
                           className={`${styles.pricingTab} ${pricingType === t ? styles.pricingTabActive : ""}`}
                           onClick={() => setPricingType(t)}
                        >
                           {t === "free"
                              ? "Free"
                              : t === "one-time"
                                ? "One-time"
                                : "Recurring"}
                        </button>
                     ))}
                  </div>

                  {pricingType !== "free" && (
                     <>
                        <label className={styles.fieldLabel}>Price</label>
                        <div className={styles.priceRow}>
                           <span className={styles.priceSymbol}>$</span>
                           <input
                              type="number"
                              className={styles.priceInput}
                              value={price || ""}
                              onChange={(e) =>
                                 setPrice(Number(e.target.value) || 0)
                              }
                              min={0}
                           />
                           <select
                              className={styles.currencySelect}
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                           >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                           </select>
                        </div>

                        <div className={styles.presetsRow}>
                           {amountPresets.map((p) => (
                              <button
                                 key={p}
                                 className={styles.presetBtn}
                                 onClick={() => setPrice(p)}
                              >
                                 ${p}
                              </button>
                           ))}
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
                     </>
                  )}

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        <Info size={12} /> Advanced options
                     </div>
                     <button
                        className={`${styles.switch} ${advancedOptions ? styles.switchOn : ""}`}
                        onClick={() => setAdvancedOptions(!advancedOptions)}
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {/* Payment methods */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Payment methods</h3>
                  <p className={styles.sectionSub}>
                     Which methods buyers can pay with at checkout.
                  </p>

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        <span className={styles.globeIcon}>🌐</span> Accept
                        local currency payments
                     </div>
                     <button
                        className={`${styles.switch} ${acceptLocalCurrencies ? styles.switchOn : ""}`}
                        onClick={() =>
                           setAcceptLocalCurrencies(!acceptLocalCurrencies)
                        }
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>

                  <div className={styles.toggleRow}>
                     <div className={styles.toggleLabel}>
                        <span className={styles.cardIcon}>💳</span> Customize
                        payment methods
                     </div>
                     <button
                        className={`${styles.switch} ${customizePaymentMethods ? styles.switchOn : ""}`}
                        onClick={() =>
                           setCustomizePaymentMethods(!customizePaymentMethods)
                        }
                     >
                        <span className={styles.switchThumb} />
                     </button>
                  </div>
               </section>

               {/* Checkout branding */}
               <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Checkout branding</h3>
                  <p className={styles.sectionSub}>
                     Inheriting your company-wide checkout branding
                  </p>
                  <p className={styles.sectionHint}>
                     These settings apply to this checkout link only. To change
                     the defaults for all links, edit your{" "}
                     <a className={styles.link}>global checkout branding ↗</a>
                  </p>

                  <div className={styles.brandingRow}>
                     <span>Background</span>
                     <button className={styles.colorBtn}>
                        <span
                           className={styles.colorDot}
                           style={{ background: bgColor }}
                        />
                        Default
                     </button>
                  </div>

                  <div className={styles.brandingRow}>
                     <span>Button</span>
                     <button className={styles.colorBtn}>
                        <span
                           className={styles.colorDot}
                           style={{ background: buttonColor }}
                        />
                        Default
                     </button>
                  </div>

                  <label className={styles.fieldLabel}>Font</label>
                  <select
                     className={styles.input}
                     value={font}
                     onChange={(e) => setFont(e.target.value)}
                  >
                     <option value="global">Global default</option>
                     <option value="inter">Inter</option>
                     <option value="roboto">Roboto</option>
                  </select>

                  <label className={styles.fieldLabel}>Border style</label>
                  <select
                     className={styles.input}
                     value={borderStyle}
                     onChange={(e) => setBorderStyle(e.target.value)}
                  >
                     <option value="global">Global default</option>
                     <option value="rounded">Rounded</option>
                     <option value="pill">Pill</option>
                     <option value="square">Square</option>
                  </select>
               </section>

               {error && <div className={styles.error}>{error}</div>}

               <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving || !productName.trim()}
               >
                  {saving
                     ? "Saving..."
                     : mode === "edit"
                       ? "Save changes"
                       : "Create checkout link"}
               </button>
            </aside>

            {/* RIGHT PANEL — LIVE PREVIEW */}
            <main
               className={`${styles.preview} ${viewMode === "mobile" ? styles.previewMobile : styles.previewDesktop}`}
            >
               <div className={styles.previewInner}>
                  {viewMode === "mobile" ? (
                     /* Mobile preview (phone frame) */
                     <div className={styles.phoneFrame}>
                        <div className={styles.phoneNotch} />
                        <div className={styles.phoneContent}>
                           {/* Browser bar */}
                           <div className={styles.phoneBrowserBar}>
                              <span className={styles.browserLock}>🔒</span>
                              <span className={styles.browserUrl}>
                                 space-ex.com/checkout
                              </span>
                           </div>

                           <div className={styles.checkoutBody}>
                              <div className={styles.checkoutHeader}>
                                 <div
                                    className={styles.checkoutBrandIcon}
                                    style={{ background: "#3b82f6" }}
                                 >
                                    {businessInitial}
                                 </div>
                                 <span className={styles.checkoutBrandName}>
                                    {businessName}
                                 </span>
                                 <a className={styles.promoLink}>
                                    Promo code & details
                                 </a>
                              </div>

                              <div className={styles.checkoutSeller}>
                                 {businessName}
                              </div>
                              <div className={styles.checkoutPrice}>
                                 {displayPrice}
                                 <span className={styles.checkoutPriceSuffix}>
                                    {displayPriceSuffix}
                                 </span>
                              </div>

                              <div className={styles.checkoutField}>
                                 <label>Email</label>
                                 <input
                                    className={styles.checkoutInput}
                                    value="johnappleseed@gmail.com"
                                    readOnly
                                 />
                              </div>

                              <div className={styles.checkoutMethod}>
                                 <div className={styles.methodHeader}>
                                    Payment method
                                 </div>
                                 <button className={styles.methodBtn}>
                                    <span>💳</span> Card
                                 </button>

                                 <label className={styles.checkoutLabel}>
                                    Card information
                                 </label>
                                 <input
                                    className={styles.checkoutInput}
                                    placeholder="1234 1234 1234 1234"
                                    readOnly
                                 />
                                 <div className={styles.cardRow}>
                                    <input
                                       className={styles.checkoutInput}
                                       placeholder="MM / YY"
                                       readOnly
                                    />
                                    <input
                                       className={styles.checkoutInput}
                                       placeholder="CVC"
                                       readOnly
                                    />
                                 </div>

                                 <label className={styles.checkoutLabel}>
                                    Billing details
                                 </label>
                                 <input
                                    className={styles.checkoutInput}
                                    placeholder="Name"
                                    readOnly
                                 />
                                 <select className={styles.checkoutInput}>
                                    <option>United States</option>
                                 </select>
                                 <input
                                    className={styles.checkoutInput}
                                    placeholder="Address line 1"
                                    readOnly
                                 />
                              </div>

                              <div className={styles.altMethods}>
                                 <button className={styles.altBtn}>
                                    💳 Whop balance
                                 </button>
                                 <button className={styles.altBtn}>
                                    🅶 Google Pay
                                 </button>
                                 <button className={styles.altBtn}>
                                    💳 Alipay
                                 </button>
                              </div>

                              <div className={styles.moreMethods}>
                                 More payment methods ▾
                              </div>

                              <button
                                 className={styles.payBtn}
                                 style={{
                                    background: buttonColor,
                                    color:
                                       bgColor === "#ffffff" ? "#000" : "#fff",
                                 }}
                              >
                                 Pay
                              </button>

                              <div className={styles.checkoutTerms}>
                                 <input type="checkbox" /> By purchasing you
                                 agree to {businessName}&apos;s terms and
                                 conditions
                              </div>
                              <div className={styles.checkoutFooter}>
                                 Secured by <strong>Space-Ex</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     /* Desktop preview */
                     <div className={styles.desktopFrame}>
                        <div className={styles.desktopBrowserBar}>
                           <div className={styles.browserDots}>
                              <span style={{ background: "#ef4444" }} />
                              <span style={{ background: "#f59e0b" }} />
                              <span style={{ background: "#10b981" }} />
                           </div>
                           <div className={styles.browserUrlBar}>
                              🔒 space-ex.com/checkout
                           </div>
                        </div>

                        <div className={styles.desktopBody}>
                           <div className={styles.desktopLeft}>
                              <div className={styles.desktopBrand}>
                                 <div
                                    className={styles.desktopBrandIcon}
                                    style={{ background: "#3b82f6" }}
                                 >
                                    {businessInitial}
                                 </div>
                                 <span>{businessName}</span>
                              </div>
                              <div className={styles.desktopSeller}>
                                 {businessName}
                              </div>
                              <div className={styles.desktopPrice}>
                                 {displayPrice}
                              </div>
                              <button className={styles.desktopPromo}>
                                 Add promo code
                              </button>
                              <div className={styles.desktopTotalRow}>
                                 <span>Total due today</span>
                                 <strong>
                                    {displayPrice}
                                    {displayPriceSuffix}
                                 </strong>
                              </div>
                           </div>

                           <div className={styles.desktopRight}>
                              <label className={styles.checkoutLabel}>
                                 Email
                              </label>
                              <input
                                 className={styles.checkoutInput}
                                 value="johnappleseed@gmail.com"
                                 readOnly
                              />

                              <div className={styles.desktopMethodHeader}>
                                 Payment method
                              </div>
                              <button className={styles.methodBtn}>
                                 <span>💳</span> Card
                              </button>

                              <label className={styles.checkoutLabel}>
                                 Card information
                              </label>
                              <input
                                 className={styles.checkoutInput}
                                 placeholder="1234 1234 1234 1234"
                                 readOnly
                              />
                              <div className={styles.cardRow}>
                                 <input
                                    className={styles.checkoutInput}
                                    placeholder="MM / YY"
                                    readOnly
                                 />
                                 <input
                                    className={styles.checkoutInput}
                                    placeholder="CVC"
                                    readOnly
                                 />
                              </div>

                              <label className={styles.checkoutLabel}>
                                 Billing details
                              </label>
                              <input
                                 className={styles.checkoutInput}
                                 placeholder="Name"
                                 readOnly
                              />
                              <select className={styles.checkoutInput}>
                                 <option>United States</option>
                              </select>
                              <input
                                 className={styles.checkoutInput}
                                 placeholder="Address line 1"
                                 readOnly
                              />

                              <div className={styles.altMethods}>
                                 <button className={styles.altBtn}>
                                    💳 Whop balance
                                 </button>
                                 <button className={styles.altBtn}>
                                    🅶 Google Pay
                                 </button>
                                 <button className={styles.altBtn}>
                                    💳 Alipay
                                 </button>
                              </div>

                              <button
                                 className={styles.payBtn}
                                 style={{
                                    background: buttonColor,
                                    color:
                                       bgColor === "#ffffff" ? "#000" : "#fff",
                                 }}
                              >
                                 Pay
                              </button>

                              <div className={styles.checkoutTerms}>
                                 <input type="checkbox" /> By purchasing you
                                 agree to {businessName}&apos;s terms and
                                 conditions
                              </div>
                              <div className={styles.checkoutFooter}>
                                 Secured by <strong>Space-Ex</strong>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
