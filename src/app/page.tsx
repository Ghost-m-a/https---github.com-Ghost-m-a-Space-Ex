import { getCurrentUserId } from "@/app/lib/auth";
import AuthForm from "./components/AuthForm";
import HomePage from "./HomePage";

export const dynamic = "force-dynamic";

export default async function RootPage() {
   const userId = await getCurrentUserId();

   if (!userId) {
      return <AuthForm />;
   }

   return <HomePage />;
}
