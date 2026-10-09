"use client";

import React, { useEffect } from "react";
import { X, Maximize2 } from "lucide-react";
import styles from "@/styles/components/panel.module.css";

interface SidePanelProps {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   children: React.ReactNode;
   onExpand?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
   isOpen,
   onClose,
   title,
   children,
   onExpand,
}) => {
   // Close on Escape
   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      };
      if (isOpen) document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
   }, [isOpen, onClose]);

   return (
      <>
         {/* Backdrop on mobile */}
         {isOpen && <div className={styles.backdrop} onClick={onClose} />}

         <aside className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
            <header className={styles.header}>
               <h2 className={styles.title}>{title}</h2>
               <div className={styles.headerActions}>
                  {onExpand && (
                     <button
                        className={styles.iconBtn}
                        onClick={onExpand}
                        aria-label="Expand"
                     >
                        <Maximize2 size={16} />
                     </button>
                  )}
                  <button
                     className={styles.iconBtn}
                     onClick={onClose}
                     aria-label="Close"
                  >
                     <X size={16} />
                  </button>
               </div>
            </header>

            <div className={styles.body}>{children}</div>
         </aside>
      </>
   );
};

export default SidePanel;
