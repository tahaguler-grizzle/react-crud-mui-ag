import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(request.nextUrl.pathname)
  ) {
    return;
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale && cookieLocale !== 'en' && request.nextUrl.locale === 'en') {
    return NextResponse.redirect(
      new URL(`/${cookieLocale}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url)
    );
  }
}
