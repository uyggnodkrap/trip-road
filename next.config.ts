import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/trip-road',
  images: { unoptimized: true },
};

export default nextConfig;
