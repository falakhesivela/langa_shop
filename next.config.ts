import type { NextConfig } from "next";

const r2PublicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
const r2Hostname = r2PublicBase
  ? new URL(r2PublicBase).hostname
  : undefined;

const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: "https",
    hostname: "**.r2.dev",
    pathname: "/**",
  },
];

if (r2Hostname && r2Hostname !== "**.r2.dev") {
  remotePatterns.push({
    protocol: "https",
    hostname: r2Hostname,
    pathname: "/**",
  });
}

try {
  const apiHostname = new URL(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  ).hostname;
  remotePatterns.push({
    protocol: "http",
    hostname: apiHostname,
    pathname: "/media/**",
  });
  remotePatterns.push({
    protocol: "https",
    hostname: apiHostname,
    pathname: "/media/**",
  });
} catch {
  // Ignore invalid NEXT_PUBLIC_API_URL during config load.
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns,
  },
};

export default nextConfig;
