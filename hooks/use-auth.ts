'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

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
  signOut: () => Promise<void>
}

// CLIENT-SIDE AUTH HOOK THAT USES THE API 🔒
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  // TRACK LAST CHECK TIME TO PREVENT SPAM ⏱️
  const lastCheckRef = useRef<number>(0)
  const CHECK_COOLDOWN = 1000 // 1 second cooldown

  // CHECK AUTH STATUS FROM API WITH DEBOUNCING 🔍
  const checkAuth = useCallback(async (): Promise<User | null> => {
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
    }
  }, [user])
  
  // FORCE REFRESH AUTH STATE - BYPASS DEBOUNCING ⚡
  const forceRefresh = useCallback(async (): Promise<User | null> => {
    console.log("⚡ Forcing auth refresh - bypassing cooldown")
    
    // Reset the cooldown timer
    lastCheckRef.current = 0
    
    // Call checkAuth which will now bypass the cooldown check
    return checkAuth()
  }, [checkAuth])

  // SIGN OUT USING API ROUTE 🚪
  const signOut = async () => {
    try {
      // Create a form to submit to the API route
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/auth/signout'
      document.body.appendChild(form)
      form.submit()
      
      // Clear user state
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // CHECK AUTH STATUS ON MOUNT - ONLY ONCE 🚀
  useEffect(() => {
    checkAuth()
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