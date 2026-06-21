import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session

  const isAuthRoute =
    nextUrl.pathname.startsWith('/auth/login') ||
    nextUrl.pathname.startsWith('/auth/register')

  // Alias lama /login dan /register → redirect ke path baru
  const isLegacyAuthRoute =
    nextUrl.pathname === '/login' ||
    nextUrl.pathname === '/register'

  const isDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')

  // PERBAIKAN: jika user sudah login dan membuka path legacy (/login atau
  // /register), langsung arahkan ke /dashboard dalam satu kali redirect.
  // Sebelumnya, path legacy selalu di-redirect ke /auth/login atau
  // /auth/register dulu (mengabaikan status login), baru request berikutnya
  // baru kena pengecekan "isAuthRoute && isLoggedIn" di bawah — sehingga
  // user yang sudah login mengalami dua kali redirect berturut-turut
  // (/login -> /auth/login -> /dashboard) alih-alih satu kali.
  if (isLegacyAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    const newPath = nextUrl.pathname === '/login' ? '/auth/login' : '/auth/register'
    return NextResponse.redirect(new URL(newPath, nextUrl))
  }

  // Redirect ke login jika belum login dan akses dashboard/admin
  if ((isDashboard || isAdminRoute) && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect ke dashboard jika sudah login dan buka halaman auth
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Blokir akses admin jika bukan ADMIN
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
    '/register',
  ],
}