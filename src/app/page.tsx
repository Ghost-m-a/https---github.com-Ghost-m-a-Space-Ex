import { cookies } from "next/headers";
import { getCurrentUserId } from "@/app/lib/auth";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-edge";
import AuthForm from "./components/AuthForm";
import HomePage from "./HomePage";

export const dynamic = "force-dynamic";

export default async function RootPage() {
   const store = await cookies();
   const rawToken = store.get(SESSION_COOKIE_NAME)?.value;
   const userId = await getCurrentUserId();

   // ---- DEBUG OUTPUT (remove after fixing) ----
   console.log("[ROOT] cookie present:", Boolean(rawToken));
   console.log("[ROOT] token preview:", rawToken?.slice(0, 30) ?? "(none)");
   console.log("[ROOT] resolved userId:", userId);

   return (
      <>
         {/* DEBUG BANNER — remove after fixing */}
         <div
            style={{
               background: "#111",
               color: "#0f0",
               padding: "8px 16px",
               fontFamily: "monospace",
               fontSize: 12,
               borderBottom: "1px solid #333",
            }}
         >
            DEBUG · cookie={rawToken ? "YES" : "NO"} · userId=
            {userId ?? "null"} · rendering=
            {userId ? "HomePage" : "AuthForm"}
         </div>

         {userId ? <HomePage /> : <AuthForm />}
      </>
   );
}
