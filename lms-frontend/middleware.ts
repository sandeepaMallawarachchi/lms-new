import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simple middleware example. In a real app, you would check
// for a valid session or token rather than using localStorage
export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/forgot-password']
  
  const path = request.nextUrl.pathname
  
  // If path is public, allow access
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }
  
  // Get the JWT token from the auth cookie
  const token = request.cookies.get('auth')?.value
  
  // If no token is found, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // In a real application, you would verify the token here
    // This would involve checking the signature, expiration, etc.
    // For now, we just check if a token exists
    
    // You can also add the token to the request headers for API calls
    const response = NextResponse.next()
    
    // Add the token to the Authorization header for all API requests
    response.headers.append('Authorization', `Bearer ${token}`)
    
    return response
  } catch (error) {
    // If token validation fails, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Define the paths that should be checked by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 