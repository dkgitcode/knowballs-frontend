import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// API ROUTE FOR SIGNOUT 🚪
export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/login', request.url))
} 