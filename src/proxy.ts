import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

// next-intl middleware handles locale routing
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route guard ──────────────────────────────────────────────────────
  // Match /:locale/admin and any sub-paths
  const isAdminRoute = /^\/(pl|en)\/admin(\/.*)?$/.test(pathname);

  if (isAdminRoute) {
    let response = NextResponse.next({ request });

    // Build a server-side Supabase client that reads cookies from this request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const locale = pathname.startsWith('/en') ? 'en' : 'pl';
      const loginPath = `/${locale}/admin`;
      
      // Allow access to the root admin path (where the login form is) without redirect
      // This prevents the infinite redirect loop
      if (pathname !== loginPath && pathname !== `${loginPath}/`) {
        const loginUrl = new URL(loginPath, request.url);
        loginUrl.searchParams.set('unauthorized', '1');
        return NextResponse.redirect(loginUrl);
      }
    }

    return response;
  }
  // ────────────────────────────────────────────────────────────────────────────

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/',
    '/(pl|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};
