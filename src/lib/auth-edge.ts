import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_VALUE = process.env.JWT_SECRET;

// Only used at request time, not at build time
function getSecret() {
   if (!JWT_SECRET_VALUE) {
      throw new Error(
         "JWT_SECRET is not set. Add it to your environment variables (Vercel → Settings → Environment Variables).",
      );
   }
   return new TextEncoder().encode(JWT_SECRET_VALUE);
}

export const SESSION_COOKIE_NAME = "space_ex_session";
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const SESSION_MAX_AGE = 60 * 60 * 2; // 2 hours

export interface SessionPayload {
   userId: string;
   email: string;
   name: string;
   rememberMe: boolean;
   [key: string]: unknown;
}

export async function createSessionToken(
   payload: SessionPayload,
   rememberMe: boolean,
): Promise<string> {
   const maxAge = rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
   return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(getSecret());
}

export async function verifySessionToken(
   token: string,
): Promise<SessionPayload | null> {
   try {
      const { payload } = await jwtVerify(token, getSecret());
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
