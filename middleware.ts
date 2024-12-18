import { type NextRequest, NextResponse } from "next/server";
import { protectedRouteGuard } from "@/features/auth/middleware/auth-middleware";
import { hasRole } from "@/features/auth/utils/role-utils";

export async function middleware(request: NextRequest) {
  const result = await protectedRouteGuard(request);
  
  if (result instanceof NextResponse) {
    return result;
  }

  const { user, response } = result;

  // Check for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (user.error || !user.data.user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const isUserAdmin = await hasRole(user.data.user.id, "admin");
    if (!isUserAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
