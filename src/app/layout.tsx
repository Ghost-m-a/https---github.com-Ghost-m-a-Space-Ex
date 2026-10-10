import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/appshell";
import { WorkspaceProvider } from "@/context/workspace-context";
import { getCurrentUserId } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
   title: "Space-Ex",
   description: "Build and scale your business on Space-Ex.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const userId = await getCurrentUserId();

   return (
      <html lang="en" data-theme="dark">
         <body className={inter.className}>
            {userId ? (
               <WorkspaceProvider>
                  <AppShell>{children}</AppShell>
               </WorkspaceProvider>
            ) : (
               children
            )}
         </body>
      </html>
   );
}
