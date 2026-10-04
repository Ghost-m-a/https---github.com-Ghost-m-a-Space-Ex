"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
   Info,
   FileText,
   Settings,
   HelpCircle,
   Languages,
   Scale,
   LogOut,
   ChevronRight,
   ChevronDown,
   Monitor,
   Sun,
   Moon,
} from "lucide-react";
import styles from "../styles/navbar.module.css";

type ThemeType = "system" | "light" | "dark";

interface MenuItemProps {
   icon: React.ReactNode;
   label: string;
   href: string;
   hasSubmenu?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
   icon,
   label,
   href,
   hasSubmenu,
}) => (
   <Link href={href} className={styles.menuItem}>
      <div className={styles.menuItemContent}>
         <span className={styles.icon}>{icon}</span>
         <span className={styles.label}>{label}</span>
      </div>
      {hasSubmenu && <ChevronRight size={16} className={styles.submenuIcon} />}
   </Link>
);

export const UserDropdown: React.FC = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [theme, setTheme] = useState<ThemeType>("dark");
   const [mounted, setMounted] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // -----------------------------------------
   // 1. Load saved theme on mount
   // -----------------------------------------
   useEffect(() => {
      setMounted(true);
      const savedTheme = (localStorage.getItem("theme") as ThemeType) || "dark";
      setTheme(savedTheme);
   }, []);

   // -----------------------------------------
   // 2. Apply theme to <html> when it changes
   // -----------------------------------------
   useEffect(() => {
      if (!mounted) return;

      // Save preference
      localStorage.setItem("theme", theme);

      const root = document.documentElement;
      let resolvedTheme: "light" | "dark" = "dark";

      if (theme === "system") {
         resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
      } else {
         resolvedTheme = theme;
      }

      root.setAttribute("data-theme", resolvedTheme);
      root.style.colorScheme = resolvedTheme;
   }, [theme, mounted]);

   // -----------------------------------------
   // 3. Listen for OS theme changes when 'system' is selected
   // -----------------------------------------
   useEffect(() => {
      if (!mounted || theme !== "system") return;

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
         const root = document.documentElement;
         const newTheme = e.matches ? "dark" : "light";
         root.setAttribute("data-theme", newTheme);
         root.style.colorScheme = newTheme;
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
   }, [theme, mounted]);

   // -----------------------------------------
   // 4. Close dropdown on click outside
   // -----------------------------------------
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // -----------------------------------------
   // 5. Close dropdown on Escape key
   // -----------------------------------------
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
   }, []);

   const mainMenu = [
      {
         icon: <Info size={18} />,
         label: "Resolution center",
         href: "/resolution-center",
      },
      { icon: <FileText size={18} />, label: "Orders", href: "/orders" },
      { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
   ];

   const secondaryMenu = [
      {
         icon: <HelpCircle size={18} />,
         label: "Help and support",
         href: "/help",
      },
      {
         icon: <Languages size={18} />,
         label: "Language",
         href: "/language",
         hasSubmenu: true,
      },
      {
         icon: <Scale size={18} />,
         label: "Legal",
         href: "/legal",
         hasSubmenu: true,
      },
      { icon: <LogOut size={18} />, label: "Sign out", href: "/logout" },
   ];

   const themes: { key: ThemeType; icon: React.ReactNode; label: string }[] = [
      { key: "system", icon: <Monitor size={18} />, label: "System theme" },
      { key: "light", icon: <Sun size={18} />, label: "Light theme" },
      { key: "dark", icon: <Moon size={18} />, label: "Dark theme" },
   ];

   return (
      <div className={styles.dropdownContainer} ref={dropdownRef}>
         {/* Trigger Button */}
         <button
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               setIsOpen((prev) => !prev);
            }}
            className={styles.triggerButton}
            aria-label="User menu"
            aria-expanded={isOpen}
         >
            <div className={styles.avatarSmall}>DZ</div>
            <ChevronDown
               size={16}
               className={styles.chevronDown}
               style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
               }}
            />
         </button>

         {/* Dropdown Menu */}
         {isOpen && (
            <div className={styles.menuDropdown} role="menu">
               {/* Header */}
               <div className={styles.menuHeader}>
                  <div className={styles.avatarLarge}>DZ</div>
                  <div className={styles.headerInfo}>
                     <span className={styles.userName}>Dr. Zakarinović</span>
                     <Link href="/profile" className={styles.viewProfile}>
                        View profile
                     </Link>
                  </div>
               </div>

               <div className={styles.divider} />

               {/* Main Menu */}
               <div className={styles.menuGroup}>
                  {mainMenu.map((item) => (
                     <MenuItem key={item.label} {...item} />
                  ))}
               </div>

               <div className={styles.divider} />

               {/* Secondary Menu */}
               <div className={styles.menuGroup}>
                  {secondaryMenu.map((item) => (
                     <MenuItem key={item.label} {...item} />
                  ))}
               </div>

               <div className={styles.divider} />

               {/* Theme Switcher */}
               <div className={styles.themeSwitcherContainer}>
                  <div className={styles.themeSwitcherTrack}>
                     {themes.map((t) => (
                        <button
                           key={t.key}
                           type="button"
                           onClick={() => setTheme(t.key)}
                           className={`${styles.themeButton} ${
                              theme === t.key ? styles.themeButtonActive : ""
                           }`}
                           aria-label={t.label}
                           aria-pressed={theme === t.key}
                           title={t.label}
                        >
                           {t.icon}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
