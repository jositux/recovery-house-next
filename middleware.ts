import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Asegúrate de que este archivo defina 'defaultLocale', 'locales' y 'Locale'
import { defaultLocale, locales, type Locale } from "./lib/i18n" 

// Nombre de la cookie para guardar la preferencia de idioma del usuario
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'; 

// --- Funciones Auxiliares (No i18n) ---

/**
 * Verifica si un valor de nombre es válido (no nulo, vacío o la cadena "null").
 */
function esNombreValido(nombre: string | null | undefined): boolean {
  if (!nombre || (typeof nombre === 'string' && nombre.trim() === "")) {
    return false;
  }
  if (typeof nombre === 'string' && nombre.trim().toLowerCase() === "null") {
    return false;
  }
  return true;
}

/**
 * Obtiene el valor 'rel' para la redirección después de completar el perfil.
 */
function getRelValue(pathname: string, searchParams: URLSearchParams): string {
  const segments = pathname.split('/').filter(Boolean);
  
  // Lógica para rutas específicas
  if (segments[0] === 'mi-panel') return segments[1] ?? 'complete-profile';

  if (segments[0]?.startsWith('confirm-pay')) {
    const queryRel = searchParams.get('rel');
    if (queryRel) return queryRel;
    return segments[1] ?? 'complete-profile';
  }
  
  if (segments[0]?.startsWith('checkout')) return segments[0];
  
  return 'complete-profile';
}

// --- Funciones Auxiliares (i18n) ---

/**
 * Determina el locale a usar: 1. Cookie > 2. Accept-Language > 3. defaultLocale.
 * 🛑 PRIORIDAD CLAVE: La cookie tiene preferencia.
 */
function getLocale(request: NextRequest): Locale { 
  // 1. Intentar obtener el locale de la cookie (elección del usuario)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Si no hay cookie, detectar el locale por el encabezado Accept-Language
  const acceptLanguage = request.headers.get("accept-language")

  if (!acceptLanguage) {
    return defaultLocale
  }

  // Parsear y ordenar por prioridad 'q'
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, priority = "q=1"] = lang.trim().split(";")
      const q = priority.startsWith("q=") ? Number.parseFloat(priority.slice(2)) : 1
      return { locale: locale.split("-")[0], q }
    })
    .sort((a, b) => b.q - a.q)

  // Encontrar el primer locale coincidente
  for (const { locale } of languages) {
    if (locales.includes(locale as Locale)) { 
      return locale as Locale
    }
  }

  return defaultLocale
}

/**
 * Elimina el locale del path (ej: /es/page -> /page).
 */
function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || '/';
    }
  }
  return pathname;
}

/**
 * Obtiene el locale actual del path (ej: /es/page -> 'es').
 */
function getLocaleFromPath(pathname: string): Locale | null { 
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale as Locale;
    }
  }
  return null;
}

