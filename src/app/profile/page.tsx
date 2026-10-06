"use client";

import React from "react";
import { User } from "lucide-react";

export default function ProfilePage() {
   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 24px",
            textAlign: "center",
            gap: 16,
         }}
      >
         <div
            style={{
               width: 80,
               height: 80,
               borderRadius: 20,
               background: "var(--bg-tertiary)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               color: "var(--text-muted)",
            }}
         >
            <User size={40} strokeWidth={1.5} />
         </div>
         <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Profile</h1>
         <p
            style={{
               color: "var(--text-secondary)",
               maxWidth: 380,
               lineHeight: 1.5,
               margin: 0,
            }}
         >
            Your public profile page. Edit your details from Settings in the
            sidebar.
         </p>
      </div>
   );
}
