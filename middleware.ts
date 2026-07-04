import { NextRequest, NextResponse } from "next/server"
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const valid = await isValidSessionToken(token)

  if (!valid) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
