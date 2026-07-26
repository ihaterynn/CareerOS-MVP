import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the Supabase session on every request and enforces the onboarding gate.
 *
 * This is the ONLY real gate — the client-side redirect after sign-in is a convenience, not a
 * security boundary. Data access is additionally protected by RLS, so a bypass here still cannot
 * read another candidate's rows.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  // getUser() (not getSession()) — it validates the token with the auth server rather than
  // trusting a cookie that a client could have forged.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isCandidateArea = pathname.startsWith("/candidate");
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!user) {
    if (isCandidateArea || isOnboarding) return redirectTo(request, "/");
    return response;
  }

  if (isCandidateArea || isOnboarding) {
    const { data: session } = await supabase
      .from("candidate_onboarding_sessions")
      .select("completed_at, skipped_at")
      .maybeSingle();

    const finished = Boolean(session?.completed_at);
    // "Skip for now" suppresses the gate until a workspace nudge re-invites them (spec §2).
    const deferred = Boolean(session?.skipped_at);

    if (isCandidateArea && !finished && !deferred) return redirectTo(request, "/onboarding");
    if (isOnboarding && finished) return redirectTo(request, "/candidate/tracker");
  }

  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
