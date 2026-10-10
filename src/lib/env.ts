function optional(key: string, fallback = ""): string {
   return process.env[key] ?? fallback;
}

export const env = {
   NODE_ENV: (process.env.NODE_ENV ?? "development") as
      | "development"
      | "production"
      | "test",

   // ---- Required ----
   MONGODB_URI: optional("MONGODB_URI"),
   JWT_SECRET: optional("JWT_SECRET"),

   // ---- Optional, degrade gracefully ----
   UPSTASH_REDIS_REST_URL: optional("UPSTASH_REDIS_REST_URL"),
   UPSTASH_REDIS_REST_TOKEN: optional("UPSTASH_REDIS_REST_TOKEN"),

   // ---- Email (with safe default sender) ----
   // Blank in .env.local → falls back to Resend's testing sender.
   // Works out of the box for testing without a verified domain.
   RESEND_API_KEY: optional("RESEND_API_KEY"),
   RESEND_FROM_EMAIL: optional("RESEND_FROM_EMAIL", "onboarding@resend.dev"),

   // ---- Uploads ----
   BLOB_READ_WRITE_TOKEN: optional("BLOB_READ_WRITE_TOKEN"),

   // ---- Monitoring ----
   NEXT_PUBLIC_SENTRY_DSN: optional("NEXT_PUBLIC_SENTRY_DSN"),
   SENTRY_AUTH_TOKEN: optional("SENTRY_AUTH_TOKEN"),

   // ---- App URL (falls back to request origin at runtime) ----
   NEXT_PUBLIC_APP_URL: optional("NEXT_PUBLIC_APP_URL"),

   // ---- Social OAuth (optional) ----
   META_APP_ID: optional("META_APP_ID"),
   META_APP_SECRET: optional("META_APP_SECRET"),
   GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
   GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET"),
   TIKTOK_CLIENT_KEY: optional("TIKTOK_CLIENT_KEY"),
   TIKTOK_CLIENT_SECRET: optional("TIKTOK_CLIENT_SECRET"),
};

export function validateEnv() {
   const errors: string[] = [];
   const warnings: string[] = [];

   // ---- Hard requirements ----
   if (!env.MONGODB_URI) {
      errors.push("MONGODB_URI is required");
   }
   if (!env.JWT_SECRET) {
      errors.push("JWT_SECRET is required");
   } else if (env.JWT_SECRET.length < 32) {
      errors.push(
         "JWT_SECRET must be at least 32 chars. Generate one with:\n" +
            "   openssl rand -base64 48",
      );
   }

   // ---- Soft warnings (features degrade) ----
   if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      warnings.push(
         "Upstash not configured → rate limiting disabled (auth endpoints are unprotected)",
      );
   }
   if (!env.RESEND_API_KEY) {
      warnings.push("Resend not configured → transactional emails disabled");
   }
   if (!env.BLOB_READ_WRITE_TOKEN) {
      warnings.push("Vercel Blob not configured → file uploads disabled");
   }
   if (!env.NEXT_PUBLIC_SENTRY_DSN) {
      warnings.push("Sentry not configured → errors only go to console");
   }

   // ---- Print results ----
   if (errors.length > 0) {
      console.error("\n❌ Environment validation failed:\n");
      errors.forEach((e) => console.error(`   • ${e}`));
      console.error("");

      if (env.NODE_ENV === "production") {
         throw new Error(`Environment validation failed: ${errors.join("; ")}`);
      }
   }

   if (warnings.length > 0 && env.NODE_ENV !== "production") {
      console.warn("\n⚠️  Environment warnings:\n");
      warnings.forEach((w) => console.warn(`   • ${w}`));
      console.warn("");
   }

   if (errors.length === 0 && warnings.length === 0) {
      console.log("✅ Environment validated");
   }
}
