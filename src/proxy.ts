import { NextResponse, NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-edge";

const PUBLIC_ROUTES = ["/"];

export async function proxy(req: NextRequest) {
   const { pathname } = req.nextUrl;

   if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return NextResponse.next();
   }

   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   const session = token ? await verifySessionToken(token) : null;

   const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

   if (!session && !isPublicRoute) {
      const url = new URL("/", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
