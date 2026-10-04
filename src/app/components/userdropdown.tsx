"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// =========================================
// TYPES
// =========================================
type ThemeType = "system" | "light" | "dark";

interface AuthUser {
   id: string;
   name: string;
   email: string;
}

interface MenuItemProps {
   icon: React.ReactNode;
   label: string;
   href: string;
   hasSubmenu?: boolean;
}

// =========================================
// REUSABLE MENU ITEM
// =========================================
const MenuItem: React.FC<MenuItemProps> = ({
   icon,
   label,
   href,
   hasSubmenu,
}) => (
   <Link href={href} className={styles.menuItem}>
      <div className={styles.menuItemContent}>
         <span className={styles.menuItemIcon}>{icon}</span>
         <span className={styles.menuItemLabel}>{label}</span>
      </div>
      {hasSubmenu && <ChevronRight size={16} className={styles.submenuIcon} />}
   </Link>
);

// =========================================
// USER DROPDOWN COMPONENT
// =========================================
export const UserDropdown: React.FC = () => {
   const router = useRouter();
   const [isOpen, setIsOpen] = useState(false);
   const [theme, setTheme] = useState<ThemeType>("dark");
   const [mounted, setMounted] = useState(false);
   const [user, setUser] = useState<AuthUser | null>(null);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // -----------------------------------------
   // 1. Load saved theme + user on mount
   // -----------------------------------------
   useEffect(() => {
      setMounted(true);

      // Load theme
      const savedTheme = (localStorage.getItem("theme") as ThemeType) || "dark";
      setTheme(savedTheme);

      // Load current user
      fetch("/api/auth/me")
         .then((r) => r.json())
         .then((d) => setUser(d.user))
         .catch(() => setUser(null));
   }, []);

   // -----------------------------------------
   // 2. Apply theme to <html> when it changes
   // -----------------------------------------
   useEffect(() => {
      if (!mounted) return;

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

   // -----------------------------------------
   // 6. Logout handler
   // -----------------------------------------
   const handleLogout = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoggingOut) return;
      setIsLoggingOut(true);

      try {
         await fetch("/api/auth/logout", { method: "POST" });
         setIsOpen(false);
         router.push("/login");
         router.refresh();
      } catch (err) {
         console.error("Logout failed:", err);
         setIsLoggingOut(false);
      }
   };

   // -----------------------------------------
   // MENU DATA
   // -----------------------------------------
   const mainMenu: MenuItemProps[] = [
      {
         icon: <Info size={18} />,
         label: "Resolution center",
         href: "/resolution-center",
      },
      { icon: <FileText size={18} />, label: "Orders", href: "/orders" },
      { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
   ];

   const secondaryMenu: MenuItemProps[] = [
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
   ];

   const themes: { key: ThemeType; icon: React.ReactNode; label: string }[] = [
      { key: "system", icon: <Monitor size={18} />, label: "System theme" },
      { key: "light", icon: <Sun size={18} />, label: "Light theme" },
      { key: "dark", icon: <Moon size={18} />, label: "Dark theme" },
   ];

   // -----------------------------------------
   // DERIVED USER DISPLAY DATA
   // -----------------------------------------
   const initials = user
      ? user.name
           .trim()
           .split(/\s+/)
           .map((n) => n[0])
           .join("")
           .slice(0, 2)
           .toUpperCase()
      : "?";

   const displayName = user?.name || "Guest";
   const displayEmail = user?.email || "Sign in to your account";

   return (
      <div className={styles.dropdownContainer} ref={dropdownRef}>
         {/* =========================================
          TRIGGER BUTTON
          ========================================= */}
         <button
            type="button"
            onClick={(e) => {
               e.stopPropagation();
               setIsOpen((prev) => !prev);
            }}
            className={styles.triggerButton}
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={isOpen}
         >
            <div className={styles.avatarSmall}>{initials}</div>
            <ChevronDown
               size={16}
               className={styles.chevronDown}
               style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
               }}
            />
         </button>

         {/* =========================================
          DROPDOWN MENU
          ========================================= */}
         {isOpen && (
            <div className={styles.menuDropdown} role="menu">
               {/* ---------- HEADER ---------- */}
               <div className={styles.menuHeader}>
                  <div className={styles.avatarLarge}>{initials}</div>
                  <div className={styles.headerInfo}>
                     <span className={styles.userName}>{displayName}</span>
                     <Link href="/profile" className={styles.viewProfile}>
                        {displayEmail}
                     </Link>
                  </div>
               </div>

               <div className={styles.divider} />

               {/* ---------- MAIN MENU ---------- */}
               <div className={styles.menuGroup}>
                  {mainMenu.map((item) => (
                     <MenuItem key={item.label} {...item} />
                  ))}
               </div>

               <div className={styles.divider} />

               {/* ---------- SECONDARY MENU ---------- */}
               <div className={styles.menuGroup}>
                  {secondaryMenu.map((item) => (
                     <MenuItem key={item.label} {...item} />
                  ))}

                  {/* Sign out (uses button for onClick handler) */}
                  <button
                     type="button"
                     className={styles.menuItem}
                     onClick={handleLogout}
                     disabled={isLoggingOut}
                     style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: isLoggingOut ? "not-allowed" : "pointer",
                        opacity: isLoggingOut ? 0.6 : 1,
                     }}
                  >
                     <div className={styles.menuItemContent}>
                        <span className={styles.menuItemIcon}>
                           <LogOut size={18} />
                        </span>
                        <span className={styles.menuItemLabel}>
                           {isLoggingOut ? "Signing out..." : "Sign out"}
                        </span>
                     </div>
                  </button>
               </div>

               <div className={styles.divider} />

               {/* ---------- THEME SWITCHER ---------- */}
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
