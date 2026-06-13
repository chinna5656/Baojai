/*import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
*/
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.31.240.1"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "g9szrrl7-3000.asse.devtunnels.ms",
        "localhost:3000",
        "172.31.240.1",
      ],
    },
  },
};

export default nextConfig;
