import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// AUTH CALLBACK HANDLER - PROCESSES OAUTH AND EMAIL CONFIRMATIONS 🔄
export async function GET(request: Request) {
  // GET THE CODE FROM THE URL
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    
    // EXCHANGE CODE FOR SESSION 🔄
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL TO REDIRECT TO AFTER SIGN IN
  return NextResponse.redirect(requestUrl.origin)
} 