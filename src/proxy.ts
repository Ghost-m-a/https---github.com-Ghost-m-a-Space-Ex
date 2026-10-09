import { NextResponse, NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-edge";
const PUBLIC_ROUTES = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
   const { pathname } = req.nextUrl;

   // Skip API routes and static files
   if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return NextResponse.next();
   }

   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   const session = token ? await verifySessionToken(token) : null;

   const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

   // Redirect logged-in users away from login/signup
   if (session && isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url));
   }

   // Redirect logged-out users to login
   if (!session && !isPublicRoute) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
