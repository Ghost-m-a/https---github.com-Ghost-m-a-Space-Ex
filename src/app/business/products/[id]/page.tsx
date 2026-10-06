"use client";

import { useParams } from "next/navigation";
import ProductEditor from "../../../components/product-editor";

export default function EditProductPage() {
   const params = useParams();
   const id = params.id as string;
   return <ProductEditor mode="edit" productId={id} />;
}
