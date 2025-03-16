'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { signOut as serverSignOut } from '@/app/login/actions' // IMPORT SERVER ACTION FOR SIGN OUT 🚪

// DEFINE USER TYPE FOR OUR HOOK 👤
type User = {
  id: string
  email: string | null
  created_at: string
  updated_at: string
}

// DEFINE RETURN TYPE FOR OUR HOOK 🔄
type UseAuthReturn = {
  user: User | null
  isLoading: boolean
  checkAuth: () => Promise<User | null>
  forceRefresh: () => Promise<User | null>
  signOut: () => Promise<{ success: boolean; error?: string }>
}

// CLIENT-SIDE AUTH HOOK THAT USES THE API 🔒
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  // TRACK LAST CHECK TIME TO PREVENT SPAM ⏱️
  const lastCheckRef = useRef<number>(0)
  const CHECK_COOLDOWN = 1000 // 1 second cooldown
  
  // ADD A FLAG TO PREVENT AUTH CHECKS DURING SIGNOUT PROCESS 🚩
  const isSigningOutRef = useRef<boolean>(false)

  // GLOBAL AUTH CHECK TRACKING - PREVENTS MULTIPLE CALLS ACROSS COMPONENTS 🌐
  // Use a static variable outside React's render cycle to track global auth check status
  if (typeof window !== 'undefined' && !window.hasOwnProperty('__LAST_GLOBAL_AUTH_CHECK')) {
    (window as any).__LAST_GLOBAL_AUTH_CHECK = 0;
    (window as any).__GLOBAL_AUTH_CHECK_IN_PROGRESS = false;
  }

  // CHECK AUTH STATUS FROM API WITH DEBOUNCING 🔍
  const checkAuth = useCallback(async (): Promise<User | null> => {
    // SKIP AUTH CHECK IF WE'RE IN THE PROCESS OF SIGNING OUT ⚠️
    if (isSigningOutRef.current) {
      console.log("🚩 Auth check skipped - currently signing out")
      return null // Always return null during sign out
    }
    
    // GLOBAL CHECK TO PREVENT MULTIPLE SIMULTANEOUS AUTH CALLS ACROSS COMPONENTS ⚡
    if (typeof window !== 'undefined') {
      const now = Date.now();
      const lastGlobalCheck = (window as any).__LAST_GLOBAL_AUTH_CHECK || 0;
      const globalCheckInProgress = (window as any).__GLOBAL_AUTH_CHECK_IN_PROGRESS || false;
      
      // If another component is already checking auth or we checked recently, skip
      if (globalCheckInProgress) {
        console.log("🌐 Auth check skipped - another check in progress");
        return user;
      }
      
      // If we checked auth globally within the cooldown period, skip
      if (now - lastGlobalCheck < CHECK_COOLDOWN) {
        console.log("🌐 Auth check skipped - global cooldown active");
        return user;
      }
      
      // Set the global flag to prevent other components from checking
      (window as any).__GLOBAL_AUTH_CHECK_IN_PROGRESS = true;
    }
    
    // IMPLEMENT DEBOUNCING TO PREVENT EXCESSIVE API CALLS ⚠️
    const now = Date.now()
    if (now - lastCheckRef.current < CHECK_COOLDOWN) {
      console.log("⏱️ Auth check skipped - too soon since last check")
      return user // Return current user state without API call
    }
    
    // Update last check time
    lastCheckRef.current = now
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      
      if (data.authenticated && data.user) {
        setUser(data.user)
        return data.user
      } else {
        setUser(null)
        return null
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
      
      // Update global last check time and reset in-progress flag
      if (typeof window !== 'undefined') {
        (window as any).__LAST_GLOBAL_AUTH_CHECK = Date.now();
        (window as any).__GLOBAL_AUTH_CHECK_IN_PROGRESS = false;
      }
    }
  }, [user])
  
  // FORCE REFRESH AUTH STATE - BYPASS DEBOUNCING ⚡
  const forceRefresh = useCallback(async (): Promise<User | null> => {
    // SKIP FORCE REFRESH IF WE'RE IN THE PROCESS OF SIGNING OUT ⚠️
    if (isSigningOutRef.current) {
      console.log("🚩 Force refresh skipped - currently signing out")
      return null
    }
    
    console.log("⚡ Forcing auth refresh - bypassing cooldown")
    
    // Reset the cooldown timer
    lastCheckRef.current = 0
    
    // Reset global cooldown as well
    if (typeof window !== 'undefined') {
      (window as any).__LAST_GLOBAL_AUTH_CHECK = 0;
    }
    
    // Call checkAuth which will now bypass the cooldown check
    return checkAuth()
  }, [checkAuth])

  // SIGN OUT USING SERVER ACTION 🚪
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🚪 Signing out using server action...");
      
      // SET THE SIGNING OUT FLAG TO PREVENT ADDITIONAL AUTH CHECKS 🚩
      isSigningOutRef.current = true;
      
      // Clear user state immediately for better UX
      setUser(null);
      
      // Use the server action to sign out
      const result = await serverSignOut();
      
      // Handle the result from the server action
      if (result && result.success) {
        console.log("✅ Sign out successful on client side");
        
        // DELAY NAVIGATION SLIGHTLY TO PREVENT RACE CONDITIONS ⏱️
        // Use a single navigation attempt with a flag to prevent duplicates
        let hasNavigated = false;
        
        setTimeout(() => {
          if (!hasNavigated) {
            hasNavigated = true;
            console.log("🧭 Navigating to login page after successful sign out");
            // Navigate to login page on the client side
            window.location.href = '/login';
          }
        }, 500);
        
        return { success: true };
      } else {
        const errorMessage = result?.error || 'Unknown error during sign out';
        console.error("🚨 Sign out failed:", errorMessage);
        
        // RESET THE SIGNING OUT FLAG IF SIGN OUT FAILED
        isSigningOutRef.current = false;
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Sign out error:', errorMessage);
      
      // RESET THE SIGNING OUT FLAG IF SIGN OUT FAILED
      isSigningOutRef.current = false;
      
      return { success: false, error: errorMessage };
    }
  };

  // CHECK AUTH STATUS ON MOUNT - ONLY ONCE 🚀
  useEffect(() => {
    // SKIP INITIAL AUTH CHECK IF WE'RE IN THE PROCESS OF SIGNING OUT
    if (!isSigningOutRef.current) {
      checkAuth()
    }
    // We intentionally don't include checkAuth in the dependency array
    // to prevent it from running multiple times
  }, [])

  return {
    user,
    isLoading,
    checkAuth,
    forceRefresh,
    signOut
  }
} 