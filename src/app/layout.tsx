import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "./components/appshell";
import { WorkspaceProvider } from "./context/workspace-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
   title: "Space/Ex",
   description: "Modern workspace dashboard",
};

export default function RootLayout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <script
               dangerouslySetInnerHTML={{
                  __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                  document.documentElement.style.colorScheme = resolvedTheme;
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
               }}
            />
         </head>
         <body className={inter.className}>
            <WorkspaceProvider>
               <AppShell>{children}</AppShell>
            </WorkspaceProvider>
         </body>
      </html>
   );
}
