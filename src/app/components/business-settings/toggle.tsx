"use client";

import React from "react";
import styles from "../../styles/business-settings.module.css";

interface ToggleProps {
   checked: boolean;
   onChange: (v: boolean) => void;
   label: string;
   sub?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, sub }) => (
   <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
         <div className={styles.toggleLabel}>{label}</div>
         {sub && <div className={styles.toggleSub}>{sub}</div>}
      </div>
      <button
         type="button"
         className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
         onClick={() => onChange(!checked)}
         aria-pressed={checked}
      >
         <span className={styles.switchThumb} />
      </button>
   </div>
);

export default Toggle;
