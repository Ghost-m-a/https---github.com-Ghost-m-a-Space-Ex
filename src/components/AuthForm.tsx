"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "./AuthForm.module.css";

type Mode = "login" | "signup";

export default function AuthForm() {
   const router = useRouter();
   const [mode, setMode] = useState<Mode>("login");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [showPassword, setShowPassword] = useState(false);

   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(true);

   const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
         const endpoint =
            mode === "login" ? "/api/auth/login" : "/api/auth/signup";

         const payload =
            mode === "login"
               ? { email, password, rememberMe }
               : { name, email, password, rememberMe };

         const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
         });

         const data = await res.json().catch(() => ({}));

         if (!res.ok) {
            setError(data?.error ?? "Something went wrong");
            setLoading(false);
            return;
         }

         // Cookie is now set. Force a full reload so:
         //   - layout.tsx re-runs and mounts the AppShell
         //   - UserDropdown re-fetches /api/auth/me
         window.location.href = "/";
      } catch {
         setError("Network error. Please try again.");
         setLoading(false);
      }
   };

   return (
      <div className={styles.wrap}>
         <div className={styles.card}>
            <div className={styles.brandRow}>
               <div className={styles.brandIcon}>
                  <Rocket size={20} />
               </div>
               <span className={styles.brandName}>Space-Ex</span>
            </div>

            <h1 className={styles.title}>
               {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className={styles.sub}>
               {mode === "login"
                  ? "Sign in to continue to your workspace."
                  : "Start building with Space-Ex in seconds."}
            </p>

            <div className={styles.tabs}>
               <button
                  type="button"
                  className={`${styles.tab} ${
                     mode === "login" ? styles.tabActive : ""
                  }`}
                  onClick={() => {
                     setMode("login");
                     setError(null);
                  }}
               >
                  Log in
               </button>
               <button
                  type="button"
                  className={`${styles.tab} ${
                     mode === "signup" ? styles.tabActive : ""
                  }`}
                  onClick={() => {
                     setMode("signup");
                     setError(null);
                  }}
               >
                  Sign up
               </button>
            </div>

            <form onSubmit={submit} className={styles.form}>
               {mode === "signup" && (
                  <label className={styles.field}>
                     <span className={styles.label}>Name</span>
                     <input
                        className={styles.input}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        required
                        autoComplete="name"
                     />
                  </label>
               )}

               <label className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <input
                     className={styles.input}
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="you@example.com"
                     required
                     autoComplete="email"
                  />
               </label>

               <label className={styles.field}>
                  <span className={styles.label}>Password</span>
                  <div className={styles.passwordWrap}>
                     <input
                        className={styles.input}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete={
                           mode === "login"
                              ? "current-password"
                              : "new-password"
                        }
                     />
                     <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((s) => !s)}
                        tabIndex={-1}
                     >
                        {showPassword ? (
                           <EyeOff size={16} />
                        ) : (
                           <Eye size={16} />
                        )}
                     </button>
                  </div>
               </label>

               <label className={styles.checkboxRow}>
                  <input
                     type="checkbox"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me for 30 days</span>
               </label>

               {error && <div className={styles.error}>{error}</div>}

               <button
                  type="submit"
                  className={styles.submit}
                  disabled={loading}
               >
                  {loading ? (
                     <>
                        <Loader2 size={16} className={styles.spinner} />
                        Please wait…
                     </>
                  ) : mode === "login" ? (
                     "Log in"
                  ) : (
                     "Create account"
                  )}
               </button>
            </form>

            <p className={styles.footer}>
               {mode === "login" ? (
                  <>
                     Don&apos;t have an account?{" "}
                     <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => {
                           setMode("signup");
                           setError(null);
                        }}
                     >
                        Sign up
                     </button>
                  </>
               ) : (
                  <>
                     Already have an account?{" "}
                     <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => {
                           setMode("login");
                           setError(null);
                        }}
                     >
                        Log in
                     </button>
                  </>
               )}
            </p>
         </div>
      </div>
   );
}
