import crypto from "crypto";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./auth-edge";

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

// =========================================
// CURRENT USER (Node runtime only)
// Reads the session cookie and returns the userId, or null.
// =========================================
export async function getCurrentUserId(): Promise<string | null> {
   const store = await cookies();
   const token = store.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   const payload = await verifySessionToken(token);
   return payload?.userId ?? null;
}
