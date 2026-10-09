"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";
import styles from "../styles/settings.module.css";
import ProfileTab from "./settings/profile-tab";
import InvitesTab from "./settings/invites-tab";
import SocialTab from "./settings/social-tab";
import SecurityTab from "./settings/security-tab";
import OrdersTab from "./settings/orders-tab";
import NotificationsTab from "./settings/notifications-tab";
import PaymentTab from "./settings/payment-tab";
import WalletTab from "./settings/wallet-tab";
import VerificationTab from "./settings/verification-tab";
import ResolutionTab from "./settings/resolution-tab";
import PartnersTab from "./settings/partners-tab";

type TabId =
   | "profile"
   | "invites"
   | "social"
   | "security"
   | "orders"
   | "notifications"
   | "payment"
   | "wallet"
   | "verifications"
   | "resolution"
   | "partners";

interface SettingsModalProps {
   isOpen: boolean;
   onClose: () => void;
   initialTab?: TabId;
}

const TABS: { id: TabId; label: string }[] = [
   { id: "profile", label: "Profile" },
   { id: "invites", label: "Invites" },
   { id: "social", label: "Social accounts" },
   { id: "security", label: "Account security" },
   { id: "orders", label: "Orders" },
   { id: "notifications", label: "Notifications" },
   { id: "payment", label: "Payment methods" },
   { id: "wallet", label: "Wallet" },
   { id: "verifications", label: "Verifications" },
   { id: "resolution", label: "Resolution center" },
   { id: "partners", label: "Partners" },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
   isOpen,
   onClose,
   initialTab = "profile",
}) => {
   const [activeTab, setActiveTab] = useState<TabId>(initialTab);
   const [search, setSearch] = useState("");

   if (!isOpen) return null;

   const filteredTabs = TABS.filter((t) =>
      t.label.toLowerCase().includes(search.toLowerCase()),
   );

   const activeLabel = TABS.find((t) => t.id === activeTab)?.label || "";

   const renderTab = () => {
      switch (activeTab) {
         case "profile":
            return <ProfileTab />;
         case "invites":
            return <InvitesTab />;
         case "social":
            return <SocialTab />;
         case "security":
            return <SecurityTab />;
         case "orders":
            return <OrdersTab />;
         case "notifications":
            return <NotificationsTab />;
         case "payment":
            return <PaymentTab />;
         case "wallet":
            return <WalletTab />;
         case "verifications":
            return <VerificationTab />;
         case "resolution":
            return <ResolutionTab />;
         case "partners":
            return <PartnersTab />;
         default:
            return <ProfileTab />;
      }
   };

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* LEFT SIDEBAR */}
            <aside className={styles.sidebar}>
               <div className={styles.sidebarHeader}>
                  <h2 className={styles.sidebarTitle}>Account settings</h2>
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

               <button className={styles.signOutBtn} onClick={onClose}>
                  Sign out
               </button>
            </aside>

            {/* RIGHT CONTENT */}
            <section className={styles.content}>
               <header className={styles.contentHeader}>
                  <h3 className={styles.contentTitle}>{activeLabel}</h3>
                  <button
                     className={styles.closeBtn}
                     onClick={onClose}
                     aria-label="Close"
                  >
                     <X size={18} />
                  </button>
               </header>

               <div className={styles.contentBody}>{renderTab()}</div>
            </section>
         </div>
      </div>
   );
};

export default SettingsModal;
export type { TabId };
