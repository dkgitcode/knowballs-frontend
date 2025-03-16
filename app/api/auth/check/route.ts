import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// AUTH CHECK API ROUTE - VERIFIES IF USER IS AUTHENTICATED 🔒
export async function GET() {
  try {
    const supabase = await createClient()
    
    // GET THE CURRENT USER - THIS VALIDATES THE SESSION 🔍
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth check error:', error.message)
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message 
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No active session found'
      }, { status: 401 })
    }
    
    // VERIFY SESSION IS ACTIVE 🔐
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log("🚨 Session not found despite having user - possible token issue")
      
      // CLEAR ANY INVALID COOKIES 🍪
      cookies().delete('supabase-auth-token')
      
      return NextResponse.json({ 
        authenticated: false,
        message: 'Session expired or invalid'
      }, { status: 401 })
    }
    
    // LOG SUCCESSFUL AUTH CHECK FOR DEBUGGING 📝
    console.log(`✅ Auth check successful for user: ${user.id.substring(0, 8)}...`)
    
    // FETCH ADDITIONAL USER PROFILE DATA IF NEEDED 📋
    // Uncomment and modify if you have a profiles table
    /*
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (profileError) {
      console.error('Profile fetch error:', profileError.message)
    }
    */
    
    // RETURN USER INFO WITHOUT SENSITIVE DATA 🔐
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in: user.last_sign_in_at,
        user_metadata: user.user_metadata,
        // Include profile data if you fetched it
        // profile: profile || null
      }
    })
  } catch (error) {
    console.error('Unexpected error in auth check:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Internal server error during authentication check' 
    }, { status: 500 })
  }
}