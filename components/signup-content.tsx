"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect } from "react"
import { useSidebarStore } from "@/components/sidebar"

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface SignupContentProps {
  error?: string;
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function SignupContent({ 
  error,
  onResetRef
}: SignupContentProps) {
  
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()

  // RESET FUNCTION FOR SIDEBAR INTEGRATION 🔄
  const resetSignup = () => {
    // Reset to default state if needed
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetSignup;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef]);

  // HANDLE SIGNUP ACTION 🔐
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
              <h1 className="text-4xl font-bold mb-4">Create an Account</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Enter your email below to create your account
              </p>
            </div>

            {/* SIGNUP FORM WITH SERVER ACTIONS 📝 */}
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
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
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
                  <Button type="submit" formAction={handleSignup} className="w-full">
                    Create Account
                  </Button>
                </div>
              </form>
              
              <div className="text-center text-sm mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
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