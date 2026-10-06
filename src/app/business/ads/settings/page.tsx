"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useWorkspace } from "../../../context/workspace-context";
import styles from "./settings.module.css";

type Tab = "general" | "conversion" | "billing" | "meta";

export default function AdsSettingsPage() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const [tab, setTab] = useState<Tab>("general");
   const [settings, setSettings] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [saved, setSaved] = useState(false);

   const load = useCallback(async () => {
      if (!activeBusiness?.id) return;
      setLoading(true);
      try {
         const res = await fetch(
            `/api/business/ads/settings?businessId=${activeBusiness.id}`,
         );
         const data = await res.json();
         setSettings(data.settings);
      } finally {
         setLoading(false);
      }
   }, [activeBusiness?.id]);

   useEffect(() => {
      load();
   }, [load]);

   const update = async (patch: Record<string, unknown>) => {
      if (!activeBusiness?.id) return;
      setSettings((prev: any) => ({ ...prev, ...patch }));
      setSaving(true);
      await fetch("/api/business/ads/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ businessId: activeBusiness.id, ...patch }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
   };

   if (loading) return <div className={styles.loading}>Loading...</div>;
   if (!settings)
      return <div className={styles.loading}>Failed to load settings</div>;

   return (
      <div className={styles.page}>
         <button
            className={styles.backBtn}
            onClick={() => router.push("/business/ads")}
         >
            <ArrowLeft size={14} /> Back
         </button>

         <h1 className={styles.title}>Settings</h1>
         <p className={styles.subtitle}>
            Manage your ad platform integrations and audiences.
         </p>

         <div className={styles.tabs}>
            {(["general", "conversion", "billing", "meta"] as Tab[]).map(
               (t) => (
                  <button
                     key={t}
                     className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                     onClick={() => setTab(t)}
                  >
                     {t === "general" && "General"}
                     {t === "conversion" && "Conversion values"}
                     {t === "billing" && "Billing"}
                     {t === "meta" && "Meta"}
                  </button>
               ),
            )}
         </div>

         {saved && (
            <div className={styles.savedBanner}>
               <Check size={14} /> Saved
            </div>
         )}

         {tab === "general" && (
            <div className={styles.sections}>
               <div className={styles.card}>
                  <div className={styles.cardTitle}>Reporting currency</div>
                  <div className={styles.cardSub}>
                     Choose what currency to report ad spend in.
                  </div>
                  <select
                     className={styles.input}
                     value={settings.reportingCurrency}
                     onChange={(e) =>
                        update({ reportingCurrency: e.target.value })
                     }
                  >
                     <option value="USD">🇺🇸 USD — US Dollar</option>
                     <option value="EUR">🇪🇺 EUR — Euro</option>
                     <option value="GBP">🇬🇧 GBP — British Pound</option>
                     <option value="EGP">🇪🇬 EGP — Egyptian Pound</option>
                  </select>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardTitle}>Account timezone</div>
                  <div className={styles.cardSub}>
                     The timezone your reports are shown in and that campaign
                     start and end times are scheduled in. Every campaign is
                     pinned to this timezone.
                  </div>
                  <select
                     className={styles.input}
                     value={settings.accountTimezone}
                     onChange={(e) =>
                        update({ accountTimezone: e.target.value })
                     }
                  >
                     <option value="America/New_York">Eastern Time (ET)</option>
                     <option value="America/Chicago">Central Time (CT)</option>
                     <option value="America/Denver">Mountain Time (MT)</option>
                     <option value="America/Los_Angeles">
                        Pacific Time (PT)
                     </option>
                     <option value="Europe/London">London (GMT)</option>
                     <option value="Europe/Paris">Paris (CET)</option>
                     <option value="Africa/Cairo">Cairo (EET)</option>
                  </select>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardTitle}>Certifications</div>
                  <div className={styles.cardSub}>
                     Prescription drug and peptide ads require an approved
                     LegitScript certification on your account. Submit your
                     certified business for review to run ads in your approved
                     countries.
                  </div>
                  <a href="#" className={styles.link}>
                     Get LegitScript certified
                  </a>
                  <div className={styles.certRow}>
                     <span>Prescription drug ads</span>
                     <span className={styles.badgeMuted}>
                        {settings.prescriptionDrugCertified
                           ? "Certified"
                           : "Not certified"}
                     </span>
                     <button className={styles.primarySmall}>
                        Apply for certification
                     </button>
                  </div>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardTitle}>Your pixel</div>
                  <div className={styles.cardSub}>
                     Your attribution stats are only as accurate as your pixel
                     install. Check its health and event tracking anytime.
                  </div>
                  <a href="#" className={styles.link}>
                     View pixel stats →
                  </a>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardTitle}>Audiences</div>
                  <div className={styles.cardSub}>
                     Retarget customers and people who engaged with your
                     content, or let Meta find new people like them.
                  </div>
                  <div className={styles.audienceBox}>
                     <div className={styles.audienceIcon}>👥</div>
                     <div className={styles.audienceTitle}>
                        Reach people you already know
                     </div>
                     <div className={styles.audienceSub}>
                        Upload a list, retarget people who engaged with your
                        Facebook or Instagram, or let Meta find new people like
                        them.
                     </div>
                     <div className={styles.audienceGrid}>
                        <div className={styles.audienceCol}>
                           <div className={styles.audienceColIcon}>📋</div>
                           <div className={styles.audienceColTitle}>
                              Customer lists
                           </div>
                           <div className={styles.audienceColSub}>
                              Upload a CSV of emails or phone numbers. We match
                              them to Meta profiles.
                           </div>
                        </div>
                        <div className={styles.audienceCol}>
                           <div className={styles.audienceColIcon}>💬</div>
                           <div className={styles.audienceColTitle}>
                              Engagement
                           </div>
                           <div className={styles.audienceColSub}>
                              People who watched your videos, opened a lead
                              form, or interacted with your page or profile.
                           </div>
                        </div>
                        <div className={styles.audienceCol}>
                           <div className={styles.audienceColIcon}>✨</div>
                           <div className={styles.audienceColTitle}>
                              Lookalikes
                           </div>
                           <div className={styles.audienceColSub}>
                              Meta finds new people like your customers.
                              Available once a source has enough people.
                           </div>
                        </div>
                     </div>
                     <button
                        className={styles.primarySmall}
                        style={{ marginTop: 16 }}
                     >
                        Create audience
                     </button>
                  </div>
               </div>

               <div className={styles.card}>
                  <div className={styles.cardTitle}>Triple Whale</div>
                  <div className={styles.cardSub}>
                     Send your ad spend to Triple Whale so it shows up as a
                     channel in your attribution dashboard.
                  </div>
                  <label className={styles.fieldLabel}>
                     Triple Whale API key
                  </label>
                  <input
                     className={styles.input}
                     placeholder="Paste your API key"
                     value={settings.tripleWhaleApiKey}
                     onChange={(e) =>
                        update({ tripleWhaleApiKey: e.target.value })
                     }
                  />
                  <div className={styles.hint}>
                     Generate a key in Triple Whale under Data → APIs with the
                     &ldquo;Data-in Write: Ads&rdquo; scope.
                  </div>

                  <label className={styles.fieldLabel}>Shop domain</label>
                  <input
                     className={styles.input}
                     placeholder="yourstore.myshopify.com"
                     value={settings.shopDomain}
                     onChange={(e) => update({ shopDomain: e.target.value })}
                  />
                  <div className={styles.hint}>
                     Copy this from Triple Whale under Settings → Store. For
                     Shopify stores it&apos;s your .myshopify.com domain.
                  </div>

                  <button
                     className={styles.primarySmall}
                     style={{ marginTop: 12 }}
                  >
                     Connect
                  </button>
               </div>
            </div>
         )}

         {tab === "conversion" && (
            <div className={styles.sections}>
               <div className={styles.card}>
                  <div className={styles.cardTitle}>Conversion values</div>
                  <div className={styles.cardSub}>
                     Assign monetary values to conversion events so Meta can
                     optimize for revenue.
                  </div>
                  <div className={styles.emptyState}>
                     <div className={styles.emptyStateIcon}>💰</div>
                     <div className={styles.emptyStateTitle}>
                        No conversion values configured
                     </div>
                     <div className={styles.emptyStateSub}>
                        Set up conversion values for your key events to help
                        Meta optimize for revenue.
                     </div>
                  </div>
               </div>
            </div>
         )}

         {tab === "billing" && (
            <div className={styles.sections}>
               <div className={styles.card}>
                  <div className={styles.cardTitle}>Billing</div>
                  <div className={styles.cardSub}>
                     Manage how you pay for ad spend.
                  </div>
                  <div className={styles.emptyState}>
                     <div className={styles.emptyStateIcon}>💳</div>
                     <div className={styles.emptyStateTitle}>
                        No billing method
                     </div>
                     <div className={styles.emptyStateSub}>
                        Add a payment method to start running ads.
                     </div>
                     <button
                        className={styles.primarySmall}
                        style={{ marginTop: 12 }}
                     >
                        Add payment method
                     </button>
                  </div>
               </div>
            </div>
         )}

         {tab === "meta" && (
            <div className={styles.sections}>
               <div className={styles.card}>
                  <div className={styles.cardTitle}>Meta integration</div>
                  <div className={styles.cardSub}>
                     Connect your Facebook Page and Instagram account.
                  </div>

                  <label className={styles.fieldLabel}>Facebook Page</label>
                  <select
                     className={styles.input}
                     value={settings.metaFacebookPage}
                     onChange={(e) =>
                        update({ metaFacebookPage: e.target.value })
                     }
                  >
                     <option value="">Select a Facebook Page...</option>
                     <option value="space-ex">Space/Ex</option>
                     <option value="new">+ Create Facebook Page</option>
                  </select>

                  <label className={styles.fieldLabel}>Instagram account</label>
                  <select
                     className={styles.input}
                     value={settings.metaInstagramAccount}
                     onChange={(e) =>
                        update({ metaInstagramAccount: e.target.value })
                     }
                  >
                     <option value="">No connected Instagram</option>
                  </select>

                  <label className={styles.fieldLabel}>Meta Pixel ID</label>
                  <input
                     className={styles.input}
                     placeholder="123456789012345"
                     value={settings.metaPixelId}
                     onChange={(e) => update({ metaPixelId: e.target.value })}
                  />
               </div>
            </div>
         )}
      </div>
   );
}
