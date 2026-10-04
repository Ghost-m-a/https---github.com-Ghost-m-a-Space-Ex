import crypto from "crypto";

// =========================================
// RE-EXPORT EDGE-SAFE HELPERS
// (so existing imports from "./auth" still work)
// =========================================
export {
   createSessionToken,
   verifySessionToken,
   getCookieOptions,
   SESSION_COOKIE_NAME,
   REMEMBER_MAX_AGE,
   SESSION_MAX_AGE,
} from "./auth-edge";

export type { SessionPayload } from "./auth-edge";

// =========================================
// PASSWORD HASHING (Node.js runtime only)
// =========================================
export function hashPassword(password: string): string {
   const salt = crypto.randomBytes(16).toString("hex");
   const hash = crypto.scryptSync(password, salt, 64).toString("hex");
   return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
   const [salt, original] = stored.split(":");
   if (!salt || !original) return false;
   const hash = crypto.scryptSync(password, salt, 64).toString("hex");
   try {
      return crypto.timingSafeEqual(
         Buffer.from(hash, "hex"),
         Buffer.from(original, "hex"),
      );
   } catch {
      return false;
   }
}
