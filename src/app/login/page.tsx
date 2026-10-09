"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Rocket, Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/styles/pages/login.module.css";

function LoginForm() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const from = searchParams.get("from") || "/";

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(true);
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

         const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, rememberMe }),
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         // ✅ Read as text first — handles both JSON and HTML error pages
         const text = await res.text();
         let data: { error?: string; user?: unknown } = {};

         try {
            data = JSON.parse(text);
         } catch {
            // Server returned HTML (crash page) — show a helpful message
            console.error(
               "Server returned non-JSON response:",
               text.slice(0, 200),
            );
            setError(
               "Server error — check the terminal for details. Visit /api/debug to diagnose.",
            );
            return;
         }

         if (!res.ok) {
            setError(data.error || `Request failed (${res.status})`);
            return;
         }

         router.push(from);
         router.refresh();
      } catch (err: unknown) {
         if (err instanceof Error && err.name === "AbortError") {
            setError("Request timed out — check your MongoDB connection.");
         } else {
            setError(
               err instanceof Error
                  ? `Network error: ${err.message}`
                  : "Network error. Please try again.",
            );
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.authPage}>
         <div className={styles.authCard}>
            <div className={styles.brandRow}>
               <div className={styles.brandIcon}>
                  <Rocket size={20} />
               </div>
               <span className={styles.brandText}>Space/Ex</span>
            </div>

            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>
               Sign in to continue to your dashboard.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
               {error && <div className={styles.error}>{error}</div>}

               <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                     type="email"
                     className={styles.input}
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     autoFocus
                  />
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.passwordWrap}>
                     <input
                        type={showPassword ? "text" : "password"}
                        className={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                     <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label="Toggle password visibility"
                     >
                        {showPassword ? (
                           <EyeOff size={16} />
                        ) : (
                           <Eye size={16} />
                        )}
                     </button>
                  </div>
               </div>

               <label className={styles.rememberRow}>
                  <input
                     type="checkbox"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                     className={styles.checkbox}
                  />
                  <span>Remember me for 30 days</span>
               </label>

               <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
               >
                  {loading ? (
                     <>
                        <Loader2 size={16} className={styles.spinner} /> Signing
                        in...
                     </>
                  ) : (
                     "Sign in"
                  )}
               </button>
            </form>

            <div className={styles.footer}>
               Don&apos;t have an account?{" "}
               <Link href="/signup" className={styles.footerLink}>
                  Sign up
               </Link>
            </div>
         </div>
      </div>
   );
}

export default function LoginPage() {
   return (
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
         <LoginForm />
      </Suspense>
   );
}
