import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// API ROUTE FOR SIGNUP 📝
export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return NextResponse.redirect(new URL('/signup?error=Email and password are required', request.url))
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(error.message)}`, request.url))
  }

  // Redirect to check email page
  return NextResponse.redirect(new URL('/check-email', request.url))
} 