import type { NextConfig } from "next";

const nextConfig: NextConfig = {

   
  async rewrites() {  
    return [  
      {  
        source: '/api/:path*',  
        destination: 'https://us-east-1a.recoverycaresolutions.com/:path*', // Use environment variable  
      },  
    ];  
  }, 

};

export default nextConfig;

