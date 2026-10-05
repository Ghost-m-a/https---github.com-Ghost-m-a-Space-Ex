"use client";

import React, { useEffect, useState } from "react";
import { X, Search, Link2 } from "lucide-react";
import styles from "../styles/business-settings.module.css";

import GeneralTab from "./business-settings/general-tab";
import AnalyticsTab from "./business-settings/analytics-tab";
import NotificationsTab from "./business-settings/notifications-tab";
import CheckoutTab from "./business-settings/checkout-tab";
import CheckoutBrandingTab from "./business-settings/checkout-branding-tab";
import PaymentsTab from "./business-settings/payments-tab";
import VerificationsTab from "./business-settings/verifications-tab";
import InvoicesTab from "./business-settings/invoices-tab";
import LegalTab from "./business-settings/legal-tab";
import TaxTab from "./business-settings/tax-tab";
import OpenGraphTab from "./business-settings/open-graph-tab";
import HomePreferencesTab from "./business-settings/home-preferences-tab";
import PartnersTab from "./business-settings/partners-tab";
import AuthorizedAppsTab from "./business-settings/authorized-apps-tab";

export type BusinessTabId =
   | "general"
   | "analytics"
   | "notifications"
   | "checkout"
   | "checkout-branding"
   | "payments"
   | "verifications"
   | "invoices"
   | "legal"
   | "tax"
   | "open-graph"
   | "home-preferences"
   | "partners"
   | "authorized-apps";

interface BusinessSettingsModalProps {
   isOpen: boolean;
   onClose: () => void;
   businessId?: string;
   initialTab?: BusinessTabId;
}

const TABS: { id: BusinessTabId; label: string }[] = [
   { id: "general", label: "General" },
   { id: "analytics", label: "Analytics" },
   { id: "notifications", label: "Notifications" },
   { id: "checkout", label: "Checkout" },
   { id: "checkout-branding", label: "Checkout branding" },
   { id: "payments", label: "Payments" },
   { id: "verifications", label: "Verifications" },
   { id: "invoices", label: "Invoices" },
   { id: "legal", label: "Legal" },
   { id: "tax", label: "Tax" },
   { id: "open-graph", label: "Open graph image" },
   { id: "home-preferences", label: "Home preferences" },
   { id: "partners", label: "Partners" },
   { id: "authorized-apps", label: "Authorized apps" },
];

const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
   isOpen,
   onClose,
   businessId,
   initialTab = "general",
}) => {
   const [activeTab, setActiveTab] = useState<BusinessTabId>(initialTab);
   const [search, setSearch] = useState("");
   const [business, setBusiness] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   // Load business settings
   useEffect(() => {
      if (!isOpen) return;
      setLoading(true);
      const url = businessId
         ? `/api/business/settings?id=${businessId}`
         : `/api/business/settings`;
      fetch(url)
         .then((r) => r.json())
         .then((d) => setBusiness(d.business))
         .finally(() => setLoading(false));
   }, [isOpen, businessId]);

   // Escape to close
   useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   const filteredTabs = TABS.filter((t) =>
      t.label.toLowerCase().includes(search.toLowerCase()),
   );

   const activeLabel = TABS.find((t) => t.id === activeTab)?.label || "";

   const updateBusiness = async (patch: Record<string, unknown>) => {
      if (!business) return;
      // Optimistic update
      setBusiness({ ...business, ...patch });
      await fetch("/api/business/settings", {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ businessId: business._id, ...patch }),
      });
   };

   const renderTab = () => {
      if (loading) return <div className={styles.loading}>Loading...</div>;
      if (!business)
         return <div className={styles.loading}>No business found.</div>;

      const props = { business, updateBusiness };

      switch (activeTab) {
         case "general":
            return <GeneralTab {...props} onClose={onClose} />;
         case "analytics":
            return <AnalyticsTab {...props} />;
         case "notifications":
            return <NotificationsTab {...props} />;
         case "checkout":
            return <CheckoutTab {...props} />;
         case "checkout-branding":
            return <CheckoutBrandingTab {...props} />;
         case "payments":
            return <PaymentsTab {...props} />;
         case "verifications":
            return <VerificationsTab {...props} />;
         case "invoices":
            return <InvoicesTab {...props} />;
         case "legal":
            return <LegalTab {...props} />;
         case "tax":
            return <TaxTab {...props} />;
         case "open-graph":
            return <OpenGraphTab {...props} />;
         case "home-preferences":
            return <HomePreferencesTab {...props} />;
         case "partners":
            return <PartnersTab />;
         case "authorized-apps":
            return <AuthorizedAppsTab />;
         default:
            return <GeneralTab {...props} onClose={onClose} />;
      }
   };

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* LEFT SIDEBAR */}
            <aside className={styles.sidebar}>
               <div className={styles.sidebarHeader}>
                  <h2 className={styles.sidebarTitle}>Settings</h2>
               </div>

               <div className={styles.sidebarSearch}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                     className={styles.searchInput}
                     placeholder="Search settings"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>

               <nav className={styles.tabList}>
                  {filteredTabs.map((tab) => (
                     <button
                        key={tab.id}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                     >
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </aside>

            {/* RIGHT CONTENT */}
            <section className={styles.content}>
               <header className={styles.contentHeader}>
                  <h3 className={styles.contentTitle}>{activeLabel}</h3>
                  <div className={styles.headerActions}>
                     <button
                        className={styles.headerIconBtn}
                        aria-label="Copy link"
                     >
                        <Link2 size={16} />
                     </button>
                     <button
                        className={styles.headerIconBtn}
                        onClick={onClose}
                        aria-label="Close"
                     >
                        <X size={18} />
                     </button>
                  </div>
               </header>

               <div className={styles.contentBody}>{renderTab()}</div>
            </section>
         </div>
      </div>
   );
};

export default BusinessSettingsModal;
