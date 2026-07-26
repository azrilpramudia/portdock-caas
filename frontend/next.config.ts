import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [75, 100],
  },
  // @ts-ignore
  allowedDevOrigins: ['portdock.my.id', 'api.portdock.my.id'],
};

export default nextConfig;
