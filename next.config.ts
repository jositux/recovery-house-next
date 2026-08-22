import type { NextConfig } from "next";

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
        hostname: "us-east-1a.recoverycaresolutions.com", 
        pathname: "/**",
      },
    ],
  },

  async rewrites() {  
    return [  
      {  
        source: '/webapi/:path*',  
        destination: 'https://us-east-1a.recoverycaresolutions.com/:path*',
      },  
    ];  
  },
};

export default nextConfig;