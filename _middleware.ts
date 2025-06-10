import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware will run on routes defined in matcher
export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const isPublicRoute = 
    path === '/webapi/auth/login' ||
    path === '/login' ||
    path === '/rooms' ||
    path.startsWith('/rooms/') ||
    path.startsWith('/propiedades/') ||
    path === '/user' ||
    path.startsWith('/user/')

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
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
}
