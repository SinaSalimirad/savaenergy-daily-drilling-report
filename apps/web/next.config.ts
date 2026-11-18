import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smallest self-contained build for the Docker image.
  output: "standalone",
  // packages/schema ships TypeScript source, so Next has to compile it.
  transpilePackages: ["schema"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
