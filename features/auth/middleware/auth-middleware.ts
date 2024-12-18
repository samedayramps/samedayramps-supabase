import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasRole } from "../utils/role-utils";

export const handleAuthSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, response, supabase, error };
};

export const protectedRouteGuard = async (request: NextRequest) => {
  const { user, response, error } = await handleAuthSession(request);
  const pathname = request.nextUrl.pathname;

  // Handle authentication
  if (pathname.startsWith("/protected") && error) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    if (error || !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const isUserAdmin = await hasRole(user.id, "admin");
    if (!isUserAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Handle manager routes
  if (pathname.startsWith("/manager")) {
    if (error || !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const isUserManager = await hasRole(user.id, "manager");
    if (!isUserManager) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname === "/" && !error) {
    return NextResponse.redirect(new URL("/protected", request.url));
  }

  return { user: { data: { user }, error }, response };
}; 