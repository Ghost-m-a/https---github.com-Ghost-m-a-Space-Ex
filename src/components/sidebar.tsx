"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   User,
   Plus,
   Home,
   MessageSquare,
   Building2,
   Network,
   Compass,
   Settings,
   ChevronsLeft,
   ChevronsRight,
   LineChart,
   Package,
   CreditCard,
   Users,
   Globe,
   Trophy,
   Briefcase,
   Wallet,
   LifeBuoy,
   MoreHorizontal,
   Code2,
   ChevronDown,
   ChevronRight,
   FileText,
   Receipt,
   Tag,
   MessageCircle,
   Shield,
   Flag,
   BarChart3,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import BusinessModal from "./business-modal";
import SettingsModal, { TabId } from "./settings-modal";
import BusinessSettingsModal, {
   BusinessTabId,
} from "./business-settings-modal";
import styles from "@/styles/components/sidebar.module.css";

interface MenuItem {
   icon: React.ReactNode;
   label: string;
   href?: string;
   onClick?: () => void;
   badge?: string | number;
   badgeVariant?: "red" | "blue";
   hasSubmenu?: boolean;
   submenu?: { label: string; href: string }[];
}

interface Section {
   title: string;
   items: MenuItem[];
}

const Sidebar = () => {
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [isMounted, setIsMounted] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);
   const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
   const sidebarRef = useRef<HTMLElement>(null);
   const pathname = usePathname();
   const {
      mode,
      activeBusiness,
      businesses,
      setActiveBusiness,
      resetToPersonal,
   } = useWorkspace();

   const [settingsOpen, setSettingsOpen] = useState(false);
   const [settingsTab, setSettingsTab] = useState<TabId>("profile");
   const [businessSettingsOpen, setBusinessSettingsOpen] = useState(false);
   const [businessSettingsTab, setBusinessSettingsTab] =
      useState<BusinessTabId>("general");

   useEffect(() => {
      setIsMounted(true);
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
         setIsCollapsed(saved === "true");
      } else if (window.innerWidth < 1024) {
         setIsCollapsed(true);
      }
   }, []);

   useEffect(() => {
      if (isMounted) {
         localStorage.setItem("sidebar-collapsed", String(isCollapsed));
      }
   }, [isCollapsed, isMounted]);

   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 1024) setIsCollapsed(true);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (isCollapsed) return;
         if (sidebarRef.current?.contains(event.target as Node)) return;
         const target = event.target as HTMLElement;
         if (target.closest("header")) return;
         setIsCollapsed(true);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [isCollapsed]);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.ctrlKey || e.metaKey) && e.key === "b") {
            e.preventDefault();
            setIsCollapsed((prev) => !prev);
         }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, []);

   const toggleSidebar = useCallback(() => setIsCollapsed((prev) => !prev), []);

   const openSettings = (tab: TabId = "profile") => {
      setSettingsTab(tab);
      setSettingsOpen(true);
   };

   const openBusinessSettings = (tab: BusinessTabId = "general") => {
      setBusinessSettingsTab(tab);
      setBusinessSettingsOpen(true);
   };

   // =========================================
   // PERSONAL MENU
   // =========================================
   const personalSections: Section[] = [
      {
         title: "Personal",
         items: [
            { icon: <Home size={20} />, label: "Home", href: "/" },
            {
               icon: <MessageSquare size={20} />,
               label: "Messages",
               href: "/messages",
               badge: 1,
               badgeVariant: "red",
            },
            {
               icon: <Building2 size={20} />,
               label: "Townhall",
               href: "/townhall",
            },
            {
               icon: <Compass size={20} />,
               label: "Discover",
               href: "/discover",
            },
         ],
      },
   ];

   // =========================================
   // BUSINESS MENU
   // =========================================
   const businessSections: Section[] = [
      {
         title: activeBusiness?.name || "Business",
         items: [
            { icon: <Home size={20} />, label: "Home", href: "/business" },
            {
               icon: <LineChart size={20} />,
               label: "Analytics",
               href: "/business/analytics",
            },
            {
               icon: <Package size={20} />,
               label: "Products",
               href: "/business/products",
            },
            {
               icon: <CreditCard size={20} />,
               label: "Payments",
               href: "/business/payments",
            },
            {
               icon: <Users size={20} />,
               label: "Customers",
               href: "/business/customers",
            },
            {
               icon: <Globe size={20} />,
               label: "Websites",
               href: "/business/websites",
               badge: "New",
               badgeVariant: "blue",
            },
         ],
      },
      {
         title: "Grow",
         items: [
            {
               icon: <Trophy size={20} />,
               label: "Campaigns",
               href: "/business/campaigns",
            },
            {
               icon: <Briefcase size={20} />,
               label: "Workforce",
               href: "/business/workforce",
               badge: "Beta",
               badgeVariant: "blue",
            },
            {
               icon: <Network size={20} />,
               label: "Affiliates",
               href: "/business/affiliates",
            },
         ],
      },
      {
         title: "Operations",
         items: [
            {
               icon: <Wallet size={20} />,
               label: "Cards",
               href: "/business/cards",
            },
            {
               icon: <LifeBuoy size={20} />,
               label: "Support",
               href: "/business/support",
            },
         ],
      },
      {
         title: "More",
         items: [
            {
               icon: <Receipt size={20} />,
               label: "Checkout links",
               href: "/business/checkout-links",
            },
            {
               icon: <FileText size={20} />,
               label: "Invoices",
               href: "/business/invoices",
            },
            {
               icon: <Tag size={20} />,
               label: "Promo codes",
               href: "/business/promo",
            },
            {
               icon: <Users size={20} />,
               label: "Team",
               href: "/business/team",
            },
            {
               icon: <Building2 size={20} />,
               label: "Sub accounts",
               href: "/business/connected-companies",
            },
         ],
      },
      {
         title: "Apps",
         items: [
            {
               icon: <Plus size={20} />,
               label: "Add",
               href: "/business/app-store",
            },
         ],
      },
   ];

   const sections = mode === "personal" ? personalSections : businessSections;

   if (!isMounted) return <aside className={styles.sidebar} />;

   return (
      <>
         <aside
            ref={sidebarRef}
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
            aria-label="Main navigation"
         >
            <div className={styles.topHeader}>
               <button
                  className={`${styles.profileAvatar} ${mode === "personal" ? styles.avatarActive : ""}`}
                  onClick={resetToPersonal}
                  title="Personal workspace"
                  aria-label="Switch to personal"
               >
                  <User size={20} />
               </button>

               {businesses.map((biz) => (
                  <button
                     key={biz.id}
                     className={`${styles.businessAvatar} ${
                        mode === "business" && activeBusiness?.id === biz.id
                           ? styles.avatarActive
                           : ""
                     }`}
                     onClick={() => setActiveBusiness(biz)}
                     title={biz.name}
                     aria-label={`Switch to ${biz.name}`}
                  >
                     {biz.initial}
                  </button>
               ))}

               <button
                  className={styles.addButton}
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Create new business"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
               >
                  <Plus size={20} />
                  {showTooltip && isCollapsed && (
                     <span className={styles.addTooltip}>Start a business</span>
                  )}
               </button>
            </div>

            <nav className={styles.navMenu}>
               {sections.map((section, sIdx) => (
                  <div key={section.title} className={styles.sectionGroup}>
                     {!isCollapsed && (
                        <div className={styles.sectionLabel}>
                           {section.title}
                        </div>
                     )}
                     {isCollapsed && sIdx > 0 && (
                        <div className={styles.sectionDivider} />
                     )}
                     {section.items.map((item) => {
                        const isActive = item.href
                           ? pathname === item.href
                           : false;
                        const hasSub = item.hasSubmenu && item.submenu;
                        const isSubOpen = openSubmenu === item.label;

                        // Submenu items
                        if (hasSub) {
                           return (
                              <div key={item.label}>
                                 <button
                                    type="button"
                                    className={styles.navItem}
                                    onClick={() => {
                                       if (isCollapsed) return;
                                       setOpenSubmenu(
                                          isSubOpen ? null : item.label,
                                       );
                                    }}
                                    style={{
                                       background: "transparent",
                                       border: "none",
                                       cursor: "pointer",
                                       textAlign: "left",
                                       width: "100%",
                                    }}
                                 >
                                    <div className={styles.navIconWrapper}>
                                       {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                       <>
                                          <span className={styles.label}>
                                             {item.label}
                                          </span>
                                          <span
                                             style={{
                                                marginLeft: "auto",
                                                color: "var(--text-muted)",
                                                display: "flex",
                                             }}
                                          >
                                             {isSubOpen ? (
                                                <ChevronDown size={14} />
                                             ) : (
                                                <ChevronRight size={14} />
                                             )}
                                          </span>
                                       </>
                                    )}
                                    {isCollapsed && (
                                       <span className={styles.tooltip}>
                                          {item.label}
                                       </span>
                                    )}
                                 </button>
                                 {!isCollapsed && isSubOpen && (
                                    <div
                                       style={{
                                          paddingLeft: 32,
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 2,
                                          marginTop: 2,
                                       }}
                                    >
                                       {item.submenu!.map((sub) => (
                                          <Link
                                             key={sub.href}
                                             href={sub.href}
                                             className={styles.navItem}
                                             style={{
                                                fontSize: 13,
                                                padding: "6px 12px",
                                                color:
                                                   pathname === sub.href
                                                      ? "var(--text-primary)"
                                                      : "var(--text-secondary)",
                                             }}
                                          >
                                             {sub.label}
                                          </Link>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           );
                        }

                        // Regular items
                        if (item.onClick) {
                           return (
                              <button
                                 key={item.label}
                                 onClick={item.onClick}
                                 className={styles.navItem}
                                 style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                 }}
                              >
                                 <div className={styles.navIconWrapper}>
                                    {item.icon}
                                 </div>
                                 {!isCollapsed && (
                                    <span className={styles.label}>
                                       {item.label}
                                    </span>
                                 )}
                                 {isCollapsed && (
                                    <span className={styles.tooltip}>
                                       {item.label}
                                    </span>
                                 )}
                              </button>
                           );
                        }

                        return (
                           <Link
                              key={item.label}
                              href={item.href || "#"}
                              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                              aria-current={isActive ? "page" : undefined}
                           >
                              <div className={styles.navIconWrapper}>
                                 {isActive && isCollapsed && (
                                    <div className={styles.activeBar} />
                                 )}
                                 {item.icon}
                                 {item.badge && item.badgeVariant === "red" && (
                                    <span className={styles.badgeRed}>
                                       {item.badge}
                                    </span>
                                 )}
                              </div>
                              {!isCollapsed && (
                                 <>
                                    <span className={styles.label}>
                                       {item.label}
                                    </span>
                                    {item.badge &&
                                       item.badgeVariant === "blue" && (
                                          <span className={styles.badgeBlue}>
                                             {item.badge}
                                          </span>
                                       )}
                                 </>
                              )}
                              {isCollapsed && (
                                 <span className={styles.tooltip}>
                                    {item.label}
                                 </span>
                              )}
                           </Link>
                        );
                     })}
                  </div>
               ))}
            </nav>

            <div className={styles.bottomSection}>
               <Link href="/developer" className={styles.navItem}>
                  <div className={styles.navIconWrapper}>
                     <Code2 size={20} />
                  </div>
                  {!isCollapsed && (
                     <span className={styles.label}>Developer</span>
                  )}
                  {isCollapsed && (
                     <span className={styles.tooltip}>Developer</span>
                  )}
               </Link>

               <button
                  type="button"
                  className={styles.navItem}
                  onClick={() => {
                     if (mode === "business") openBusinessSettings("general");
                     else openSettings("profile");
                  }}
                  style={{
                     background: "transparent",
                     border: "none",
                     cursor: "pointer",
                     textAlign: "left",
                  }}
               >
                  <div className={styles.navIconWrapper}>
                     <Settings size={20} />
                  </div>
                  {!isCollapsed && (
                     <span className={styles.label}>Settings</span>
                  )}
                  {isCollapsed && (
                     <span className={styles.tooltip}>Settings</span>
                  )}
               </button>

               <button
                  className={styles.collapseButton}
                  onClick={toggleSidebar}
                  aria-label={
                     isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
               >
                  {isCollapsed ? (
                     <ChevronsRight size={20} />
                  ) : (
                     <ChevronsLeft size={20} />
                  )}
               </button>
            </div>
         </aside>

         <BusinessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
         />

         <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            initialTab={settingsTab}
         />

         <BusinessSettingsModal
            isOpen={businessSettingsOpen}
            onClose={() => setBusinessSettingsOpen(false)}
            businessId={activeBusiness?.id}
            initialTab={businessSettingsTab}
            onCreateBusiness={() => {
               setBusinessSettingsOpen(false);
               setIsModalOpen(true);
            }}
         />
      </>
   );
};

export default Sidebar;
