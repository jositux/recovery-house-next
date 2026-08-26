import type { NextConfig } from "next";

const directusUrl = process.env.DIRECTUS_URL as string;
const directusHostname = new URL(directusUrl).hostname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-leaflet'],

  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
      },
      {
        pathname: "/webapi/assets/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: directusHostname,
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/webapi/:path*',
        destination: `${directusUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;