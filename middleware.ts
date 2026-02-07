import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ko', 'ja', 'en'];
const defaultLocale = 'ko';

// 마이페이지 로그인/접근제한 페이지는 인증 없이 허용
const ALLOWED_MYPAGE_PATHS = [
  '/mypage/login',
  '/mypage/access-restricted',
];

function getLocaleFromHeaders(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, q] = lang.trim().split(';q=');
      return { code: code.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (locales.includes(code)) return code;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip locale handling for: api, _next, admin, mypage, static files
  const isExcluded =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mypage') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.\w+$/);

  // 2. Handle mypage auth (unchanged from original)
  if (pathname.startsWith('/mypage')) {
    if (ALLOWED_MYPAGE_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
      return NextResponse.next();
    }

    const customerSession = request.cookies.get('customer_session');
    if (!customerSession?.value) {
      return NextResponse.redirect(new URL('/mypage/login', request.url));
    }

    try {
      const session = JSON.parse(
        Buffer.from(customerSession.value, 'base64').toString('utf-8')
      );

      if (session.exp < Date.now()) {
        const response = NextResponse.redirect(new URL('/mypage/login', request.url));
        response.cookies.delete('customer_session');
        return response;
      }

      if (!session.reservationId) {
        return NextResponse.redirect(new URL('/mypage/login', request.url));
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/mypage/login', request.url));
      response.cookies.delete('customer_session');
      return response;
    }
  }

  // 3. If excluded (api, admin, static, etc.), pass through
  if (isExcluded) {
    return NextResponse.next();
  }

  // 4. Check if URL already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 5. No locale in URL - determine locale and redirect
  // a. Check NEXT_LOCALE cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return NextResponse.redirect(
      new URL(`/${cookieLocale}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url)
    );
  }

  // b. Parse Accept-Language header
  const detectedLocale = getLocaleFromHeaders(request);

  // c. Redirect to detected locale
  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname === '/' ? '' : pathname}${request.nextUrl.search}`, request.url)
  );
}

export const config = {
  matcher: [
    '/((?!api|_next|admin|favicon.ico|.*\\..*).*)',
    '/mypage/:path*',
  ],
};
