import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from './lib/auth'

export async function proxy(request: NextRequest) {
    const { user } = await validateRequest()

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')

    if (isAuthPage) {
        if (user) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
