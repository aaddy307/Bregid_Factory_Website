import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login'];

const rolePaths: Record<string, string[]> = {
  owner: ['/owner/dashboard', '/owner/reports', '/owner/users'],
  manager: ['/manager/dashboard', '/manager/stock', '/manager/catalog', '/manager/users'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next();
  }

  // Check for token in cookies (set by auth service on login)
  const token = request.cookies.get('bregid_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For role-based paths, check user role from cookie
  const userCookie = request.cookies.get('bregid_user')?.value;
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const role = user.role as string;

      // Worker should not access web
      if (role === 'worker') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check if the path matches the user's role
      const allowedPaths = rolePaths[role] || [];
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

      if (!isAllowed) {
        // Redirect to correct dashboard
        const redirectPath = role === 'owner' ? '/owner/dashboard' : '/manager/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
