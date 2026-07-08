import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { resolvePostAuthRedirect } from "@/domains/accounts/account-guard";
import type { AccountStatus } from "@/domains/accounts/types";
import type { OnboardingStep } from "@/domains/profile/types";

const APP_PREFIXES = [
  "/discover",
  "/connections",
  "/messages",
  "/play",
  "/teammates",
  "/onboarding",
  "/profile",
  "/settings",
  "/admin",
];

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const { data: account } = await supabase
      .from("accounts")
      .select("id, status")
      .eq("auth_user_id", user.id)
      .maybeSingle<{ id: string; status: AccountStatus }>();

    let profile: {
      onboarding_step: OnboardingStep;
      onboarding_completed_at: string | null;
    } | null = null;

    if (account?.id) {
      const { data: profileRow } = await supabase
        .from("gamer_profiles")
        .select("onboarding_step, onboarding_completed_at")
        .eq("account_id", account.id)
        .maybeSingle<{
          onboarding_step: OnboardingStep;
          onboarding_completed_at: string | null;
        }>();
      profile = profileRow;
    }

    const next = request.nextUrl.searchParams.get("next");
    const destination = resolvePostAuthRedirect(account, profile, next);
    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
