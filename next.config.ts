import type { NextConfig } from "next";

const r2PublicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
const r2Hostname = r2PublicBase
  ? new URL(r2PublicBase).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: r2Hostname
      ? [
          {
            protocol: "https",
            hostname: r2Hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
