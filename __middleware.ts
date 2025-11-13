import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, locales } from "./lib/i18n"

function esNombreValido(nombre: string | null | undefined): boolean {
  // Verifica si es undefined, null, cadena vacía o solo espacios
  if (nombre === undefined || nombre === null || nombre === "" || (typeof nombre === 'string' && nombre.trim() === "")) {
    return false;
  }

  // Verifica si contiene la palabra "null" (independiente de los espacios alrededor)
  if (typeof nombre === 'string' && nombre.trim().toLowerCase() === "null") {
    return false;
  }

  // Si pasa todas las validaciones, es válido
  return true;
}

function getRelValue(pathname: string, searchParams: URLSearchParams): string {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments[0] === 'mi-panel') return segments[1] ?? 'complete-profile';

  if (segments[0]?.startsWith('confirm-pay')) {
    const queryRel = searchParams.get('rel');
    if (queryRel) return queryRel;
    return segments[1] ?? 'complete-profile';
  }
  
  if (segments[0]?.startsWith('checkout')) return segments[0];
  
  return 'complete-profile';
}

// Helper function to get locale from request
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language")

  if (!acceptLanguage) {
    return defaultLocale
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, priority = "q=1"] = lang.trim().split(";")
      const q = priority.startsWith("q=") ? Number.parseFloat(priority.slice(2)) : 1
      return { locale: locale.split("-")[0], q }
    })
    .sort((a, b) => b.q - a.q)

  // Find first matching locale
  for (const { locale } of languages) {
    if (locales.includes(locale as any)) {
      return locale
    }
  }

  return defaultLocale
}

// Helper function to strip locale from path
function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || '/';
    }
  }
  return pathname;
}

// Helper function to get current locale from path
function getLocaleFromPath(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the pathname already has a locale
  const currentLocale = getLocaleFromPath(pathname);
  const pathnameHasLocale = currentLocale !== null;
  
  // If no locale, redirect to add it
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }
  
  // From here on, work with the path WITHOUT locale for easier matching
  const path = getPathWithoutLocale(pathname);
  
  // Define public routes that don't require authentication
  const isPublicRoute = 
    path === '/' ||
    path === '/login' ||
    path === '/registro' ||
    path === '/user' ||  
    path === '/terms' ||  
    path === '/privacidad' ||    
    path === '/webapi/auth/login' ||
    path === '/webapi/users' ||    
    path.startsWith('/admin/users/') ||
    path.startsWith('/propiedades/') ||
    path.startsWith('/rooms') ||
    path.startsWith('/user/') ||
    path.startsWith('/webapi/items/Booking') ||
    path.startsWith('/webapi/items/Property') ||
    path.startsWith('/webapi/items/Provider') ||    
    path.startsWith('/webapi/items/Room') ||
    path.startsWith('/webapi/items/Stay') ||
    path.startsWith('/webapi/items/Prepayment_Config') || 
    path.startsWith('/webapi/auth/password/request') ||
    path.startsWith('/webapi/auth/password/reset') ||    
    path.startsWith('/webapi/users/register');
    
  // Get auth token from cookies
  const token = request.cookies.get('access_token')?.value;
  
  // Get user name from cookies
  const nombre = request.cookies.get('nombre')?.value 
    ? decodeURIComponent(request.cookies.get('nombre')?.value || '').trim() 
    : '';

  // Define routes that require the user to have completed their profile
// Define routes that require the user to have completed their profile
const requiresCompletedProfile =
  path.match(/^\/mi-panel(?:\/[^/]+)?\/propiedades\/[^/]+\/servicios\/[^/]+\/rooms\/[^/]+\/bookings\/[^/]+\/edit$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/propiedades\/[^/]+\/room\/(create|agregar|edit|editar)$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/editar-propiedad(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/registrar-propiedad(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/registrar-servicio(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/editar-servicio(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/booking-modify(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/calendario(?:\/.*)?$/) !== null ||
  path.match(/^\/mi-panel(?:\/[^/]+)?\/mi-perfil(?:\/.*)?$/) !== null ||
  path.match(/^\/confirm-pay(?:-modify)?(?:\/.*)?$/) !== null ||
  path.match(/^\/checkout(?:-modify|-balanced)?(?:\/.*)?$/) !== null;
  // Redirect logic - now with locale preserved
  if (!isPublicRoute && !token) {
    const url = new URL(`/${currentLocale}/login`, request.url);
    return NextResponse.redirect(url);
  }

  // If route requires completed profile but user doesn't have their name set
  if (token && requiresCompletedProfile && !esNombreValido(nombre)) {
    const rel = getRelValue(path, request.nextUrl.searchParams);
    const url = new URL(`/${currentLocale}/perfil?rel=${encodeURIComponent(rel)}`, request.url);
    return NextResponse.redirect(url);
  }

  // If trying to access /perfil with data already loaded
  if (token && path.startsWith('/perfil') && esNombreValido(nombre) === true) {
    const url = new URL(`/${currentLocale}/mi-panel/mi-perfil`, request.url);
    return NextResponse.redirect(url);
  }  

  return NextResponse.next();

}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     * - assets (assets folder)
     * - webapi/assets (assets folder)
     */
    '/((?!api|_next/static|_next/image|assets|webapi/assets|favicon.ico|placeholder.svg).*)',
  ],
};