import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware will run on routes defined in matcher
export function middleware(request: NextRequest) {
  /*
  //[5384] Por ahora no, despues vemos de implementar el middleware
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Check if the path is protected (needs authentication)
  const isProtectedRoute = 
    path.startsWith('/profile') || 
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/w-host') || 
    path.startsWith('/w-visitante') || 
    path.startsWith('/w-proveedor')

  // Get auth token from cookies
  const token = request.cookies.get('access_token')?.value

  // Redirect logic
  if (isProtectedRoute) {
    // If no token and on a protected route, redirect to login
    if (!token) {
      const url = new URL('/login', request.url)
      return NextResponse.redirect(url)
    }
  }
  */
  return NextResponse.next()
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/w-host/:path*',
    '/w-visitante/:path*',
    '/w-proveedor/:path*'
  ],
}