// --- Middleware Principal ---

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Chequear si el pathname ya tiene un locale
  let currentLocale = getLocaleFromPath(pathname);
  const pathnameHasLocale = currentLocale !== null;
  
  let response = NextResponse.next();
  let localeToSetInCookie: Locale; 

  // --- Lógica de Internacionalización (i18n) ---
  
  if (pathnameHasLocale) {
    // Si hay locale en el path (ej: /en/page), usamos ese.
    localeToSetInCookie = currentLocale!;
  } else {
    // Si NO hay locale en el path (ej: /page), lo detectamos (prioriza cookie > Accept-Language).
    localeToSetInCookie = getLocale(request);
    
    // Y redirigimos para añadirlo al path (ej: /page -> /es/page)
    request.nextUrl.pathname = `/${localeToSetInCookie}${pathname}`;
    response = NextResponse.redirect(request.nextUrl);
    
    // Actualizamos 'currentLocale' para la lógica de Autenticación
    currentLocale = localeToSetInCookie; 
  }

  // 2. Persistir la preferencia de idioma en la cookie si es necesario (Lógica unificada)
  const existingCookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  
  if (existingCookieLocale !== localeToSetInCookie) {
      // Establecer la cookie (primera visita o cambio de idioma)
      response.cookies.set(LOCALE_COOKIE_NAME, localeToSetInCookie, { 
        path: '/', 
        maxAge: 31536000 // 1 año
      });
  }

  // --- Lógica de Autenticación y Autorización ---
  
  // Desde aquí en adelante, trabaja con el path SIN locale para facilitar la coincidencia
  const path = getPathWithoutLocale(pathname);
  
  // Define rutas públicas que no requieren autenticación
  const isPublicRoute = 
    path === '/' ||
    path === '/login' ||
    path === '/registro' ||
    path === '/user' ||  
    path === '/terms' ||  
    path === '/policy' ||  
    path === '/privacidad' ||    
    path === '/webapi/auth/login' ||
    path === '/webapi/users' ||    
    path.startsWith('/admin/users/') ||
    path.startsWith('/propiedades/') ||
    path.startsWith('/rooms') ||
    path.startsWith('/user/') ||
    path.startsWith('/webapi/items/Booking') ||
    path.startsWith('/webapi/items/ExtraTags') ||
    path.startsWith('/webapi/items/Property') ||
    path.startsWith('/webapi/items/Provider') ||    
    path.startsWith('/webapi/items/Room') ||
    path.startsWith('/webapi/items/Stay') ||
    path.startsWith('/webapi/items/Prepayment_Config') || 
    path.startsWith('/webapi/auth/password/request') ||
    path.startsWith('/webapi/auth/password/reset') || 
    path.startsWith('/webapi/items/Available_Locations') ||    
    path.startsWith('/webapi/users/register');
    
  // Get auth token from cookies
  const token = request.cookies.get('access_token')?.value;
  
  // Get user name from cookies
  const nombre = request.cookies.get('nombre')?.value 
    ? decodeURIComponent(request.cookies.get('nombre')?.value || '').trim() 
    : '';

  // Define rutas que requieren que el usuario haya completado su perfil
  const requiresCompletedProfile =
    path.match(/^\/mi-panel(?:\/[^/]+)?\/propiedades\/[^/]+\/servicios\/[^/]+\/rooms\/[^/]+\/bookings\/[^/]+\/edit$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/propiedades\/[^/]+\/room\/(crear|agregar|edit|editar)$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/editar-propiedad(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/registrar-propiedad(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/registrar-servicio(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/editar-servicio(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/booking-modify(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/calendario(?:\/.*)?$/) !== null ||
    path.match(/^\/mi-panel(?:\/[^/]+)?\/mi-perfil(?:\/.*)?$/) !== null ||
    path.match(/^\/confirm-pay(?:-modify)?(?:\/.*)?$/) !== null ||
    path.match(/^\/checkout(?:-modify|-balanced)?(?:\/.*)?$/) !== null;
    
  // Redirección: Usuario NO autenticado a una ruta protegida
  if (!isPublicRoute && !token) {
    const url = new URL(`/${currentLocale}/login`, request.url);
    return NextResponse.redirect(url);
  }

  // Redirección: Usuario SÍ autenticado pero debe completar perfil
  if (token && requiresCompletedProfile && !esNombreValido(nombre)) {
    const rel = getRelValue(path, request.nextUrl.searchParams);
    const url = new URL(`/${currentLocale}/perfil?rel=${encodeURIComponent(rel)}`, request.url);
    return NextResponse.redirect(url);
  }

  // Redirección: Usuario SÍ autenticado y perfil completo, intenta ir a /perfil
  if (token && path.startsWith('/perfil') && esNombreValido(nombre) === true) {
    const url = new URL(`/${currentLocale}/mi-panel/mi-perfil`, request.url);
    return NextResponse.redirect(url);
  }  

  return response; // Retorna la respuesta con la cookie y/o la redirección inicial
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Excluye API routes, estáticos, imágenes, etc.
    '/((?!api|_next/static|_next/image|assets|webapi|webapi/assets|favicon.ico|placeholder.svg).*)',
  ],
};