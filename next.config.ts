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

  async headers() {
    return [
      {
        // Aplica a todas las rutas del sitio.
        source: '/:path*',
        headers: [
          {
            // Evita que otro sitio meta las páginas de acá en un iframe
            // (clickjacking) — no afecta que ESTE sitio muestre el checkout
            // embebido de Stripe, eso lo controla Stripe del lado de ellos.
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Solo tiene efecto real servido por HTTPS (producción); inofensivo en local.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;