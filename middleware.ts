import { createClient } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MIDDLEWARE FOR AUTHENTICATION CHECKS 🔒
export async function middleware(request: NextRequest) {
  // CREATE SUPABASE CLIENT FOR AUTH CHECKS
  const { supabase, response } = createClient(request)

  // GET THE CURRENT USER - THIS VALIDATES THE SESSION 🔍
  const { data: { user } } = await supabase.auth.getUser()

  // HANDLE PROTECTED ROUTES - REDIRECT TO LOGIN IF NOT AUTHENTICATED 🚪
  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // HANDLE AUTH ROUTES - REDIRECT TO HOME IF ALREADY AUTHENTICATED 🏠
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/signup')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

// SPECIFY WHICH ROUTES THIS MIDDLEWARE SHOULD RUN ON 🛣️
export const config = {
  matcher: ['/profile/:path*', '/login', '/signup'],
}