import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionId = request.cookies.get("auth_session")?.value ?? null;
    const { pathname } = request.nextUrl;

    // Protected routes
    const isProtectedRoute = pathname === "/dashboard" || pathname === "/";
    // Auth routes
    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    if (isProtectedRoute && !sessionId) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthRoute && sessionId) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
