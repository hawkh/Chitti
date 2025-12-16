import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/detection') ||
        request.nextUrl.pathname.startsWith('/unified-detection') ||
        request.nextUrl.pathname.startsWith('/admin')

    // Redirect to dashboard if already logged in and visiting auth pages
    if (isAuthPage && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect to sign in if not logged in and visiting protected routes
    if (isProtectedRoute && !session) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/detection/:path*',
        '/unified-detection/:path*',
        '/admin/:path*',
        '/auth/:path*',
    ],
}
