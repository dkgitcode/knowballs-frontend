'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// LOGIN ACTION - HANDLES USER SIGN IN 🔐
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    // Return early with an error message that will be displayed by the form
    return redirect('/login?error=Email and password are required')
  }

  const supabase = await createClient()
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Return early with an error message that will be displayed by the form
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // ENSURE SESSION IS PROPERLY SET IN COOKIES 🍪
  if (data?.session) {
    // Store the session in cookies to ensure it persists
    const cookieStore = await cookies()
    cookieStore.set('supabase-auth-token', JSON.stringify(data.session), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  // FORCE REVALIDATION OF ALL PATHS TO REFRESH DATA 🔄
  revalidatePath('/', 'layout')
  
  // REDIRECT TO HOME PAGE 🏠
  redirect('/')
}

// SIGNUP ACTION - HANDLES NEW USER REGISTRATION 📝
export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    // Return early with an error message that will be displayed by the form
    return redirect('/signup?error=Email and password are required')
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
    // Return early with an error message that will be displayed by the form
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Redirect to check email page
  redirect('/check-email')
}

// SIGNOUT ACTION - HANDLES USER LOGOUT 🚪
export async function signOut() {
  console.log("🚪 Server action: Signing out user...");
  
  try {
    const supabase = await createClient()
    
    // PREVENT MULTIPLE SIGN OUT ATTEMPTS BY CHECKING COOKIES FIRST 🍪
    const cookieStore = await cookies()
    const hasAuthCookie = cookieStore.has('supabase-auth-token')
    
    if (!hasAuthCookie) {
      console.log("⚠️ Server action: No auth cookie found, user might already be signed out");
      return { success: true };
    }
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("🚨 Server action sign out error:", error.message);
      return { success: false, error: error.message };
    }
    
    // CLEAR AUTH COOKIES 🍪
    cookieStore.delete('supabase-auth-token')
    
    // FORCE REVALIDATION OF ALL PATHS TO REFRESH DATA 🔄
    revalidatePath('/', 'layout')
    
    console.log("✅ Server action: User signed out successfully");
    
    // Return success instead of redirecting
    return { success: true };
  } catch (error) {
    console.error("🚨 Unexpected error in signOut server action:", error);
    return { success: false, error: 'An unexpected error occurred' };
  }
} 