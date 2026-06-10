/*import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
*/
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "g9szrrl7-3000.asse.devtunnels.ms",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;