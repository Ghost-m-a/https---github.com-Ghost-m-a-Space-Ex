"use client";

import React from "react";
import {
   Rocket,
   Bell,
   HelpCircle,
   MessageSquare,
   Search,
   Sparkles,
} from "lucide-react";
import styles from "../styles/navbar.module.css";
import { UserDropdown } from "./userdropdown";

const Navbar = () => {
   return (
      <header className={styles.navbar}>
         {/* Left side: Logo */}
         <div className={styles.navLeft}>
            <div className={styles.brand}>
               <div className={styles.brandIcon}>
                  <Rocket size={18} />
               </div>
               <span className={styles.brandText}>Space/Ex</span>
            </div>
         </div>

         {/* Center: Search Bar */}
         <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
               type="text"
               placeholder="Search..."
               className={styles.searchInput}
            />
         </div>

         {/* Right side: Icons & User Dropdown */}
         <div className={styles.navRight}>
            <button className={styles.iconButton}>
               <Sparkles size={20} />
            </button>
            <button className={styles.iconButton}>
               <HelpCircle size={20} />
            </button>
            <button className={styles.iconButton}>
               <MessageSquare size={20} />
            </button>
            <button className={styles.iconButton}>
               <Bell size={20} />
               <span className={styles.notificationBadge}>1</span>
            </button>
            <div className={styles.divider}></div>
            <UserDropdown />
         </div>
      </header>
   );
};

export default Navbar;
