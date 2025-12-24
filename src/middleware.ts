import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const password = req.cookies.get('site_auth')?.value;
  const { pathname } = req.nextUrl;

  // 1. Allow access to the login page and the check-password API
  if (pathname === '/login' || pathname === '/api/verify-password') {
    return NextResponse.next();
  }

  // 2. If no password cookie is found, redirect to /login
  if (password !== process.env.SITE_PASSWORD) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 3. Only run this on your main chat pages and AI APIs
export const config = {
  matcher: ['/', '/api/chat/:path*'], 
};
