import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
   process.env.JWT_SECRET ||
      "dev-secret-change-me-minimum-32-characters-please",
);

const COOKIE_NAME = "space_ex_session";
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_MAX_AGE = 60 * 60 * 2; // 2 hours (without remember me)

export interface SessionPayload {
   userId: string;
   email: string;
   name: string;
   rememberMe: boolean;
   [key: string]: unknown;
}

// =========================================
// PASSWORD HASHING (Node runtime only)
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
// JWT SESSION
// =========================================
export async function createSessionToken(
   payload: SessionPayload,
   rememberMe: boolean,
): Promise<string> {
   const maxAge = rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
   return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(JWT_SECRET);
}

export async function verifySessionToken(
   token: string,
): Promise<SessionPayload | null> {
   try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as SessionPayload;
   } catch {
      return null;
   }
}

export function getCookieOptions(rememberMe: boolean) {
   const opts: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      maxAge?: number;
   } = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
   };
   if (rememberMe) opts.maxAge = REMEMBER_MAX_AGE;
   return opts;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
