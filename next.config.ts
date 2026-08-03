import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/android", destination: "/builds", permanent: true },
      { source: "/desktop", destination: "/builds", permanent: true },
      { source: "/protocol", destination: "/builds", permanent: true },
      { source: "/nullsec", destination: "/us", permanent: true },
    ];
  },
};

export default nextConfig;
