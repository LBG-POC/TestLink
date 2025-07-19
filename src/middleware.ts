import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const password = request.cookies.get('admin-password')?.value;
  
  // Use a secure way to store and check passwords in a real app
  const isAdminAuthenticated = password === process.env.ADMIN_PASSWORD;

  if (request.nextUrl.pathname.startsWith('/admin') && !isAdminAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (request.nextUrl.pathname.startsWith('/login') && isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
