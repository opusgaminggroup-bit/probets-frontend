import { NextRequest, NextResponse } from 'next/server';

const TOKEN_KEY = 'probets_token';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
