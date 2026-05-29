import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default auth(function middleware(req: any) {
  const { pathname } = req.nextUrl;
  const locale = pathname.split('/')[1] ?? 'vi';

  // Hard-block /library/my and sub-routes for unauthenticated users
  if (/^\/[a-z]{2}\/library\/my(\/|$)/.test(pathname)) {
    if (!req.auth) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/${locale}?callbackUrl=${callbackUrl}`, req.url),
      );
    }
  }

  // Delegate to next-intl for locale routing
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - static files (images, etc.)
  matcher: ['/', '/(vi|en)/:path*'],
};
