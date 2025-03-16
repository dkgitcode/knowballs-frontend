import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// API ROUTE FOR LOGIN 🔐
export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=Email and password are required', request.url))
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
} 