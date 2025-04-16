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
  if (typeof nombre === 'string' && nombre.toLowerCase().includes("null")) {
    return false;
  }

  // Si pasa todas las validaciones, es válido
  return true;
}

// This middleware will run on routes defined in matcher
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

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
    path.startsWith('/webapi/users/register');
    
  // Get auth token from cookies
  const token = request.cookies.get('access_token')?.value
  
  // Get user name from cookies
  const nombre = request.cookies.get('nombre')?.value ? decodeURIComponent(request.cookies.get('nombre')?.value || '').trim() : '';

  // Define routes that require the user to have completed their profile (have their name set)
  const requiresCompletedProfile = 
    path === '/registrar-propiedad' ||
    path === '/registrar-servicio' ||
    path === '/mi-perfil' ||
    path === '/editar-servicio' ||
    path.match(/^\/propiedades\/[^/]+\/room\/create$/) !== null ||
    path.match(/^\/editar-propiedad\/.*$/) !== null ||
    path.match(/^\/calendario\/.*$/) !== null ||
    path.match(/^\/propiedades\/[^/]+\/room\/edit$/) !== null;

  // Redirect logic
  if (!isPublicRoute && !token) {
    // If not on a public route and no token, redirect to login
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // If route requires completed profile but user doesn't have their name set
  if (token && requiresCompletedProfile && (esNombreValido(nombre) === false)) {
    // Redirect to profile completion page
    const url = new URL('/perfil', request.url)
    return NextResponse.redirect(url)
  }

  //si intenta acceder a perfil con datos ya cargados
  if (token && (path.startsWith('/perfil')) && (esNombreValido(nombre) === true)) {
    // Redirect to profile completion page
    const url = new URL('/mi-perfil', request.url)
    return NextResponse.redirect(url)
  }  

  return NextResponse.next()
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