import { NextRequest, NextResponse } from 'next/server';
import { applyRefreshedAccessCookie, extractAccessToken, resolveUser } from '@/lib/auth/serverTokens';

// Protected prefix for all admin pages (except explicitly whitelisted paths like /admin/login).
const ADMIN_PROTECTED_PREFIX = '/admin';
// Protected internal API prefixes.
const PROTECTED_API_PREFIXES = ['/api/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const debug = process.env.NODE_ENV !== 'production';
  if (debug) console.log('[MW] path:', pathname);
  
  // Allow login/logout endpoints without auth
  if (pathname.startsWith('/admin/login') || 
      pathname === '/api/admin/login' || 
      pathname === '/api/admin/logout') {
    return NextResponse.next();
  }
  
  // Require auth for any /admin* path except the login page.
  const needsPageAuth = pathname.startsWith(ADMIN_PROTECTED_PREFIX) && !pathname.startsWith('/admin/login');
  const needsApiAuth = PROTECTED_API_PREFIXES.some(p => pathname.startsWith(p));
  if (!needsPageAuth && !needsApiAuth) {
    if (debug) console.log('[MW] not protected');
    return NextResponse.next();
  }

  const initialAccessToken = extractAccessToken({ headers: req.headers, cookies: req.cookies });

  if (!initialAccessToken && !req.cookies.get('refresh_token') && !req.cookies.get('refresh')) {
    if (debug) console.log('[MW] no token');
    if (needsApiAuth) {
      return new NextResponse(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { user, accessToken, refreshedAccessToken } = await resolveUser({ headers: req.headers, cookies: req.cookies });

  if (!user) {
    if (debug) console.log('[MW] auth failed after refresh attempt');
    if (needsApiAuth) {
      return new NextResponse(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(req.headers);
  if (accessToken) requestHeaders.set('authorization', `Bearer ${accessToken}`);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (refreshedAccessToken) {
    if (debug) console.log('[MW] token refreshed');
    applyRefreshedAccessCookie(res, refreshedAccessToken);
  }

  // Attach minimal user info in request headers for downstream handlers (Next limitation: rewrite with headers)
  if (needsApiAuth) {
    res.headers.set('x-user-id', String(user.id));
    res.headers.set('x-user-staff', String(!!user.is_staff));
    res.headers.set('x-user-super', String(!!user.is_superuser));
    return res;
  }
  if (debug) console.log('[MW] page authorized for user', user.id);
  return res;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
