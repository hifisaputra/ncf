import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const protectedRoutes = ["/admin", "/dashboard"];
	const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"];

	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isAuthRoute = authRoutes.includes(pathname);

	if (isProtectedRoute || isAuthRoute) {
		try {
			const sessionResponse = await fetch(
				new URL("/api/auth/get-session", request.url),
				{
					method: "GET",
					headers: {
						cookie: request.headers.get("cookie") || "",
					},
				},
			);

			const isAuthenticated = sessionResponse.ok;
			let sessionData: { session?: { userId?: string } } | null = null;

			if (isAuthenticated) {
				try {
					sessionData = await sessionResponse.json();
					if (!sessionData?.session?.userId) {
						sessionData = null;
					}
				} catch {
					sessionData = null;
				}
			}

			if (isProtectedRoute && !sessionData) {
				const redirectUrl = request.nextUrl.clone();
				redirectUrl.pathname = "/sign-in";
				return NextResponse.redirect(redirectUrl);
			}

			if (isAuthRoute && sessionData) {
				const redirectUrl = request.nextUrl.clone();
				redirectUrl.pathname = "/";
				return NextResponse.redirect(redirectUrl);
			}
		} catch (error) {
			console.error("Middleware error:", error);

			if (isProtectedRoute) {
				const redirectUrl = request.nextUrl.clone();
				redirectUrl.pathname = "/sign-in";
				return NextResponse.redirect(redirectUrl);
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin/:path*",
		"/dashboard/:path*",
		"/sign-in",
		"/sign-up",
		"/forgot-password",
	],
};
