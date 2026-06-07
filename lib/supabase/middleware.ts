import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Paths reachable WITHOUT an authenticated session.
 * - "/": the login home (no public signup).
 * - /api/check-reminders: cron endpoint, guarded by its own CRON_SECRET.
 */
function isPublicPath(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/api/check-reminders");
}

/** Clone `request`'s URL with a new pathname, carrying over the refreshed cookies. */
function redirectTo(
  request: NextRequest,
  pathname: string,
  fromResponse: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);
  for (const cookie of fromResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

/**
 * Standard @supabase/ssr middleware helper. Refreshes the auth session cookie
 * on every request. Unauthenticated users on protected paths go to "/" (login);
 * authenticated users landing on "/" are sent to /dashboard.
 *
 * IMPORTANT (per @supabase/ssr docs): we must return the `supabaseResponse`
 * object as-is so the refreshed cookies survive. When we redirect, we copy the
 * cookies onto the redirect response.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Do NOT run code between createServerClient and getUser — it can cause
  // hard-to-debug session refresh issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated → send to the login home (except public paths).
  if (!user && !isPublicPath(pathname)) {
    return redirectTo(request, "/", supabaseResponse);
  }

  // Already signed in but sitting on the login home → go straight to the dashboard.
  if (user && pathname === "/") {
    return redirectTo(request, "/dashboard", supabaseResponse);
  }

  return supabaseResponse;
}
