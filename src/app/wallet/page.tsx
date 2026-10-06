"use client";

import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

export default function WalletPage() {
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
            <Wallet size={40} strokeWidth={1.5} />
         </div>
         <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Wallet</h1>
         <p
            style={{
               color: "var(--text-secondary)",
               maxWidth: 380,
               lineHeight: 1.5,
               margin: 0,
            }}
         >
            Wallet features are coming soon. In the meantime, manage your funds
            in{" "}
            <Link
               href="/business"
               style={{ color: "var(--accent-blue)", textDecoration: "none" }}
            >
               Business Home
            </Link>
            .
         </p>
      </div>
   );
}
