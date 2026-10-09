"use client";

import React from "react";
import styles from "@/styles/components/appshell.module.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import BottomBar from "./bottombar";

interface AppShellProps {
   children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
   return (
      <div className={styles.appShell}>
         <Navbar />
         <div className={styles.bodyContainer}>
            <Sidebar />
            <main className={styles.content}>{children}</main>
         </div>
         <BottomBar />
      </div>
   );
};

export default AppShell;
