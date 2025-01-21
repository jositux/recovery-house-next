import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-leaflet'],
   
  async rewrites() {  
    return [  
      {  
        source: '/webapi/:path*',  
        destination: 'https://us-east-1a.recoverycaresolutions.com/:path*', // Use environment variable  
      },  
    ];  
  }, 

};

export default nextConfig;

