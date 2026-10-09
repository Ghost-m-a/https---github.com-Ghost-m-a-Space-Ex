"use client";

import { useParams } from "next/navigation";
import CheckoutLinkEditor from "@/components/checkout-link-editor";

export default function EditCheckoutLinkPage() {
   const params = useParams();
   const id = params.id as string;
   return <CheckoutLinkEditor mode="edit" linkId={id} />;
}
