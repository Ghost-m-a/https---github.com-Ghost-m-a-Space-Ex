"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthForm.module.css";

type Mode = "login" | "signup";

export default function AuthForm() {
   const router = useRouter();
   const [mode, setMode] = useState<Mode>("login");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

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
            return;
         }

         // Session cookie is now set — re-run the server component on /
         router.refresh();
         router.push("/");
      } catch {
         setError("Network error. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.wrap}>
         <div className={styles.card}>
            <div className={styles.brand}>
               <span className={styles.brandDot} />
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

            {/* Tabs */}
            <div className={styles.tabs}>
               <button
                  type="button"
                  className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
                  onClick={() => {
                     setMode("login");
                     setError(null);
                  }}
               >
                  Log in
               </button>
               <button
                  type="button"
                  className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
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
                  <input
                     className={styles.input}
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     required
                     minLength={6}
                     autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                     }
                  />
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
                  {loading
                     ? "Please wait…"
                     : mode === "login"
                       ? "Log in"
                       : "Create account"}
               </button>
            </form>
         </div>
      </div>
   );
}
