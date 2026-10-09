import { getCurrentUserId } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import HomePage from "./HomePage";

export const dynamic = "force-dynamic";

export default async function RootPage() {
   const userId = await getCurrentUserId();
   return userId ? <HomePage /> : <AuthForm />;
}
