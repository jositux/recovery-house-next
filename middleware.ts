import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware will run on routes defined in matcher
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  //[5384]  Cambiar esto antes de subir!!!
  console.log(path);

  // Define public routes that don't require authentication
  const isPublicRoute = 
  path === '/' ||
    path === '/login' ||
    path === '/registro' ||
    path === '/placeholder.svg' ||
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

  // Redirect logic
  if (!isPublicRoute && !token) {
    // If not on a public route and no token, redirect to login
    const url = new URL('/login', request.url)
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
    '/((?!api|_next/static|_next/image|assets|webapi/assets|favicon.ico).*)',
  ],
}
