"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useSidebarStore } from "@/components/sidebar"
import { login, signup } from "@/app/login/actions" // IMPORT SERVER ACTIONS DIRECTLY ✨
import { useRouter } from "next/navigation" // IMPORT ROUTER FOR NAVIGATION 🧭
import { Loader2 } from "lucide-react" // IMPORT LOADER ICON FOR LOADING STATES ⏳

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface LoginContentProps {
  error?: string;
}

export default function LoginContent({ error }: LoginContentProps) {
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()
  
  // GET ROUTER FOR NAVIGATION 🧭
  const router = useRouter()
  
  // ADD LOADING STATES FOR BUTTONS ⏳
  const [isLoading, setIsLoading] = useState(false)
  const [actionType, setActionType] = useState<'login' | 'signup' | null>(null)

  // CUSTOM FORM SUBMISSION HANDLERS 📝
  const handleLogin = async (formData: FormData) => {
    // PREVENT SUBMISSION WHILE LOADING ⚠️
    if (isLoading) return;
    
    // SET LOADING STATE ⏳
    setIsLoading(true);
    setActionType('login');
    
    try {
      console.log("🚀 LOGGING IN...");
      await login(formData);
      
      // DISPATCH LOGIN SUCCESS EVENT TO UPDATE SIDEBAR 🔄
      const loginSuccessEvent = new CustomEvent('loginSuccessRefresh');
      window.dispatchEvent(loginSuccessEvent);
      
      // NAVIGATE PROGRAMMATICALLY AFTER LOGIN ✅
      router.push('/');
      router.refresh(); // Force a refresh to update the UI
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error);
      
      // HANDLE NEXT_REDIRECT ERROR SPECIALLY - THIS MEANS LOGIN SUCCEEDED! 🎉
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        console.log("✅ LOGIN SUCCESSFUL! Handling redirect...");
        
        // DISPATCH LOGIN SUCCESS EVENT TO UPDATE SIDEBAR 🔄
        const loginSuccessEvent = new CustomEvent('loginSuccessRefresh');
        window.dispatchEvent(loginSuccessEvent);
        
        // NAVIGATE PROGRAMMATICALLY AFTER LOGIN ✅
        router.push('/');
        router.refresh(); // Force a refresh to update the UI
        return; // Exit early since this is actually a success case
      }
      
      // ONLY SHOW ALERT FOR ACTUAL ERRORS ⚠️
      alert("Login failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };
  
  const handleSignup = async (formData: FormData) => {
    // PREVENT SUBMISSION WHILE LOADING ⚠️
    if (isLoading) return;
    
    // SET LOADING STATE ⏳
    setIsLoading(true);
    setActionType('signup');
    
    try {
      console.log("🚀 SIGNING UP...");
      await signup(formData);
      
      // DISPATCH LOGIN SUCCESS EVENT TO UPDATE SIDEBAR 🔄
      const loginSuccessEvent = new CustomEvent('loginSuccessRefresh');
      window.dispatchEvent(loginSuccessEvent);
      
      // NAVIGATE PROGRAMMATICALLY AFTER SIGNUP ✅
      router.push('/');
      router.refresh(); // Force a refresh to update the UI
    } catch (error) {
      console.error("❌ SIGNUP ERROR:", error);
      
      // HANDLE NEXT_REDIRECT ERROR SPECIALLY - THIS MEANS SIGNUP SUCCEEDED! 🎉
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        console.log("✅ SIGNUP SUCCESSFUL! Handling redirect...");
        
        // DISPATCH LOGIN SUCCESS EVENT TO UPDATE SIDEBAR 🔄
        const loginSuccessEvent = new CustomEvent('loginSuccessRefresh');
        window.dispatchEvent(loginSuccessEvent);
        
        // NAVIGATE PROGRAMMATICALLY AFTER SIGNUP ✅
        router.push('/');
        router.refresh(); // Force a refresh to update the UI
        return; // Exit early since this is actually a success case
      }
      
      // ONLY SHOW ALERT FOR ACTUAL ERRORS ⚠️
      alert("Signup failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-muted-foreground text-lg">
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
                  <Button 
                    type="submit" 
                    formAction={handleLogin} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {actionType === 'login' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button 
                    type="submit" 
                    formAction={handleSignup} 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {actionType === 'signup' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="text-center text-sm mt-6">
                Don&apos;t have an account?{' '}
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