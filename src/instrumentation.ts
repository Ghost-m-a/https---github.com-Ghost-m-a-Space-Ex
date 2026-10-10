import * as Sentry from "@sentry/nextjs";

export async function register() {
   // Sentry setup — keep existing behavior
   if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");

      // Env validation runs only on Node runtime
      const { validateEnv } = await import("./lib/env");
      validateEnv();
   }

   if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
   }
}

export const onRequestError = Sentry.captureRequestError;
