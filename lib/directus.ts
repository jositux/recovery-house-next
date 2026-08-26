// Host real de Directus. Se define una sola vez en DIRECTUS_URL (.env) y de ahí
// lo toman next.config.ts (rewrite + remotePatterns) y este archivo.
export const DIRECTUS_URL = process.env.DIRECTUS_URL as string;

export const AUTH_COOKIE_ACCESS = "access_token_secure";
export const AUTH_COOKIE_REFRESH = "refresh_token_secure";
