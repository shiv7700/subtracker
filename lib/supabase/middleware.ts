import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Paths reachable WITHOUT an authenticated session.
 * - /login: the only entry point (no public signup).
 * - /api/check-reminders: cron endpoint, guarded by its own CRON_SECRET.
 */
function isPublicPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/api/check-reminders");
}

/**
 * Standard @supabase/ssr middleware helper. Refreshes the auth session cookie
 * on every request and, for protected paths, redirects unauthenticated users
 * to /login.
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

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    // Preserve the refreshed auth cookies on the redirect.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return supabaseResponse;
}
