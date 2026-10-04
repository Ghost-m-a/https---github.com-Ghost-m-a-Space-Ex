"use client";

import React from "react";
import Link from "next/link";
import { FileText, Receipt, BarChart3, Zap } from "lucide-react";
import styles from "../business.module.css";

export default function MorePage() {
   const items = [
      {
         icon: <FileText size={20} />,
         title: "Invoices",
         desc: "Create and send invoices to your customers",
      },
      {
         icon: <Receipt size={20} />,
         title: "Reports",
         desc: "Download tax and revenue reports",
      },
      {
         icon: <BarChart3 size={20} />,
         title: "Integrations",
         desc: "Connect apps and services",
      },
      {
         icon: <Zap size={20} />,
         title: "Automations",
         desc: "Automate workflows and tasks",
      },
   ];
   return (
      <div className={styles.page}>
         <h1 className={styles.title}>More</h1>
         <div className={styles.moreGrid}>
            {items.map((item, i) => (
               <div key={i} className={styles.moreCard}>
                  <div className={styles.moreIcon}>{item.icon}</div>
                  <div className={styles.moreTitle}>{item.title}</div>
                  <div className={styles.moreDesc}>{item.desc}</div>
               </div>
            ))}
         </div>
      </div>
   );
}
