import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // @ts-ignore
  allowedDevOrigins: ["14df525de8d485.lhr.life", "*.lhr.life", "localhost.run"],
};

export default nextConfig;
