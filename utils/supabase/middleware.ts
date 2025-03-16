import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // This will set cookies on the browser
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // This will set cookies on the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // This will delete cookies on the browser
          request.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
          // This will delete cookies on the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // IMPORTANT! 🚨 ALWAYS GET USER FROM SUPABASE AUTH
  // This validates the user's session and refreshes it if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not signed in and the current path is not /login or /auth,
  // redirect the user to /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/check-email')
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is signed in and the current path is /login,
  // redirect the user to / (home page)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// CREATE CLIENT FUNCTION FOR MIDDLEWARE 🔄
export function createClient(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // This will set cookies on the browser
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // This will set cookies on the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // This will delete cookies on the browser
          request.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
          // This will delete cookies on the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  return { supabase, response }
}