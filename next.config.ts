import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-leaflet'],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "us-east-1a.recoverycaresolutions.com", // Cambia esto por el dominio real de tus imágenes
        pathname: "/**",
      },
    ],
  },
   
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

