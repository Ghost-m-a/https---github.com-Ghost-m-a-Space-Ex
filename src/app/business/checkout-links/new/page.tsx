"use client";

import { useRouter } from "next/navigation";
import { useWorkspace } from "../../../context/workspace-context";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import CheckoutLinkEditor from "../../../components/checkout-link-editor";

function NewCheckoutLinkInner() {
   const router = useRouter();
   const { activeBusiness } = useWorkspace();
   const params = useSearchParams();
   const productId = params.get("productId");

   useEffect(() => {
      // If no business is loaded, redirect
      if (!activeBusiness && typeof window !== "undefined") {
         const timer = setTimeout(() => {
            if (!activeBusiness) router.push("/business");
         }, 500);
         return () => clearTimeout(timer);
      }
   }, [activeBusiness, router]);

   return (
      <CheckoutLinkEditor mode="create" productId={productId || undefined} />
   );
}

export default function NewCheckoutLinkPage() {
   return (
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
         <NewCheckoutLinkInner />
      </Suspense>
   );
}
