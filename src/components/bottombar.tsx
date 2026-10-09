"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, MessageSquare, Compass, Wallet } from "lucide-react";
import styles from "@/styles/components/bottomBar.module.css";

const BottomBar = () => {
   const pathname = usePathname();

   const navItems = [
      { icon: <Package size={22} />, href: "/", label: "Home" },
      {
         icon: <MessageSquare size={22} />,
         href: "/messages",
         label: "Messages",
         badge: 1,
      },
      { icon: <Compass size={22} />, href: "/discover", label: "Discover" },
      { icon: <Wallet size={22} />, href: "/wallet", label: "Wallet" },
   ];

   return (
      <nav className={styles.bottomBar}>
         {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
               <Link
                  key={item.label}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
               >
                  <div className={styles.iconWrapper}>
                     {item.icon}
                     {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                     )}
                  </div>
               </Link>
            );
         })}

         {/* Profile Avatar */}
         <Link href="/profile" className={styles.navItem}>
            <div className={styles.avatar}>DZ</div>
         </Link>
      </nav>
   );
};

export default BottomBar;
