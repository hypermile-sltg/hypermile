import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAdminRole } from '@/lib/roles'

const SESSION_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
] as const

function getSessionCookie(req: NextRequest) {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = req.cookies.get(name)?.value
    if (value) return value
  }
  return null
}

function clearSessionCookies(response: NextResponse) {
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.delete(name)
  }
  response.cookies.delete('next-auth.callback-url')
  response.cookies.delete('next-auth.csrf-token')
  response.cookies.delete('__Secure-next-auth.callback-url')
  response.cookies.delete('__Host-next-auth.csrf-token')
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionCookie = getSessionCookie(req)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Invalid/stale session cookie (e.g. after NEXTAUTH_SECRET rotation)
  if (sessionCookie && !token) {
    if (pathname === '/api/auth/session') {
      const response = NextResponse.json({})
      clearSessionCookies(response)
      return response
    }

    const response = NextResponse.next()
    clearSessionCookies(response)
    return response
  }

  if (pathname.startsWith('/profile')) {
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (!token.role || !isAdminRole(token.role as string)) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/auth/session',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
