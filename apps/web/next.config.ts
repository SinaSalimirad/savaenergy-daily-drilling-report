import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smallest self-contained build for the Docker image.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
