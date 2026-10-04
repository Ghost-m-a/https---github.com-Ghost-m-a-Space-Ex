import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ["192.168.1.53"],
   poweredByHeader: false,
   compress: true,
   reactStrictMode: true,
   experimental: {
      optimizePackageImports: ["lucide-react"],
   },
   async headers() {
      return [
         {
            source: "/(.*)",
            headers: [
               { key: "X-Frame-Options", value: "SAMEORIGIN" },
               { key: "X-Content-Type-Options", value: "nosniff" },
               {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
               },
            ],
         },
      ];
   },
};

export default nextConfig;
