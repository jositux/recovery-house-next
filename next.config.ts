import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-leaflet'],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        //hostname: "localtunnel.elcanoso.lat",
        hostname: "us-east-1a.recoverycaresolutions.com", 
        pathname: "/**",
      },
    ],
  },


  async rewrites() {  
    return [  
      {  
        source: '/webapi/:path*',  
        //destination: 'https://localtunnel.elcanoso.lat/:path*',
        destination: 'https://us-east-1a.recoverycaresolutions.com/:path*'
      },  
    ];  
  },

  
};

export default nextConfig;