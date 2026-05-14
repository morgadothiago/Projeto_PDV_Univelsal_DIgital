import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware — route protection
 *
 * Public routes (no auth required):
 *   /login, /register, /forgot-password, /reset-password
 *   /cardapio/*  — cardápio digital (accessed by customers via QR code)
 *   /api/*       — API routes
 *
 * All other routes rely on client-side auth guards in their layout files.
 * This middleware serves as a belt-and-suspenders explicit allow-list for
 * routes that must NEVER be redirected, regardless of cookie state.
 */

const PUBLIC_PATHS: (string | RegExp)[] = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  /^\/cardapio(\/.*)?$/,
  /^\/api\//,
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    typeof p === 'string' ? pathname === p || pathname.startsWith(p + '/') : p.test(pathname),
  )
}

export function middleware(request: NextRequest): NextResponse {
  // All /cardapio/* routes pass through unconditionally
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
