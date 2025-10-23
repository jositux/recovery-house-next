import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Verifica si un nombre es válido
 * @param nombre El nombre a validar
 * @returns true si el nombre es válido, false en caso contrario
 */

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

// This middleware will run on routes defined in matcher
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  console.log("request", request);

  // Define public routes that don't require authentication
  const isPublicRoute = 
  path === '/' ||
    path === '/login' ||
    path === '/registro' ||
    path === '/user' ||    
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
  const nombre = request.cookies.get('nombre')?.value ? decodeURIComponent(request.cookies.get('nombre')?.value || '').trim() : '';

  // Define routes that require the user to have completed their profile (have their name set)
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
  
  // Redirect logic
  if (!isPublicRoute && !token) {
    // If not on a public route and no token, redirect to login
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If route requires completed profile but user doesn't have their name set
  if (token && requiresCompletedProfile && !esNombreValido(nombre)) {
    const rel = getRelValue(path, request.nextUrl.searchParams);
    const url = new URL(`/perfil?rel=${encodeURIComponent(rel)}`, request.url);
    return NextResponse.redirect(url);
  }

  //si intenta acceder a perfil con datos ya cargados
  if (token && (path.startsWith('/perfil')) && (esNombreValido(nombre) === true)) {
    // Redirect to profile completion page
    const url = new URL('/mi-panel/mi-perfil', request.url);
    return NextResponse.redirect(url);
  }  

  return NextResponse.next();
}

// Configure the paths that should trigger this middleware
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
}