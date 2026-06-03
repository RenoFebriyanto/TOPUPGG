import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register')
  const isDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isAdmin = nextUrl.pathname.startsWith('/admin')

  // Redirect ke login jika belum login dan akses dashboard/admin
  if ((isDashboard || isAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Redirect ke dashboard jika sudah login dan buka halaman auth
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Blokir akses admin jika bukan ADMIN
  if (isAdmin && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}