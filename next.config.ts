import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
    {
      protocol: "https",
      hostname: "*.ufs.sh",
    },
  ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
  },
})(nextConfig);