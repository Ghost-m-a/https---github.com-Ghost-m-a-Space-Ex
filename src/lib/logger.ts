import * as Sentry from "@sentry/nextjs";

export function logError(
   context: string,
   err: unknown,
   meta?: Record<string, unknown>,
) {
   console.error(`[${context}]`, err, meta ?? "");

   if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(err, {
         tags: { context },
         extra: meta,
      });
   }
}

export function logWarn(
   context: string,
   message: string,
   meta?: Record<string, unknown>,
) {
   console.warn(`[${context}]`, message, meta ?? "");
}

export function logInfo(
   context: string,
   message: string,
   meta?: Record<string, unknown>,
) {
   console.log(`[${context}]`, message, meta ?? "");
}
