"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "../login/auth.module.css";

export default function SignupPage() {
   const router = useRouter();
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [acceptedTerms, setAcceptedTerms] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!acceptedTerms) {
         setError("You must accept the Terms and Conditions");
         return;
      }

      setLoading(true);
      try {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 15000);

         const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, acceptedTerms }),
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         const text = await res.text();
         let data: { error?: string } = {};

         try {
            data = JSON.parse(text);
         } catch {
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

         router.push("/");
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

            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
               Start building your business today.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
               {error && <div className={styles.error}>{error}</div>}

               <div className={styles.field}>
                  <label className={styles.label}>Full name</label>
                  <input
                     type="text"
                     className={styles.input}
                     placeholder="Dr. Zakarinović"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     autoFocus
                  />
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                     type="email"
                     className={styles.input}
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>

               <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <div className={styles.passwordWrap}>
                     <input
                        type={showPassword ? "text" : "password"}
                        className={styles.input}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
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
                     checked={acceptedTerms}
                     onChange={(e) => setAcceptedTerms(e.target.checked)}
                     className={styles.checkbox}
                     required
                  />
                  <span>
                     I agree to the{" "}
                     <Link
                        href="/terms"
                        className={styles.footerLink}
                        target="_blank"
                     >
                        Terms
                     </Link>{" "}
                     and{" "}
                     <Link
                        href="/privacy"
                        className={styles.footerLink}
                        target="_blank"
                     >
                        Privacy Policy
                     </Link>
                  </span>
               </label>

               <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || !acceptedTerms}
               >
                  {loading ? (
                     <>
                        <Loader2 size={16} className={styles.spinner} />{" "}
                        Creating account...
                     </>
                  ) : (
                     "Create account"
                  )}
               </button>
            </form>

            <div className={styles.footer}>
               Already have an account?{" "}
               <Link href="/login" className={styles.footerLink}>
                  Sign in
               </Link>
            </div>
         </div>
      </div>
   );
}
