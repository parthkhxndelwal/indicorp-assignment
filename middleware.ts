import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const AUTH_PAGES = ['/admin/login', '/admin/register', '/mechanic/login', '/mechanic/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAuthPage = AUTH_PAGES.includes(pathname)

  // Admin routes
  if (pathname.startsWith('/admin')) {
    // Allow auth pages through without redirect
    if (isAuthPage) {
      if (session?.user) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return NextResponse.next()
    }
    // Protected admin routes
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/mechanic/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Mechanic routes
  if (pathname.startsWith('/mechanic')) {
    // Allow auth pages through without redirect
    if (isAuthPage) {
      if (session?.user) {
        return NextResponse.redirect(new URL('/mechanic/dashboard', req.url))
      }
      return NextResponse.next()
    }
    // Protected mechanic routes
    if (!session?.user) {
      return NextResponse.redirect(new URL('/mechanic/login', req.url))
    }
    if (session.user.role !== 'MECHANIC') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/mechanic/:path*'],
}
