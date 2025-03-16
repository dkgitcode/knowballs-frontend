'use client'

import { useState, useEffect } from 'react'
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
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
}

// CLIENT-SIDE AUTH HOOK THAT USES THE API 🔒
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // CHECK AUTH STATUS FROM API 🔍
  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      
      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

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

  // CHECK AUTH STATUS ON MOUNT 🚀
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    isLoading,
    checkAuth,
    signOut
  }
} 