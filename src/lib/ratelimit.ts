import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis() {
   if (!redis) {
      redis = new Redis({
         url: env.UPSTASH_REDIS_REST_URL,
         token: env.UPSTASH_REDIS_REST_TOKEN,
      });
   }
   return redis;
}

function getLimiter(
   prefix: string,
   requests: number,
   window: `${number} ${"s" | "m" | "h" | "d"}`,
) {
   const key = `${prefix}:${requests}:${window}`;
   if (!limiters.has(key)) {
      limiters.set(
         key,
         new Ratelimit({
            redis: getRedis(),
            limiter: Ratelimit.slidingWindow(requests, window),
            analytics: false,
            prefix: `rl:${prefix}`,
         }),
      );
   }
   return limiters.get(key)!;
}

// 5 login attempts per 15 min per IP
export const loginLimiter = () => getLimiter("login", 5, "15 m");

// 3 signups per hour per IP
export const signupLimiter = () => getLimiter("signup", 3, "1 h");

// 30 joins per hour per user
export const joinLimiter = () => getLimiter("join", 30, "1 h");

// 100 general API calls per minute per IP
export const apiLimiter = () => getLimiter("api", 100, "1 m");

export function isRateLimitConfigured(): boolean {
   return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export async function checkLimit(
   limiter: Ratelimit,
   identifier: string,
): Promise<
   { ok: true } | { ok: false; reset: number; limit: number; remaining: number }
> {
   if (!isRateLimitConfigured()) {
      return { ok: true }; // Graceful no-op in local dev
   }
   const result = await limiter.limit(identifier);
   if (result.success) return { ok: true };
   return {
      ok: false,
      reset: result.reset,
      limit: result.limit,
      remaining: result.remaining,
   };
}

export function getIpFromRequest(req: Request): string {
   const forwarded = req.headers.get("x-forwarded-for");
   if (forwarded) return forwarded.split(",")[0].trim();
   return req.headers.get("x-real-ip") ?? "unknown";
}
