"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSidebarStore } from "@/components/sidebar"
import { useRouter } from "next/navigation"

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface LoginContentProps {
  error?: string;
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function LoginContent({ 
  error,
  onResetRef
}: LoginContentProps) {
  const router = useRouter()
  
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()

  // RESET FUNCTION FOR SIDEBAR INTEGRATION 🔄
  const resetLogin = () => {
    // Reset to default state if needed
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetLogin;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef]);

  // HANDLE LOGIN AND SIGNUP ACTIONS 🔐
  const handleLogin = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      // Submit the form to the server action
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/auth/login'
      
      const emailInput = document.createElement('input')
      emailInput.name = 'email'
      emailInput.value = email
      form.appendChild(emailInput)
      
      const passwordInput = document.createElement('input')
      passwordInput.name = 'password'
      passwordInput.value = password
      form.appendChild(passwordInput)
      
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Login error:', error)
    }
  }
  
  const handleSignup = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      // Submit the form to the server action
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/auth/signup'
      
      const emailInput = document.createElement('input')
      emailInput.name = 'email'
      emailInput.value = email
      form.appendChild(emailInput)
      
      const passwordInput = document.createElement('input')
      passwordInput.name = 'password'
      passwordInput.value = password
      form.appendChild(passwordInput)
      
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER INSTEAD OF TRIM ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Enter your credentials to sign in to your account
              </p>
            </div>

            {/* LOGIN FORM WITH SERVER ACTIONS 📝 */}
            <div className="border border-border rounded-xl p-8 bg-card">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none">
                      Password
                    </label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col space-y-2 pt-2">
                  <Button type="submit" formAction={handleLogin} className="w-full">
                    Sign In
                  </Button>
                  <Button type="submit" formAction={handleSignup} variant="outline" className="w-full">
                    Create Account
                  </Button>
                </div>
              </form>
              
              <div className="text-center text-sm mt-6">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PADDING FOR MOBILE NAV BAR 📱 */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 